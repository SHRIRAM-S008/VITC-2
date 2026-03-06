import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/formatters'
import { AlertTriangle, Clock, Wrench, CheckCircle, BellOff, ArrowRight, ShieldAlert, Info, Megaphone } from 'lucide-react'
import PageHeader from '../components/shared/PageHeader'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

const ALERT_CONFIG = {
    OVERDUE_MAINTENANCE: { icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50/50 border-rose-100', label: 'Overdue Maintenance' },
    UPCOMING_MAINTENANCE: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100', label: 'Upcoming Maintenance' },
    LOW_CONDITION: { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50/50 border-rose-100', label: 'Critical Condition' },
    CRITICAL_STATUS: { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50/50 border-rose-100', label: 'Critical Status' },
    HIGH_RISK: { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100', label: 'High Risk Profile' },
}

const SEV_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }
const SEV_STYLE = {
    HIGH: 'bg-rose-600 text-white border-transparent',
    MEDIUM: 'bg-amber-500 text-white border-transparent',
    LOW: 'bg-slate-500 text-white border-transparent'
}

export default function AlertsPage() {
    const navigate = useNavigate()
    const { alerts, setAlerts } = useStore()

    const sorted = [...alerts].sort((a, b) => {
        const sdiff = (SEV_ORDER[a.severity] ?? 3) - (SEV_ORDER[b.severity] ?? 3)
        if (sdiff !== 0) return sdiff
        return new Date(b.created_at) - new Date(a.created_at)
    })

    const unread = alerts.filter(a => !a.is_read).length
    const bySeverity = { HIGH: [], MEDIUM: [], LOW: [] }
    sorted.forEach(a => { if (bySeverity[a.severity]) bySeverity[a.severity].push(a) })

    const markRead = async (alertId) => {
        const { error } = await supabase.from('alerts').update({ is_read: true }).eq('id', alertId)
        if (error) { toast.error(error.message); return }
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, is_read: true } : a))
        toast.dismiss(); // Clean up if needed
    }

    const markAllRead = async () => {
        const unreadIds = alerts.filter(a => !a.is_read).map(a => a.id)
        if (!unreadIds.length) return
        const { error } = await supabase.from('alerts').update({ is_read: true }).in('id', unreadIds)
        if (error) { toast.error(error.message); return }
        setAlerts(alerts.map(a => ({ ...a, is_read: true })))
        toast.success('System logs cleared: All alerts marked as read')
    }

    if (alerts.length === 0) {
        return (
            <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                <PageHeader title="Incident Response" subtitle="Centralized system alerts and operational notifications." />
                <Card className="border-slate-200/60 border-dashed bg-slate-50/50">
                    <CardContent className="p-24 text-center space-y-4">
                        <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-slate-200">
                            <BellOff size={32} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">All Clear</p>
                            <p className="text-xs text-slate-500 font-medium">No critical infrastructure incidents detected at this time.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Operational Alerts"
                subtitle={`Live feed of infrastructure anomalies and maintenance requirements. ${unread} pending.`}
                actions={
                    unread > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllRead} className="rounded-xl border-slate-200 font-bold uppercase text-[10px] tracking-widest">
                            <CheckCircle size={14} className="mr-2" /> Mark Universe Read
                        </Button>
                    )
                }
            />

            <div className="space-y-10">
                {['HIGH', 'MEDIUM', 'LOW'].map(sev => {
                    const group = bySeverity[sev]
                    if (!group.length) return null
                    return (
                        <div key={sev} className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <Badge className={cn("px-2 py-0.5 rounded-lg font-black text-[10px] tracking-widest uppercase shadow-none", SEV_STYLE[sev])}>
                                    {sev} Priority
                                </Badge>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    {group.length} system detection{group.length > 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {group.map(alert => {
                                    const cfg = ALERT_CONFIG[alert.alert_type] || ALERT_CONFIG.HIGH_RISK
                                    const Icon = cfg.icon
                                    return (
                                        <Card key={alert.id} className={cn(
                                            "border-slate-200/60 transition-all duration-300 group overflow-hidden",
                                            alert.is_read ? 'opacity-40 grayscale-[0.5]' : 'hover:shadow-md hover:border-slate-300 shadow-sm',
                                            !alert.is_read && sev === 'HIGH' && "border-l-4 border-l-rose-500"
                                        )}>
                                            <CardContent className="p-0">
                                                <div className="flex items-start gap-4 p-5">
                                                    <div className={cn("p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110 shadow-sm border border-white/20", cfg.bg, cfg.color)}>
                                                        <Icon size={18} />
                                                    </div>
                                                    <div className="flex-1 min-w-0 py-0.5">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <p className="text-sm font-bold text-slate-900 leading-snug tracking-tight uppercase underline decoration-slate-100 underline-offset-4">
                                                                {alert.message}
                                                            </p>
                                                            <span className="text-[10px] font-black tabular-nums text-slate-400 whitespace-nowrap">
                                                                {formatDate(alert.created_at)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                onClick={() => navigate(`/assets/${alert.asset_id}`)}
                                                                className="h-auto p-0 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors tracking-widest group/btn"
                                                            >
                                                                Investigate Asset <ArrowRight size={10} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                                            </Button>
                                                            <div className="h-3 w-[1px] bg-slate-200" />
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                REF: {alert.asset_id.split('-')[0]}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="ml-2 shrink-0 self-center">
                                                        {!alert.is_read ? (
                                                            <Button variant="ghost" size="sm" onClick={() => markRead(alert.id)} className="rounded-xl h-8 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100">
                                                                Acknowledge
                                                            </Button>
                                                        ) : (
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl">
                                                                <CheckCircle size={10} className="text-slate-400" />
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="flex items-center justify-between px-2 pt-6">
                <div className="flex items-center gap-2">
                    <Megaphone size={14} className="text-rose-400 animate-pulse" />
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Protocol: SCIS-CODE-RED-v1.0</p>
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase">Operational Security Priority Matrix</div>
            </div>
        </div>
    )
}
