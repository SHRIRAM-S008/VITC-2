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
    ClipboardList, AlertTriangle, Save,
    History, Info, FileText, HardHat, ExternalLink,
    ShieldCheck, Clock, User, Building2, Hash, Layers
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
import { Badge } from "@/components/ui/badge"
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
                <Card className="w-full text-center border-dashed border-slate-200 bg-slate-50/50 rounded-3xl">
                    <CardContent className="p-16 space-y-6">
                        <AlertTriangle size={64} className="mx-auto text-slate-200" />
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold text-slate-900 leading-tight">Entity Not Found</CardTitle>
                            <CardDescription className="text-lg text-slate-500 font-medium">The requested infrastructure asset could not be retrieved from the database.</CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => navigate('/assets')} className="rounded-xl border-slate-200 h-12 px-8 font-bold text-sm text-slate-600">
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
        toast.success(`Asset ${id} successfully removed.`)
        navigate('/assets')
    }

    const handleMaintSubmit = async (e) => {
        e.preventDefault()
        if (!maintForm.performed_by.trim()) { toast.error('Authorized personnel name is mandatory'); return }
        setSavingMaint(true)

        const payload = {
            asset_id: id,
            ...maintForm,
            condition_after: maintForm.condition_after ? parseInt(maintForm.condition_after) : null
        }

        const { data, error } = await supabase.from('maintenance_logs').insert(payload).select().single()
        if (error) { toast.error(error.message); setSavingMaint(false); return }

        setMaintenanceLogs([data, ...maintenanceLogs])
        toast.success('Maintenance record committed')
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
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-5">
                    <button onClick={() => navigate(-1)} className="text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-[0.15em] leading-none mb-1">
                        <ArrowLeft size={18} /> Registry Asset Profile
                    </button>
                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                            {asset.categories?.icon || <Building2 size={28} />}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none mb-3">{asset.name}</h1>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={14} className="text-slate-400" /> {asset.address || 'Location information pending'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate(`/assets/${id}/edit`)} className="rounded-xl border-slate-200 text-slate-700 font-bold text-[13px] h-12 px-6 uppercase tracking-wider">
                        <Pencil className="mr-2 h-4 w-4 opacity-70" /> Update Config
                    </Button>
                    <Button variant="outline" onClick={handleDelete} disabled={deleting} className="rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50 font-bold text-[13px] h-12 px-6 uppercase tracking-wider">
                        <Trash2 className="mr-2 h-4 w-4 opacity-70" /> {deleting ? 'Removing...' : 'Decommission'}
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <Card className="border-slate-200/80 shadow-sm">
                    <CardContent className="p-6">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Central Serial</p>
                        <p className="font-mono text-sm font-bold text-slate-700 truncate">{asset.id}</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-sm">
                    <CardContent className="p-6">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Availability</p>
                        <StatusBadge status={asset.status} />
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-sm">
                    <CardContent className="p-6">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Integrity</p>
                        <RiskBadge label={asset.risk_label} />
                    </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-sm">
                    <CardContent className="p-6">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Exposure Metric</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900 tracking-tight">{asset.risk_score}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">IDX</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-100 p-1.5 rounded-xl border border-slate-200/50 mb-10 inline-flex h-12">
                    <TabsTrigger value="overview" className="rounded-lg px-8 font-bold text-xs uppercase tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-500 data-[state=active]:text-slate-900">
                        Institutional Profile
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="rounded-lg px-8 font-bold text-xs uppercase tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-500 data-[state=active]:text-slate-900">
                        Maintenance Log
                        {logs.length > 0 && <span className="ml-2 bg-slate-200 text-slate-600 px-2 rounded-full text-[10px]">{logs.length}</span>}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg px-8 font-bold text-xs uppercase tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-500 data-[state=active]:text-slate-900">
                        System Audit
                    </TabsTrigger>
                </TabsList>

                {/* Overvew Tab */}
                <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Specifications */}
                        <div className="lg:col-span-8 space-y-8">
                            <Card className="border-slate-200/80 shadow-sm overflow-hidden bg-white">
                                <CardHeader className="border-b border-slate-50 bg-slate-50/20 px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <FileText size={18} className="text-slate-400" />
                                        <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest">Asset Specifications</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10">
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8">
                                        {[
                                            { label: 'Category', value: asset.categories?.name, icon: Layers },
                                            { label: 'Management Zone', value: asset.zone, icon: MapPin },
                                            { label: 'Custodial Body', value: asset.categories?.department, icon: Building2 },
                                            { label: 'Registration Year', value: asset.install_year, icon: Calendar },
                                            { label: 'Service Cycles', value: asset.install_year ? `${age} Units` : 'Logged', icon: Clock },
                                            { label: 'Registry Ref', value: asset.id.split('-')[0].toUpperCase(), icon: Hash, mono: true },
                                        ].map(({ label, value, mono, icon: Icon }) => (
                                            <div key={label} className="space-y-2.5">
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em]">{label}</p>
                                                <div className={cn("text-[15px] font-bold text-slate-900 flex items-center gap-2.5", mono && "font-mono text-slate-600")}>
                                                    {Icon && <Icon size={16} className="text-slate-300 shrink-0" />}
                                                    <span className="truncate">{value || 'Pending'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200/80 shadow-sm">
                                <CardHeader className="border-b border-slate-50 px-8 py-5">
                                    <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest">Description & Methodology</CardTitle>
                                </CardHeader>
                                <CardContent className="p-10">
                                    <p className="text-base font-medium text-slate-600 leading-relaxed border-l-[3.5px] border-emerald-500/20 pl-8">
                                        {asset.description || 'No descriptive metadata recorded for this entry.'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Health Column */}
                        <div className="lg:col-span-4 space-y-8">
                            <Card className="border-slate-200/80 shadow-sm">
                                <CardHeader className="border-b border-slate-50 px-8 py-5">
                                    <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest">Health Validation</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-10">
                                    <div className="space-y-5">
                                        <div className="flex items-baseline justify-between">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Health Metric</p>
                                            <span className="text-3xl font-bold text-slate-900 tracking-tight">{asset.condition_score.toFixed(1)} <span className="text-xs text-slate-400">/ 10</span></span>
                                        </div>
                                        <ConditionBar score={asset.condition_score} />
                                    </div>

                                    <div className={cn(
                                        "p-6 rounded-xl border text-sm font-bold leading-relaxed flex gap-4 shadow-sm",
                                        asset.condition_score >= 8 ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                                            : asset.condition_score >= 5 ? "bg-amber-50 border-amber-100 text-amber-800"
                                                : "bg-rose-50 border-rose-100 text-rose-800"
                                    )}>
                                        <ShieldCheck size={20} className="shrink-0 mt-0.5 opacity-80" />
                                        <span>
                                            {asset.condition_score >= 8 ? 'Asset exhibits optimal health. No immediate intervention mandated.'
                                                : asset.condition_score >= 5 ? 'System health is nominal. Preemptive maintenance advised within next cycle.'
                                                    : asset.condition_score >= 3 ? 'Critical degradation detected. Scheduled intervention required immediately.'
                                                        : 'Severe failure risk. Immediate structural repair mandated.'}
                                        </span>
                                    </div>

                                    <div className="divide-y divide-slate-100 pt-2">
                                        <div className="py-4 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                                            <span className="text-slate-400">Past Audit</span>
                                            <span className="text-slate-900">{formatDate(asset.last_maintained)}</span>
                                        </div>
                                        <div className="py-4 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                                            <span className="text-slate-400">Recurrence</span>
                                            <span className={cn(isOverdue(asset.next_due) ? 'text-rose-600' : 'text-slate-900')}>
                                                {formatDate(asset.next_due)} {isOverdue(asset.next_due) && '(OVERDUE)'}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {asset.image_url && (
                                <Card className="border-slate-200/80 shadow-sm overflow-hidden bg-slate-50">
                                    <div className="aspect-video relative">
                                        <img src={asset.image_url} alt={asset.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-slate-900/10" />
                                        <a href={asset.image_url} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 p-2.5 bg-white rounded-xl shadow-lg hover:bg-slate-50 transition-all text-slate-600">
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                    <div className="p-4 text-center border-t border-slate-200">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Photographic Documentation</p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Maintenance Tab */}
                <TabsContent value="maintenance" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-slate-200/80 shadow-sm">
                        <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between px-8 py-6">
                            <div className="space-y-1">
                                <CardTitle className="text-[16px] font-bold text-slate-900 uppercase tracking-wider">Deployment Ledger</CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">{logs.length} validated maintenance records</CardDescription>
                            </div>
                            <Dialog open={showMaintModal} onOpenChange={setShowMaintModal}>
                                <DialogTrigger asChild>
                                    <Button className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-11 px-6 uppercase tracking-widest shadow-lg shadow-emerald-700/10">
                                        <Plus className="mr-2 h-4 w-4" /> Log Deployment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
                                    <form onSubmit={handleMaintSubmit}>
                                        <DialogHeader className="p-10 bg-slate-900 text-white">
                                            <DialogTitle className="text-2xl font-bold tracking-tight">Maintenance Protocol</DialogTitle>
                                            <DialogDescription className="text-slate-400 text-sm font-medium mt-1">Commit a new maintenance or inspection event to the permanent ledger.</DialogDescription>
                                        </DialogHeader>
                                        <div className="p-10 space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2.5">
                                                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Event Date</Label>
                                                    <Input type="date" value={maintForm.maintenance_date} onChange={e => setMaintForm({ ...maintForm, maintenance_date: e.target.value })} className="h-11 rounded-lg border-slate-200 bg-slate-50 font-bold" required />
                                                </div>
                                                <div className="space-y-2.5">
                                                    <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Classification</Label>
                                                    <select value={maintForm.maintenance_type} onChange={e => setMaintForm({ ...maintForm, maintenance_type: e.target.value })} className="w-full h-11 px-4 text-sm font-bold border border-slate-200 rounded-lg bg-slate-50 focus:outline-none">
                                                        {MAINT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2.5">
                                                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Authorized Agency</Label>
                                                <Input placeholder="Department / Personnel / ID" value={maintForm.performed_by} onChange={e => setMaintForm({ ...maintForm, performed_by: e.target.value })} className="h-11 rounded-lg border-slate-200 bg-slate-50 font-bold" required />
                                            </div>
                                            <div className="space-y-2.5">
                                                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Final Index (1-10)</Label>
                                                <Input type="number" min={1} max={10} value={maintForm.condition_after} onChange={e => setMaintForm({ ...maintForm, condition_after: e.target.value })} className="h-11 rounded-lg border-slate-200 bg-slate-50" />
                                            </div>
                                            <div className="space-y-2.5">
                                                <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Operational Observation</Label>
                                                <textarea rows={4} value={maintForm.notes} onChange={e => setMaintForm({ ...maintForm, notes: e.target.value })} className="w-full p-4 text-sm font-bold border border-slate-200 rounded-lg bg-slate-50 focus:outline-none resize-none" placeholder="Detail all tactical findings and resolutions..." />
                                            </div>
                                        </div>
                                        <DialogFooter className="p-10 bg-slate-50 border-t border-slate-100">
                                            <Button type="button" variant="ghost" onClick={() => setShowMaintModal(false)} className="text-xs font-bold uppercase text-slate-400 h-11 px-6">Cancel</Button>
                                            <Button type="submit" disabled={savingMaint} className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-11 px-8 text-xs uppercase tracking-[0.1em] shadow-lg">{savingMaint ? 'Logging...' : 'Confirm Ledger Update'}</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            {logs.length === 0 ? (
                                <div className="p-24 text-center text-slate-300">
                                    <HardHat size={56} className="mx-auto mb-5 opacity-10" />
                                    <p className="text-lg font-bold uppercase tracking-widest text-slate-400">Registry log empty for this asset.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-slate-100 h-14">
                                            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-8">Event Date</TableHead>
                                            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Nature</TableHead>
                                            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Custodial Body</TableHead>
                                            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400">Final Health</TableHead>
                                            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 pr-8">Summary Observation</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.map(log => (
                                            <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/40 h-20 transition-all">
                                                <TableCell className="text-[13px] font-bold text-slate-900 tabular-nums pl-8">{formatDate(log.maintenance_date)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest rounded-md border-slate-200 text-slate-500 py-1 px-3">
                                                        {log.maintenance_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-[13px] font-bold text-slate-700">{log.performed_by}</TableCell>
                                                <TableCell>
                                                    {log.condition_after ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={cn("h-full", log.condition_after > 7 ? "bg-emerald-500" : log.condition_after > 4 ? "bg-emerald-300" : "bg-rose-500")}
                                                                    style={{ width: `${log.condition_after * 10}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-900">{log.condition_after}</span>
                                                        </div>
                                                    ) : '—'}
                                                </TableCell>
                                                <TableCell className="text-[13px] font-semibold text-slate-500 italic max-w-sm truncate whitespace-nowrap pr-8">
                                                    {log.notes || 'No summary comments captured.'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Audit Tab */}
                <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-slate-200/80 shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-50 px-8 py-6">
                            <CardTitle className="text-[16px] font-bold text-slate-900 uppercase tracking-widest">Chronological Audit Record</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">Validated record of all configuration permutations</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingHistory ? (
                                <div className="p-32 text-center">
                                    <Activity size={40} className="mx-auto text-slate-200 animate-spin" />
                                </div>
                            ) : historyLog.length === 0 ? (
                                <div className="p-24 text-center text-slate-300">
                                    <ClipboardList size={56} className="mx-auto mb-5 opacity-10" />
                                    <p className="text-lg font-bold uppercase tracking-widest text-slate-400">Audit trail nominal.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 px-8">
                                    {historyLog.map(entry => (
                                        <div key={entry.id} className="py-8 flex items-center justify-between group">
                                            <div className="flex items-center gap-6">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[11px] tracking-[0.1em] border-2",
                                                    entry.action_type === 'DELETE' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                                        entry.action_type === 'CREATE' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                            'bg-blue-50 border-blue-100 text-blue-700'
                                                )}>
                                                    {entry.action_type.toUpperCase().substring(0, 3)}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <p className="text-[15px] font-bold text-slate-900 tracking-tight">Registry Mutation Event</p>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><User size={14} className="text-slate-300" /> {entry.performed_by}</span>
                                                        <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                                        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">{entry.id.split('-')[0]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[15px] font-bold text-slate-900 tabular-nums">{formatDate(entry.created_at)}</p>
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5">Protocol Verified</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="pt-12 pb-16 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-4">
                    <ShieldCheck size={20} className="text-emerald-500" />
                    <span>Institutional Ledger Verified</span>
                </div>
                <div className="flex items-center gap-10">
                    <span>Registry Instance: LOCAL_SVR_01</span>
                    <span className="font-mono text-[10px] text-slate-300">{id}</span>
                </div>
            </div>
        </div>
    )
}
