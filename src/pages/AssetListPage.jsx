import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { StatusBadge, RiskBadge, ConditionBar } from '../components/shared/Badge'
import { formatDate } from '../lib/formatters'
import { STATUSES, ZONES } from '../lib/formatters'
import { Plus, Download, Eye, Pencil, Search, FilterX, Database } from 'lucide-react'
import PageHeader from '../components/shared/PageHeader'
import { toast } from 'sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
} from "@/components/ui/card"

export default function AssetListPage() {
    const navigate = useNavigate()
    const { filters, setFilter, resetFilters, getFilteredAssets, categories } = useStore()
    const filtered = getFilteredAssets()

    const exportCSV = () => {
        const headers = ['ID', 'Name', 'Category', 'Status', 'Condition', 'Zone',
            'Risk', 'Last Maintained', 'Next Due', 'Address']
        const rows = filtered.map(a => [
            a.id, a.name, a.categories?.name, a.status, a.condition_score,
            a.zone, a.risk_label, a.last_maintained, a.next_due, a.address
        ])
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url; link.download = 'infrastructure-assets-export.csv'; link.click()
        toast.success('Asset registry exported successfully')
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Infrastructure Asset Registry"
                subtitle="Official inventory of city assets including operational health, risk profiles and maintenance scheduling."
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={exportCSV} className="hidden sm:flex rounded-lg border-slate-200 text-slate-600 font-bold text-[13px] h-11 px-5">
                            <Download className="mr-2 h-4 w-4 opacity-70" /> Export Dataset
                        </Button>
                        <Button color="primary" onClick={() => navigate('/assets/new')} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] h-11 px-6 shadow-sm transition-all shadow-emerald-200/50">
                            <Plus className="mr-2 h-5 w-5" /> Commission New Asset
                        </Button>
                    </div>
                }
            />

            {/* Filter Controls */}
            <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-[#F9FAFB]/50">
                <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row items-center gap-5">
                        <div className="relative w-full md:w-[450px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                value={filters.search}
                                onChange={e => setFilter('search', e.target.value)}
                                placeholder="Search inventory by name, reference or address..."
                                className="pl-12 h-12 rounded-xl border-slate-200 bg-white focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all text-[15px] font-medium placeholder:text-slate-400"
                            />
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                            <div className="h-6 w-[1.5px] bg-slate-200 mx-2 hidden md:block" />

                            <select
                                value={filters.status}
                                onChange={e => setFilter('status', e.target.value)}
                                className="h-12 text-xs font-bold border-slate-200 rounded-xl px-5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer min-w-[140px] text-slate-700 uppercase tracking-widest border-2 shadow-sm"
                            >
                                <option value="All">All Status</option>
                                {STATUSES.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>

                            <select
                                value={filters.zone}
                                onChange={e => setFilter('zone', e.target.value)}
                                className="h-12 text-xs font-bold border-slate-200 rounded-xl px-5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer min-w-[130px] text-slate-700 uppercase tracking-widest border-2 shadow-sm"
                            >
                                <option value="All">All Districts</option>
                                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                            </select>

                            <select
                                value={filters.category}
                                onChange={e => setFilter('category', e.target.value)}
                                className="h-12 text-xs font-bold border-slate-200 rounded-xl px-5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer min-w-[160px] text-slate-700 uppercase tracking-widest border-2 shadow-sm"
                            >
                                <option value="All">All Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>

                            {(filters.status !== 'All' || filters.zone !== 'All' || filters.category !== 'All' || filters.search) && (
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-rose-600 hover:text-rose-700 h-12 px-5 rounded-xl bg-rose-50/50 hover:bg-rose-50 ml-1 font-bold text-xs uppercase tracking-widest">
                                    <FilterX className="h-4 w-4 mr-2" /> Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Asset Table */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[140px] text-xs font-bold uppercase tracking-widest text-slate-500 h-14 pl-8">Inventory Ref</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 h-14">Infrastructure Asset</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 h-14">Operating State</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 h-14">Health Index</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 h-14">District Zone</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 h-14">Risk Class</TableHead>
                            <TableHead className="text-right text-xs font-bold uppercase tracking-widest text-slate-500 h-14 pr-10">Management</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center text-slate-300">
                                    <div className="space-y-4">
                                        <Database size={48} className="mx-auto opacity-10" />
                                        <p className="text-base font-bold uppercase tracking-widest text-slate-400">Zero active records in dataset.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map(asset => (
                                <TableRow key={asset.id} className="hover:bg-slate-50/40 transition-colors border-slate-100 group h-20">
                                    <TableCell className="font-mono text-xs font-bold text-slate-400 tabular-nums pl-8">
                                        {asset.id.split('-')[0].toUpperCase()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 transition-all group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-600 shadow-sm">
                                                {asset.categories?.icon || <Database size={18} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[15px] font-bold text-slate-900 tracking-tight leading-none mb-1.5">{asset.name}</p>
                                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{asset.categories?.name}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={asset.status} />
                                    </TableCell>
                                    <TableCell className="w-[200px]">
                                        <div className="flex flex-col gap-2">
                                            <ConditionBar score={asset.condition_score} />
                                            <div className="flex justify-between items-center pr-2">
                                                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Score</span>
                                                <span className="text-[11px] font-bold text-slate-900 tabular-nums">{asset.condition_score.toFixed(1)} / 10</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[13px] font-bold text-slate-700 uppercase tracking-tight">
                                        {asset.zone}
                                    </TableCell>
                                    <TableCell>
                                        <RiskBadge label={asset.risk_label} />
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/assets/${asset.id}`)} className="h-10 w-10 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100">
                                                <Eye className="h-5 w-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/assets/${asset.id}/edit`)} className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <div className="flex items-center justify-between px-4 text-xs font-bold text-slate-400 uppercase tracking-widest pt-2">
                <p>Telemetry: {filtered.length} active records parsed</p>
                <p>Central Registry Protocol v4.2</p>
            </div>
        </div>
    )
}
