import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/formatters'
import { AlertTriangle, Clock, CheckCircle, BellOff, ArrowRight, ShieldAlert, Info } from 'lucide-react'
import PageHeader from '../components/shared/PageHeader'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const ALERT_CONFIG = {
    OVERDUE_MAINTENANCE: { icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', label: 'Overdue Maintenance' },
    UPCOMING_MAINTENANCE: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', label: 'Upcoming Maintenance' },
    LOW_CONDITION: { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', label: 'Critical Condition' },
    CRITICAL_STATUS: { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', label: 'Critical Status' },
    HIGH_RISK: { icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', label: 'High Risk Profile' },
}

const SEV_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }
const SEV_STYLE = {
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-slate-50 text-slate-700 border-slate-200'
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
    }

    const markAllRead = async () => {
        const unreadIds = alerts.filter(a => !a.is_read).map(a => a.id)
        if (!unreadIds.length) return
        const { error } = await supabase.from('alerts').update({ is_read: true }).in('id', unreadIds)
        if (error) { toast.error(error.message); return }
        setAlerts(alerts.map(a => ({ ...a, is_read: true })))
        toast.success('All system logs acknowledged')
    }

    if (alerts.length === 0) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                <PageHeader title="Incident Logs" subtitle="Manage and monitor centralized system alerts and infrastructure notifications." />
                <Card className="border-slate-200/60 border-dashed bg-slate-50/50">
                    <CardContent className="p-24 text-center space-y-6">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-slate-200">
                            <BellOff size={40} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[18px] font-bold text-slate-900 leading-tight">Registry Nominal</p>
                            <p className="text-[14px] text-slate-500 font-medium max-w-xs mx-auto">No active infrastructure incidents detected at this time.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="System Notifications"
                subtitle={`Live operational telemetry and maintenance requirements. ${unread} unacknowledged records.`}
                actions={
                    unread > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllRead} className="rounded-xl border-slate-200 font-bold text-xs h-11 px-6 uppercase tracking-widest shadow-sm">
                            <CheckCircle size={16} className="mr-2" /> Acknowledge All
                        </Button>
                    )
                }
            />

            <div className="space-y-12">
                {['HIGH', 'MEDIUM', 'LOW'].map(sev => {
                    const group = bySeverity[sev]
                    if (!group.length) return null
                    return (
                        <div key={sev} className="space-y-5">
                            <div className="flex items-center gap-4 px-2">
                                <Badge variant="outline" className={cn("px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase shadow-none border tracking-widest leading-none", SEV_STYLE[sev])}>
                                    {sev} Priority Log
                                </Badge>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {group.length} Active Notice{group.length > 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {group.map(alert => {
                                    const cfg = ALERT_CONFIG[alert.alert_type] || ALERT_CONFIG.HIGH_RISK
                                    const Icon = cfg.icon
                                    return (
                                        <Card key={alert.id} className={cn(
                                            "border-slate-200 shadow-sm transition-all duration-200 overflow-hidden bg-white",
                                            alert.is_read ? 'opacity-50 grayscale-[0.5]' : 'hover:border-slate-300 hover:shadow-md',
                                            !alert.is_read && sev === 'HIGH' && "border-l-4 border-l-rose-500"
                                        )}>
                                            <CardContent className="p-0">
                                                <div className="flex items-start gap-6 p-7">
                                                    <div className={cn("p-4 rounded-xl shrink-0 border-2", cfg.bg, cfg.color)}>
                                                        <Icon size={24} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-6">
                                                            <p className="text-[16px] font-bold text-slate-900 leading-snug tracking-tight">
                                                                {alert.message}
                                                            </p>
                                                            <span className="text-xs font-bold text-slate-400 tabular-nums whitespace-nowrap pt-1 uppercase tracking-tighter">
                                                                {formatDate(alert.created_at)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-6 mt-4">
                                                            <button
                                                                onClick={() => navigate(`/assets/${alert.asset_id}`)}
                                                                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                                                            >
                                                                Review Entity Profile <ArrowRight size={14} />
                                                            </button>
                                                            <div className="h-4 w-[1px] bg-slate-200" />
                                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                                                Registry ID: {alert.asset_id.split('-')[0].toUpperCase()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 shrink-0 self-center">
                                                        {!alert.is_read ? (
                                                            <Button variant="ghost" size="sm" onClick={() => markRead(alert.id)} className="rounded-xl h-11 px-6 text-xs font-bold text-slate-600 hover:bg-slate-50 border-2 border-slate-100 hover:border-slate-200 uppercase tracking-widest shadow-sm">
                                                                Acknowledge
                                                            </Button>
                                                        ) : (
                                                            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                                                <CheckCircle size={14} className="text-emerald-600" />
                                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">Acknowledged</span>
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

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 pt-12 pb-8 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    <Info size={18} className="text-slate-300" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Registry integrity verified. Operational logs synced to central database.</p>
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] order-first md:order-last">System Rev: 4.2.0-C</div>
            </div>
        </div>
    )
}
