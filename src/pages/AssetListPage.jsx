import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { StatusBadge, RiskBadge, ConditionBar } from '../components/shared/Badge'
import { formatDate } from '../lib/formatters'
import { STATUSES, ZONES, RISK_LABELS } from '../lib/formatters'
import { Plus, Download, Eye, Pencil, Search, Filter, FilterX, MoreHorizontal, ArrowUpDown } from 'lucide-react'
import PageHeader from '../components/shared/PageHeader'
import { useMemo } from 'react'
import { supabase } from '../lib/supabase'
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
        link.href = url; link.download = 'ciams-assets.csv'; link.click()
        toast.success('Asset registry exported successfully')
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Municipal Asset Registry"
                subtitle="Comprehensive inventory of city infrastructure components and operational metrics."
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={exportCSV} className="hidden sm:flex rounded-xl border-slate-200">
                            <Download className="mr-2 h-4 w-4" /> Export Ledger
                        </Button>
                        <Button color="primary" onClick={() => navigate('/assets/new')} className="rounded-xl bg-slate-900 shadow-lg shadow-slate-200">
                            <Plus className="mr-2 h-4 w-4" /> New Commission
                        </Button>
                    </div>
                }
            />

            {/* Advanced Filter Bar */}
            <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* Search Input */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                value={filters.search}
                                onChange={e => setFilter('search', e.target.value)}
                                placeholder="Search by name, ID or address..."
                                className="pl-9 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-slate-900/5 focus-visible:ring-offset-0 focus-visible:border-slate-400 transition-all font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block" />

                            <select
                                value={filters.status}
                                onChange={e => setFilter('status', e.target.value)}
                                className="h-10 text-xs font-bold border-slate-200 rounded-xl px-3 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer min-w-[100px] uppercase tracking-tighter"
                            >
                                <option value="All">All Status</option>
                                {STATUSES.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>

                            <select
                                value={filters.zone}
                                onChange={e => setFilter('zone', e.target.value)}
                                className="h-10 text-xs font-bold border-slate-200 rounded-xl px-3 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer min-w-[90px] uppercase tracking-tighter"
                            >
                                <option value="All">All Zones</option>
                                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                            </select>

                            <select
                                value={filters.category}
                                onChange={e => setFilter('category', e.target.value)}
                                className="h-10 text-xs font-bold border-slate-200 rounded-xl px-3 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer min-w-[120px] uppercase tracking-tighter"
                            >
                                <option value="All">All Types</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                            </select>

                            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-400 hover:text-slate-900 h-10 px-3 rounded-xl">
                                <FilterX className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Professional Table Container */}
            <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-200/60">
                            <TableHead className="w-[100px] text-[10px] font-black uppercase tracking-widest text-slate-500">Asset Ref</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Infrastructure Component</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 w-[140px]">Health Index</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Zone</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Risk Profile</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Maintenance</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-slate-400 font-medium">
                                    No assets matching current intelligence criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map(asset => (
                                <TableRow key={asset.id} className="hover:bg-slate-50/50 transition-colors border-slate-100 group">
                                    <TableCell className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                        {asset.id}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-sm group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                                                {asset.categories?.icon || <Database size={14} />}
                                            </div>
                                            <div className="min-w-0 leading-tight">
                                                <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{asset.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{asset.categories?.name}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={asset.status} className="scale-90 origin-left" />
                                    </TableCell>
                                    <TableCell>
                                        <ConditionBar score={asset.condition_score} />
                                    </TableCell>
                                    <TableCell className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">
                                        {asset.zone}
                                    </TableCell>
                                    <TableCell>
                                        <RiskBadge label={asset.risk_label} className="scale-90 origin-left" />
                                    </TableCell>
                                    <TableCell className="text-[11px] font-bold text-slate-500 tabular-nums">
                                        {formatDate(asset.next_due)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/assets/${asset.id}`)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/assets/${asset.id}/edit`)} className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            <div className="flex items-center justify-between px-2 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Showing {filtered.length} active records
                </p>
                <div className="flex items-center gap-4 text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]">
                    Registry Protocol · Secured
                </div>
            </div>
        </div>
    )
}
