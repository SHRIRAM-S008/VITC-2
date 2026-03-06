import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useStore } from '../store/useStore'
import { AlertTriangle, CheckCircle, Wrench, TrendingUp, ArrowRight, ShieldAlert, Activity, Globe } from 'lucide-react'
import { StatusBadge, RiskBadge, ConditionBar } from '../components/shared/Badge'
import { formatDate, isDueSoon, isOverdue } from '../lib/formatters'
import PageHeader from '../components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const CHART_COLORS = ['#0a0a0a', '#737373', '#d4d4d4', '#e5e5e5', '#22c55e', '#f59e0b', '#ef4444']
const COND_COLORS = ['#22c55e', '#84cc16', '#f59e0b', '#ef4444']

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
            const cat = a.categories?.name || 'Other'
            map[cat] = (map[cat] || 0) + 1
        })
        return Object.entries(map).map(([name, count]) => ({ name, count }))
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
            { name: 'Good (8–10)', value: good },
            { name: 'Fair (5–7)', value: fair },
            { name: 'Poor (3–4)', value: poor },
            { name: 'Critical (<3)', value: critical },
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
        { label: 'Total Infrastructure', value: stats.total, icon: Activity, color: 'text-neutral-900', bg: 'bg-white', description: 'Total tracked assets' },
        { label: 'Critical Status', value: stats.critical, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50/50', description: 'Requires immediate attention' },
        { label: 'Active Maintenance', value: stats.maintenance, icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-50/50', description: 'Scheduled work in progress' },
        { label: 'High Risk Assets', value: stats.highRisk, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50/50', description: 'Probability of failure' },
    ]

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <PageHeader
                    title="SCIS Analytics Engine"
                    subtitle="Mission critical monitoring and infrastructure risk intelligence."
                    className="mb-0"
                />
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg self-start">
                    <button className="px-3 py-1.5 text-xs font-semibold bg-white rounded shadow-sm">All Zones</button>
                    <button className="px-3 py-1.5 text-xs font-medium text-slate-500 rounded hover:bg-white/50 transition-colors">By Department</button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(({ label, value, icon: Icon, color, bg, description }) => (
                    <Card key={label} className={cn("overflow-hidden border-slate-200/60 shadow-sm transition-all hover:shadow-md", bg)}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</CardTitle>
                            <div className={cn("p-2 rounded-lg bg-white shadow-sm border border-slate-100", color)}>
                                <Icon size={16} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
                            <p className="text-[10px] text-slate-400 font-medium mt-1 leading-tight">{description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-1 border-slate-200/60 shadow-sm overflow-hidden">
                    <CardHeader className="p-5 border-b border-slate-50">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            Asset Status Distribution
                        </CardTitle>
                        <CardDescription className="text-xs">Real-time breakdown of operational states</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={byStatus} dataKey="value" nameKey="name"
                                    cx="50%" cy="50%" innerRadius={70} outerRadius={100}
                                    paddingAngle={4} stroke="none">
                                    {byStatus.map((_, i) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ border: 'none', borderRadius: 12, fontSize: 11, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                                    formatter={v => <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-1 border-slate-200/60 shadow-sm">
                    <CardHeader className="p-5 border-b border-slate-50">
                        <CardTitle className="text-sm font-bold">Category Distribution</CardTitle>
                        <CardDescription className="text-xs">Count by infrastructure type</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 pt-8">
                        <ResponsiveContainer width="100%" height={230}>
                            <BarChart data={byCategory} layout="vertical" barSize={12}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={100}
                                    tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700 }}
                                />
                                <Bar dataKey="count" fill="#1e293b" radius={[0, 10, 10, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-1 border-slate-200/60 shadow-sm">
                    <CardHeader className="p-5 border-b border-slate-50">
                        <CardTitle className="text-sm font-bold">Health Index</CardTitle>
                        <CardDescription className="text-xs">Physical condition of municipal assets</CardDescription>
                    </CardHeader>
                    <CardContent className="p-5">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={byCondition} dataKey="value" nameKey="name"
                                    cx="50%" cy="50%" innerRadius={70} outerRadius={100}
                                    paddingAngle={4} stroke="none">
                                    {byCondition.map((_, i) => (
                                        <Cell key={i} fill={COND_COLORS[i % COND_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ border: 'none', borderRadius: 12, fontSize: 11 }}
                                />
                                <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                                    formatter={v => <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Zone Map Mini Section */}
            <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-slate-900 text-white">
                <CardHeader className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold">Zone Health Summary</CardTitle>
                            <CardDescription className="text-xs text-slate-400">Territorial overview across city districts</CardDescription>
                        </div>
                        <Globe className="text-slate-500" size={20} />
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {byZone.map(({ zone, count }) => {
                            const criticalCount = assets.filter(a => a.zone === zone && a.status === 'Critical').length
                            return (
                                <div key={zone} className="space-y-2 group cursor-pointer">
                                    <div className="flex items-end justify-between">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{zone}</p>
                                        <span className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{count}</span>
                                    </div>
                                    <Progress
                                        value={((count - criticalCount) / count) * 100}
                                        className="h-1 bg-white/10 [&>div]:bg-blue-500"
                                    />
                                    {criticalCount > 0 && (
                                        <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                                            ⚠ {criticalCount} CRITICAL
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Row Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-6 h-0.5 bg-rose-500 rounded-full" />
                            Security & Risk Profile
                        </h2>
                        <button onClick={() => navigate('/assets')} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1 tracking-widest">
                            Intelligence Report <ArrowRight size={12} />
                        </button>
                    </div>
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardContent className="p-2 space-y-1">
                            {topRisk.map(asset => (
                                <div key={asset.id}
                                    onClick={() => navigate(`/assets/${asset.id}`)}
                                    className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 cursor-pointer transition-all group border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                            {asset.categories?.icon || <Database size={18} />}
                                        </div>
                                        <div className="min-w-0 leading-tight">
                                            <p className="text-sm font-bold text-slate-900 truncate">{asset.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{asset.zone} · {asset.categories?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 ml-4 shrink-0">
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-900 tracking-tighter">{asset.risk_score}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">RISK INDEX</p>
                                        </div>
                                        <RiskBadge label={asset.risk_label} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-6 h-0.5 bg-indigo-500 rounded-full" />
                            Logistics & Maintenance
                        </h2>
                    </div>
                    <Card className="border-slate-200/60 shadow-sm">
                        <CardContent className="p-2 space-y-1">
                            {upcoming.length === 0 && (
                                <div className="p-12 text-center space-y-2">
                                    <CheckCircle size={32} className="mx-auto text-emerald-500 opacity-20" />
                                    <p className="text-sm font-bold text-slate-400">All systems operational</p>
                                </div>
                            )}
                            {upcoming.map(asset => (
                                <div key={asset.id}
                                    onClick={() => navigate(`/assets/${asset.id}`)}
                                    className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 cursor-pointer transition-all group border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <Wrench size={18} />
                                        </div>
                                        <div className="min-w-0 leading-tight">
                                            <p className="text-sm font-bold text-slate-900 truncate">{asset.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{asset.categories?.name}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 ml-4 text-right">
                                        <p className={cn("text-[10px] font-black uppercase tracking-widest", isOverdue(asset.next_due) ? 'text-rose-600' : 'text-indigo-600')}>
                                            {isOverdue(asset.next_due) ? '‼ OVERDUE' : '▶ UPCOMING'}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-900 mt-0.5">{formatDate(asset.next_due)}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    )
}
