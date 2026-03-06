import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { StatusBadge } from '../components/shared/Badge'
import PageHeader from '../components/shared/PageHeader'
import { ArrowRight, Tag, ChevronRight, Hash, Layers } from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export default function CategoryPage() {
    const navigate = useNavigate()
    const { categories, assets, setFilter } = useStore()

    const goToCategory = (categoryId) => {
        setFilter('category', categoryId)
        navigate('/assets')
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Infrastructure Taxonomy"
                subtitle={`Inventory classified across ${categories.length} distinct departments and archetypes.`}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map(cat => {
                    const catAssets = assets.filter(a => a.category_id === cat.id)
                    const totalCount = catAssets.length
                    const criticalCount = catAssets.filter(a => a.status === 'Critical').length
                    const highRisk = catAssets.filter(a => a.risk_label === 'HIGH').length

                    const healthPct = totalCount > 0 ? ((totalCount - criticalCount) / totalCount) * 100 : 100

                    return (
                        <Card
                            key={cat.id}
                            onClick={() => goToCategory(cat.id)}
                            className="group cursor-pointer border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            <CardHeader className="p-5 border-b border-slate-50 relative pb-6">
                                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Layers size={64} />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 shadow-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                                        {cat.icon || '📍'}
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-sm font-black text-slate-900 tracking-tight truncate uppercase">
                                            {cat.name}
                                        </CardTitle>
                                        <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                                            {cat.department || 'General Assets'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-5 space-y-6">
                                <div>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                                        {totalCount}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Deployed Units</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-end justify-between">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Zone Operational Health</p>
                                        <span className="text-[10px] font-black text-slate-900">{Math.round(healthPct)}%</span>
                                    </div>
                                    <Progress value={healthPct} className="h-1 bg-slate-100 [&>div]:bg-slate-900" />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", highRisk > 0 ? "bg-rose-500 animate-pulse" : "bg-emerald-500")} />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                            {highRisk} High Risk Assets
                                        </span>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>

                            {criticalCount > 0 && (
                                <div className="bg-rose-500 px-5 py-1 text-center">
                                    <p className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
                                        ⚠ REQUIRES ATTENTION ({criticalCount})
                                    </p>
                                </div>
                            )}
                        </Card>
                    )
                })}
            </div>

            <div className="flex items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-3xl border-dashed">
                <div className="text-center space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Protocol</p>
                    <p className="text-xs font-bold text-slate-500">All departments are currently synchronizing with the central intelligence core.</p>
                </div>
            </div>
        </div>
    )
}
