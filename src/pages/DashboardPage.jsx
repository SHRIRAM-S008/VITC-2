import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useStore } from '../store/useStore'
import {
    AlertTriangle, CheckCircle, Wrench,
    ArrowRight, ShieldAlert,
    Globe, Database, Layers
} from 'lucide-react'
import { RiskBadge } from '../components/shared/Badge'
import { formatDate, isDueSoon, isOverdue } from '../lib/formatters'
import PageHeader from '../components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const CHART_COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1']
const COND_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444']

export default function DashboardPage() {
    const assets = useStore(s => s.assets)
    const navigate = useNavigate()

    const stats = useMemo(() => ({
        total: assets.length,
        critical: assets.filter(a => a.status === 'Critical').length,
        maintenance: assets.filter(a => a.status === 'Under Maintenance').length,
        highRisk: assets.filter(a => a.risk_label === 'HIGH').length,
    }), [assets])

    const byStatus = useMemo(() => {
        const map = {}
        assets.forEach(a => { map[a.status] = (map[a.status] || 0) + 1 })
        return Object.entries(map).map(([name, value]) => ({ name, value }))
    }, [assets])

    const byCategory = useMemo(() => {
        const map = {}
        assets.forEach(a => {
            const cat = a.categories?.name || 'Uncategorized'
            map[cat] = (map[cat] || 0) + 1
        })
        return Object.entries(map).map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)
    }, [assets])

    const topRisk = useMemo(() =>
        [...assets].sort((a, b) => b.risk_score - a.risk_score).slice(0, 5),
        [assets]
    )

    const byCondition = useMemo(() => {
        const good = assets.filter(a => (a.condition_score || 0) >= 8).length
        const fair = assets.filter(a => (a.condition_score || 0) >= 5 && (a.condition_score || 0) < 8).length
        const poor = assets.filter(a => (a.condition_score || 0) >= 3 && (a.condition_score || 0) < 5).length
        const critical = assets.filter(a => (a.condition_score || 0) < 3).length
        return [
            { name: 'Optimal', value: good },
            { name: 'Fair', value: fair },
            { name: 'Degraded', value: poor },
            { name: 'Critical', value: critical },
        ].filter(d => d.value > 0)
    }, [assets])

    const byZone = useMemo(() => {
        const map = {}
        assets.forEach(a => { if (a.zone) map[a.zone] = (map[a.zone] || 0) + 1 })
        return Object.entries(map).map(([zone, count]) => ({ zone, count }))
    }, [assets])

    const upcoming = useMemo(() =>
        assets.filter(a => isDueSoon(a.next_due) || isOverdue(a.next_due))
            .sort((a, b) => new Date(a.next_due) - new Date(b.next_due))
            .slice(0, 5),
        [assets]
    )

    const kpis = [
        { label: 'Asset Inventory', value: stats.total, icon: Database, color: 'text-slate-600', description: 'Total tracked entities' },
        { label: 'Critical Incident', value: stats.critical, icon: ShieldAlert, color: 'text-rose-600', description: 'Urgent intervention required' },
        { label: 'Active Work Orders', value: stats.maintenance, icon: Wrench, color: 'text-blue-600', description: 'In-progress maintenance' },
        { label: 'Risk Exposure', value: stats.highRisk, icon: AlertTriangle, color: 'text-amber-600', description: 'High probability of failure' },
    ]

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <PageHeader
                    title="Administrative Overview"
                    subtitle="Institutional dashboard for infrastructure health and lifecycle management."
                    className="mb-0"
                />
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                        <button className="px-4 py-2 text-[13px] font-bold bg-white rounded-lg shadow-sm text-slate-900 border border-slate-200/50">Full View</button>
                        <button className="px-4 py-2 text-[13px] font-bold text-slate-500 rounded-lg hover:bg-white/50 transition-colors">By District</button>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map(({ label, value, icon: Icon, color, description }) => (
                    <Card key={label} className="border-slate-200/80 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                                <div className={cn("p-2.5 rounded-xl bg-slate-50 border border-slate-100", color)}>
                                    <Icon size={18} />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-900 tracking-tight leading-none">{value}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase">Unit</span>
                            </div>
                            <p className="text-[13px] text-slate-500 mt-3 font-semibold leading-tight">{description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Condition Distribution */}
                <Card className="lg:col-span-4 border-slate-200/80 shadow-sm">
                    <CardHeader className="border-b border-slate-50 px-6 py-5">
                        <CardTitle className="text-base font-bold text-slate-900">Physical Condition Index</CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-wider">Lifecycle health distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={byCondition}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        stroke="none"
                                    >
                                        {byCondition.map((_, i) => (
                                            <Cell key={i} fill={COND_COLORS[i % COND_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={v => <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{v}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories */}
                <Card className="lg:col-span-4 border-slate-200/80 shadow-sm">
                    <CardHeader className="border-b border-slate-50 px-6 py-5">
                        <CardTitle className="text-base font-bold text-slate-900">Inventory Composition</CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-wider">Primary infrastructure categories</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byCategory} layout="vertical" barSize={10}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={120}
                                        tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ border: 'none', borderRadius: 12, fontSize: 12, fontWeight: 700 }}
                                    />
                                    <Bar dataKey="count" fill="#334155" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Operations Distribution */}
                <Card className="lg:col-span-4 border-slate-200/80 shadow-sm">
                    <CardHeader className="border-b border-slate-50 px-6 py-5">
                        <CardTitle className="text-base font-bold text-slate-900">Operational Status</CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-wider">Current functional state tracking</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={byStatus}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        stroke="none"
                                    >
                                        {byStatus.map((_, i) => (
                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={v => <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{v}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Geographical Density */}
            <Card className="border-slate-200/80 shadow-sm">
                <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between px-6 py-5">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-900">Territorial Asset Density</CardTitle>
                        <CardDescription className="text-xs font-medium uppercase tracking-wider">Infrastructure distribution by municipality zones</CardDescription>
                    </div>
                    <Globe size={20} className="text-slate-300" />
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-12">
                        {byZone.map(({ zone, count }) => {
                            const criticalCount = assets.filter(a => a.zone === zone && (a.status === 'Critical' || a.status === 'Damaged')).length
                            return (
                                <div key={zone} className="space-y-4">
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{zone}</p>
                                        <span className="text-[20px] font-bold text-slate-900">{count}</span>
                                    </div>
                                    <Progress
                                        value={((count - criticalCount) / count) * 100}
                                        className="h-2 bg-slate-100 rounded-lg"
                                    />
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-slate-400 uppercase tracking-tight">Functional</span>
                                        <span className={cn(criticalCount > 0 ? "text-rose-600" : "text-emerald-600")}>
                                            {criticalCount > 0 ? `${criticalCount} Flagged` : "Nominal"}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Secondary Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            High-Risk Registry
                        </h2>
                        <button onClick={() => navigate('/assets')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 uppercase tracking-wider">
                            Detailed Report <ArrowRight size={14} />
                        </button>
                    </div>
                    <Card className="border-slate-200/80 shadow-sm overflow-hidden bg-white">
                        <div className="divide-y divide-slate-100">
                            {topRisk.map(asset => (
                                <div key={asset.id}
                                    onClick={() => navigate(`/assets/${asset.id}`)}
                                    className="flex items-center justify-between p-5 hover:bg-slate-50 cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                                            {asset.categories?.icon || <Layers size={18} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{asset.name}</p>
                                            <p className="text-xs font-semibold text-slate-500">{asset.zone} · {asset.categories?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 shrink-0">
                                        <div className="text-right">
                                            <p className="text-[15px] font-bold text-slate-900 tabular-nums">{asset.risk_score}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Score</p>
                                        </div>
                                        <RiskBadge label={asset.risk_label} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div className="px-2">
                        <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            Maintenance Pipeline
                        </h2>
                    </div>
                    <Card className="border-slate-200/80 shadow-sm overflow-hidden bg-white">
                        {upcoming.length === 0 ? (
                            <div className="p-16 text-center text-slate-400">
                                <CheckCircle size={32} className="mx-auto mb-4 opacity-10" />
                                <p className="text-sm font-bold uppercase tracking-widest">All schedules confirmed</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {upcoming.map(asset => (
                                    <div key={asset.id}
                                        onClick={() => navigate(`/assets/${asset.id}`)}
                                        className="flex items-center justify-between p-5 hover:bg-slate-50 cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                                <Wrench size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{asset.name}</p>
                                                <p className="text-xs font-semibold text-slate-500">{asset.categories?.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={cn("text-[10px] font-bold uppercase tracking-widest", isOverdue(asset.next_due) ? 'text-rose-600' : 'text-slate-500')}>
                                                {isOverdue(asset.next_due) ? 'Overdue' : 'Scheduled'}
                                            </p>
                                            <p className="text-sm font-bold text-slate-900 mt-1 tabular-nums">{formatDate(asset.next_due)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </section>
            </div>
        </div>
    )
}
