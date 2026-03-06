import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { formatDate, isOverdue } from '../lib/formatters'
import { StatusBadge, RiskBadge, ConditionBar } from '../components/shared/Badge'
import PageHeader from '../components/shared/PageHeader'
import { toast } from 'sonner'
import {
    ArrowLeft, Pencil, Trash2, MapPin, Calendar, Wrench,
    ClipboardList, AlertTriangle, CheckCircle, Plus, X, Save,
    History, Info, FileText, HardHat, ExternalLink, Activity,
    ShieldCheck, Clock, User
} from 'lucide-react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const MAINT_TYPES = ['Routine Inspection', 'Emergency Repair', 'Scheduled Maintenance', 'Upgrade', 'Decommission']

export default function AssetDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { assets, setAssets, getAssetLogs, maintenanceLogs, setMaintenanceLogs } = useStore()
    const asset = assets.find(a => a.id === id)
    const [activeTab, setActiveTab] = useState('overview')
    const [showMaintModal, setShowMaintModal] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [historyLog, setHistoryLog] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const logs = getAssetLogs(id)

    // Maintenance form state
    const [maintForm, setMaintForm] = useState({
        maintenance_date: new Date().toISOString().slice(0, 10),
        maintenance_type: 'Routine Inspection',
        performed_by: '',
        condition_after: '',
        notes: ''
    })
    const [savingMaint, setSavingMaint] = useState(false)

    useEffect(() => {
        if (activeTab === 'history') {
            setLoadingHistory(true)
            supabase.from('history_log').select('*').eq('asset_id', id)
                .order('created_at', { ascending: false })
                .then(({ data }) => {
                    setHistoryLog(data || [])
                    setLoadingHistory(false)
                })
        }
    }, [activeTab, id])

    if (!asset) {
        return (
            <div className="p-12 max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
                <Card className="w-full text-center border-dashed border-slate-200 bg-slate-50/50">
                    <CardContent className="p-12 space-y-4">
                        <AlertTriangle size={48} className="mx-auto text-slate-200" />
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-black uppercase text-slate-900">Entity Not Found</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">The requested infrastructure asset could not be retrieved from the central registry.</CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => navigate('/assets')} className="rounded-xl border-slate-200">
                            Return to Registry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleDelete = async () => {
        if (!window.confirm(`Permanently decommission "${asset.name}"? This action is logged and final.`)) return
        setDeleting(true)
        const { error } = await supabase.from('assets').delete().eq('id', id)
        if (error) { toast.error(error.message); setDeleting(false); return }

        await supabase.from('history_log').insert({
            asset_id: id, action_type: 'DELETE',
            new_values: {}, changed_fields: [], performed_by: 'Admin'
        })

        setAssets(assets.filter(a => a.id !== id))
        toast.success(`Asset ${id} successfully purged from live registry.`)
        navigate('/assets')
    }

    const handleMaintSubmit = async (e) => {
        e.preventDefault()
        if (!maintForm.performed_by.trim()) { toast.error('Authorized inspector name is mandatory'); return }
        setSavingMaint(true)

        const payload = {
            asset_id: id,
            ...maintForm,
            condition_after: maintForm.condition_after ? parseInt(maintForm.condition_after) : null
        }

        const { data, error } = await supabase.from('maintenance_logs').insert(payload).select().single()
        if (error) { toast.error(error.message); setSavingMaint(false); return }

        setMaintenanceLogs([data, ...maintenanceLogs])
        toast.success('System log updated: Maintenance event recorded.')
        setShowMaintModal(false)
        setSavingMaint(false)
        setMaintForm({
            maintenance_date: new Date().toISOString().slice(0, 10),
            maintenance_type: 'Routine Inspection',
            performed_by: '',
            condition_after: '',
            notes: ''
        })
    }

    const age = new Date().getFullYear() - (asset.install_year || new Date().getFullYear())

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Nav Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div className="space-y-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-900 -ml-2 h-8 font-black uppercase tracking-widest text-[10px]">
                        <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Registry
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                                {asset.categories?.icon || <Activity className="text-white" size={20} />}
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{asset.name}</h1>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={12} className="text-slate-300" /> {asset.address || 'Location Coordinates Pending'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate(`/assets/${id}/edit`)} className="rounded-xl border-slate-200 font-bold uppercase text-[10px] tracking-widest">
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Configuration
                    </Button>
                    <Button variant="outline" onClick={handleDelete} disabled={deleting} className="rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50 font-bold uppercase text-[10px] tracking-widest">
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> {deleting ? 'Purging...' : 'Decommission'}
                    </Button>
                </div>
            </div>

            {/* Visual Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 text-white shadow-xl shadow-slate-200 border-none px-6 py-4 flex flex-col justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Registration ID</div>
                    <div className="font-mono text-lg font-black tracking-tighter text-white/90 truncate">{asset.id}</div>
                </Card>

                <Card className="bg-white border-slate-200/60 shadow-sm px-6 py-4 flex flex-col justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Operations</div>
                    <div className="mt-4"><StatusBadge status={asset.status} /></div>
                </Card>

                <Card className="bg-white border-slate-200/60 shadow-sm px-6 py-4 flex flex-col justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Safety Profile</div>
                    <div className="mt-4"><RiskBadge label={asset.risk_label} /></div>
                </Card>

                <Card className="bg-white border-slate-200/60 shadow-sm px-6 py-4 flex flex-col justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Score</div>
                    <div className="mt-4 flex items-end gap-1">
                        <span className="text-3xl font-black text-slate-900 leading-none">{asset.risk_score}</span>
                        <span className="text-[10px] font-bold text-slate-400 mb-1">/100</span>
                    </div>
                </Card>
            </div>

            <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-50 border border-slate-200 p-1 h-12 rounded-2xl w-full md:w-auto">
                    <TabsTrigger value="overview" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Info size={14} className="mr-2" /> Global Profile
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Wrench size={14} className="mr-2" /> Incident Log
                        {logs.length > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1 bg-slate-200/50 text-slate-600 font-black text-[9px] border-none shadow-none">
                                {logs.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <History size={14} className="mr-2" /> Audit Trail
                    </TabsTrigger>
                </TabsList>

                {/* Tabs Content */}
                <div className="mt-8">
                    <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Detailed Info */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                            <FileText size={16} className="text-slate-400" /> Technical Specifications
                                        </CardTitle>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
                                            {[
                                                { label: 'Category', value: asset.categories?.name, icon: Layers },
                                                { label: 'Primary Zone', value: asset.zone, icon: MapPin },
                                                { label: 'Department', value: asset.categories?.department, icon: Building2 },
                                                { label: 'Commission Date', value: asset.install_year, icon: Calendar },
                                                { label: 'Service Life', value: asset.install_year ? `${age} Cycles` : 'Pending' },
                                                { label: 'Asset Reference', value: asset.id.split('-')[0], icon: Hash, mono: true },
                                            ].map(({ label, value, mono, icon: Icon }) => (
                                                <div key={label} className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                                    <p className={cn("text-xs font-bold text-slate-900 flex items-center gap-1.5", mono && "font-mono")}>
                                                        {Icon && <Icon size={12} className="text-slate-300" />}
                                                        {value || '—'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200/60 shadow-sm">
                                    <div className="p-6 border-b border-slate-50">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest">Description & Functional Notes</CardTitle>
                                    </div>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                                            "{asset.description || 'No system description provided by the recording officer.'}"
                                        </div>
                                        {asset.notes && (
                                            <div className="flex gap-2">
                                                <div className="w-1 h-auto bg-slate-300 rounded-full" />
                                                <p className="text-xs font-medium text-slate-500">{asset.notes}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Secondary Column */}
                            <div className="space-y-6">
                                <Card className="border-slate-200/60 shadow-sm">
                                    <div className="p-6 border-b border-slate-50">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest">Condition Analysis</CardTitle>
                                    </div>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-end justify-between">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Index</p>
                                                <span className="text-xl font-black text-slate-900">{asset.condition_score}/10</span>
                                            </div>
                                            <ConditionBar score={asset.condition_score} />
                                        </div>

                                        <Alert className={cn(
                                            "border-none rounded-xl",
                                            asset.condition_score >= 8 ? "bg-emerald-50 text-emerald-900"
                                                : asset.condition_score >= 5 ? "bg-amber-50 text-amber-900"
                                                    : "bg-rose-50 text-rose-900"
                                        )}>
                                            <ShieldCheck size={16} />
                                            <AlertTitle className="text-[10px] font-black uppercase tracking-widest mb-1">Expert Verdict</AlertTitle>
                                            <AlertDescription className="text-[11px] font-bold">
                                                {asset.condition_score >= 8 ? 'Entity is in optimal operational health. No intervention required.'
                                                    : asset.condition_score >= 5 ? 'Status: Fair. Routine monitoring and periodic inspection advised.'
                                                        : asset.condition_score >= 3 ? 'Status: Poor. Active maintenance deployment recommended.'
                                                            : 'WARNING: Critical degradation. Immediate tactical response required.'}
                                            </AlertDescription>
                                        </Alert>

                                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Event</span>
                                                <span className="text-xs font-bold text-slate-600">{formatDate(asset.last_maintained)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Window</span>
                                                <span className={cn("text-xs font-bold", isOverdue(asset.next_due) ? 'text-rose-600 animate-pulse' : 'text-slate-600')}>
                                                    {formatDate(asset.next_due)} {isOverdue(asset.next_due) && '⚠'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {asset.image_url && (
                                    <Card className="border-slate-200/60 shadow-sm overflow-hidden group">
                                        <div className="aspect-video relative overflow-hidden bg-slate-100">
                                            <img
                                                src={asset.image_url}
                                                alt={asset.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                            <a
                                                href={asset.image_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-lg shadow-lg hover:bg-white transition-all text-slate-900 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                        <div className="p-3 bg-slate-50 text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Photographic Record</p>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="maintenance" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <CardTitle className="text-base font-black uppercase text-slate-900 tracking-tight">Incident & Maintenance Logs</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{logs.length} historical events captured</CardDescription>
                                </div>
                                <Dialog open={showMaintModal} onOpenChange={setShowMaintModal}>
                                    <DialogTrigger asChild>
                                        <Button className="rounded-xl bg-slate-900 shadow-lg shadow-slate-200 font-bold uppercase text-[10px] tracking-widest">
                                            <Plus className="mr-2 h-4 w-4" /> Log New Deployment
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-lg rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                                        <form onSubmit={handleMaintSubmit}>
                                            <DialogHeader className="p-8 bg-slate-900 text-white">
                                                <DialogTitle className="text-xl font-black tracking-tight">Maintenance Protocol</DialogTitle>
                                                <DialogDescription className="text-slate-400 font-medium">Record a new inspection or repair event for the current asset registry.</DialogDescription>
                                            </DialogHeader>
                                            <div className="p-8 space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="date" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Event Date</Label>
                                                        <Input id="date" type="date" value={maintForm.maintenance_date}
                                                            onChange={e => setMaintForm({ ...maintForm, maintenance_date: e.target.value })}
                                                            className="rounded-xl border-slate-200 bg-slate-50/50" required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="type" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Event Nature</Label>
                                                        <select id="type" value={maintForm.maintenance_type}
                                                            onChange={e => setMaintForm({ ...maintForm, maintenance_type: e.target.value })}
                                                            className="w-full h-10 px-3 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer">
                                                            {MAINT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="inspector" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Authorized Inspector</Label>
                                                    <div className="relative">
                                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <Input id="inspector" placeholder="Personnel ID or Name" value={maintForm.performed_by}
                                                            onChange={e => setMaintForm({ ...maintForm, performed_by: e.target.value })}
                                                            className="pl-9 h-10 rounded-xl border-slate-200 bg-slate-50/50" required />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="health" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Health Index Post-Event (1–10)</Label>
                                                    <Input id="health" type="number" min={1} max={10} placeholder="Assign score" value={maintForm.condition_after}
                                                        onChange={e => setMaintForm({ ...maintForm, condition_after: e.target.value })}
                                                        className="h-10 rounded-xl border-slate-200 bg-slate-50/50" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="notes" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Observations & Summary</Label>
                                                    <textarea id="notes" rows={4} value={maintForm.notes}
                                                        onChange={e => setMaintForm({ ...maintForm, notes: e.target.value })}
                                                        placeholder="Describe tactical findings or resolution details..."
                                                        className="w-full p-4 text-xs font-medium border border-slate-200 rounded-2xl bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none transition-all" />
                                                </div>
                                            </div>
                                            <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 gap-2">
                                                <Button type="button" variant="ghost" onClick={() => setShowMaintModal(false)} className="rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400">Cancel</Button>
                                                <Button type="submit" disabled={savingMaint} className="rounded-xl bg-slate-900 shadow-lg shadow-slate-200 font-bold uppercase text-[10px] tracking-widest">
                                                    <Save size={14} className="mr-2" /> {savingMaint ? 'Capturing...' : 'Commit Protocol'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <CardContent className="p-0">
                                {logs.length === 0 ? (
                                    <div className="p-20 text-center space-y-4">
                                        <HardHat size={40} className="mx-auto text-slate-200" />
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Maintenance History Detected</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="hover:bg-transparent border-slate-200/60">
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Event Date</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Classification</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Authorized Inspector</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Post-Health</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Technical Notes</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {logs.map(log => (
                                                <TableRow key={log.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                                                    <TableCell className="text-[11px] font-black text-slate-900 tabular-nums">{formatDate(log.maintenance_date)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={cn(
                                                            "rounded-lg font-bold text-[9px] uppercase tracking-tighter px-2 py-0.5",
                                                            log.maintenance_type === 'Emergency Repair' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                                log.maintenance_type === 'Routine Inspection' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                                    "bg-slate-50 text-slate-600 border-slate-200"
                                                        )}>
                                                            {log.maintenance_type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-bold text-slate-700">{log.performed_by}</TableCell>
                                                    <TableCell>
                                                        {log.condition_after ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-black text-slate-900">{log.condition_after}</span>
                                                                <div className="w-8 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={cn("h-full", log.condition_after > 7 ? "bg-emerald-500" : log.condition_after > 4 ? "bg-amber-400" : "bg-rose-500")}
                                                                        style={{ width: `${log.condition_after * 10}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : '—'}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium text-slate-500 max-w-[300px] leading-relaxed italic">
                                                        {log.notes || 'No observation summary captured.'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                        <Card className="border-slate-200/60 shadow-sm">
                            <CardHeader className="p-6 border-b border-slate-50">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    System Audit Trail
                                </CardTitle>
                                <CardDescription className="text-xs">Chronological record of all metadata mutations and registry updates.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loadingHistory ? (
                                    <div className="p-20 text-center space-y-3">
                                        <Activity size={32} className="mx-auto text-slate-200 animate-spin" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying Audit Core...</p>
                                    </div>
                                ) : historyLog.length === 0 ? (
                                    <div className="p-20 text-center space-y-4">
                                        <ClipboardList size={40} className="mx-auto text-slate-200" />
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Audit Logs Clean</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {historyLog.map(entry => (
                                            <div key={entry.id} className="p-6 flex items-start justify-between gap-6 hover:bg-slate-50/30 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm font-black text-[10px]",
                                                        entry.action_type === 'DELETE' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                            entry.action_type === 'CREATE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                                'bg-sky-50 text-sky-600 border border-sky-100'
                                                    )}>
                                                        {entry.action_type.substring(0, 3)}
                                                    </div>
                                                    <div className="space-y-2 py-0.5">
                                                        <p className="text-sm font-black text-slate-900 leading-none tracking-tight">System Registry Update</p>
                                                        {entry.changed_fields?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {(Array.isArray(entry.changed_fields) ? entry.changed_fields : []).map(field => (
                                                                    <Badge key={field} variant="outline" className="rounded-md font-mono text-[9px] uppercase border-slate-200 text-slate-500 py-0 leading-tight">
                                                                        {field}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                            <User size={10} /> {entry.performed_by}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-black text-slate-900 tabular-nums">{formatDate(entry.created_at)}</p>
                                                    <div className="flex items-center justify-end gap-1 mt-1">
                                                        <Clock size={10} className="text-slate-300" />
                                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Event Verified</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Footer Protocol */}
            <div className="pt-12 pb-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-rose-400 animate-pulse" />
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">SCIS CODE RED: PROTOCOL ACTIVE</p>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Ledger verified</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{id}</span>
                </div>
            </div>
        </div>
    )
}
