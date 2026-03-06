import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useStore } from '../store/useStore'
import { StatusBadge, RiskBadge } from '../components/shared/Badge'
import { STATUSES, ZONES } from '../lib/formatters'
import { ArrowLeft, ArrowRight, Filter, Globe, Layers, Navigation, Search, X, MapPin, Building2, ShieldCheck, Activity } from 'lucide-react'
import PageHeader from '../components/shared/PageHeader'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STATUS_COLORS = {
    'Operational': '#10b981', // Emerald 500
    'Under Maintenance': '#f59e0b', // Amber 500
    'Critical': '#ef4444', // Rose 500
    'Decommissioned': '#64748b', // Slate 500
}

export default function MapPage() {
    const navigate = useNavigate()
    const { assets, filters, setFilter, resetFilters, categories } = useStore()
    const [sidebarVisible, setSidebarVisible] = useState(true)

    const mappable = useMemo(() => assets.filter(a =>
        a.latitude && a.longitude &&
        (filters.status === 'All' || a.status === filters.status) &&
        (filters.zone === 'All' || a.zone === filters.zone) &&
        (filters.category === 'All' || a.category_id === filters.category)
    ), [assets, filters])

    const CENTER = [13.0827, 80.2707] // Chennai

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 animate-in fade-in duration-500 relative">

            {/* Professional Floating Control Panel */}
            <aside className={cn(
                "fixed top-6 left-6 bottom-6 w-80 bg-white border border-slate-200/60 rounded-3xl shadow-2xl flex flex-col z-[1000] transition-all duration-500 ease-in-out overflow-hidden transform",
                sidebarVisible ? "translate-x-0 opacity-100" : "-translate-x-[110%] opacity-0"
            )}>
                {/* Header Profile */}
                <div className="p-7 bg-white border-b border-slate-100">
                    <div className="flex items-center justify-between mb-5">
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition-colors font-bold text-[10px] uppercase tracking-[0.2em] leading-none">
                            <ArrowLeft size={16} /> Analytics
                        </button>
                        <button onClick={() => setSidebarVisible(false)} className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                            <X size={14} />
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Geo-Spatial Intelligence</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={12} className="text-emerald-500" /> Dynamic Asset Overlay
                        </p>
                    </div>

                    <div className="mt-6 flex items-center gap-2">
                        <Badge className="bg-emerald-50 text-emerald-700 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                            {mappable.length} Active Nodes
                        </Badge>
                        <Badge className="bg-slate-50 text-slate-500 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                            Live Feed
                        </Badge>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-7 space-y-10">
                        {/* Status Filter */}
                        <section className="space-y-5">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center justify-between">
                                Status Analysis
                                <span className="h-[1px] flex-1 bg-slate-100 ml-4" />
                            </h3>
                            <div className="grid grid-cols-1 gap-1.5">
                                <button
                                    onClick={() => setFilter('status', 'All')}
                                    className={cn(
                                        "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all border",
                                        filters.status === 'All'
                                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10"
                                            : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                                    )}
                                >
                                    <span>All Units</span>
                                    <Globe size={14} className={filters.status === 'All' ? "text-emerald-400" : "text-slate-300"} />
                                </button>
                                {STATUSES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilter('status', s)}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-transparent",
                                            filters.status === s
                                                ? "bg-white text-slate-900 border-slate-200 shadow-sm"
                                                : "text-slate-500 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
                                            <span>{s}</span>
                                        </div>
                                        {filters.status === s && <div className="w-1 h-1 rounded-full bg-slate-900" />}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Inventory Composition */}
                        <section className="space-y-5">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center justify-between">
                                Asset Categories
                                <span className="h-[1px] flex-1 bg-slate-100 ml-4" />
                            </h3>
                            <div className="grid grid-cols-1 gap-1">
                                <button
                                    onClick={() => setFilter('category', 'All')}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all border w-full",
                                        filters.category === 'All'
                                            ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10"
                                            : "bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all",
                                        filters.category === 'All' ? "bg-white/10" : "bg-slate-50 border border-slate-100"
                                    )}>
                                        🗄️
                                    </div>
                                    <span className="flex-1 text-left">Consolidated Registry</span>
                                    {filters.category === 'All' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                </button>
                                {categories.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setFilter('category', c.id)}
                                        className={cn(
                                            "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all border group w-full",
                                            filters.category === c.id
                                                ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10"
                                                : "bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all",
                                            filters.category === c.id ? "bg-white/10" : "bg-slate-50 border border-slate-100 group-hover:scale-110"
                                        )}>
                                            {c.icon}
                                        </div>
                                        <span className="flex-1 text-left">{c.name}</span>
                                        {filters.category === c.id && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </ScrollArea>

                <div className="p-7 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Sync</span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[85%] animate-pulse" />
                    </div>
                </div>
            </aside>

            {/* Sidebar Toggle (Only visible when sidebar hidden) */}
            {!sidebarVisible && (
                <button
                    onClick={() => setSidebarVisible(true)}
                    className="fixed top-8 left-8 z-[1000] w-12 h-12 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all animate-in slide-in-from-left-10"
                >
                    <Navigation size={20} className="text-emerald-600" />
                </button>
            )}

            {/* Main Interactive Map */}
            <main className="flex-1 relative">
                <MapContainer
                    center={CENTER}
                    zoom={13}
                    zoomControl={false}
                    className="h-full w-full z-0 font-sans"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    <ZoomControl position="bottomright" />

                    {mappable.map(asset => (
                        <CircleMarker
                            key={asset.id}
                            center={[asset.latitude, asset.longitude]}
                            radius={mappable.length > 50 ? 6 : 8}
                            pathOptions={{
                                fillColor: STATUS_COLORS[asset.status] || '#64748b',
                                fillOpacity: 0.9,
                                color: 'white',
                                weight: 2,
                                className: 'cursor-pointer hover:scale-125 transition-all outline-none border-none shadow-2xl'
                            }}
                        >
                            <Popup className="custom-popup">
                                <div className="min-w-[280px] p-0 overflow-hidden flex flex-col bg-white rounded-2xl shadow-2xl">
                                    <div className="p-6 bg-slate-900 text-white">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0 backdrop-blur-md border border-white/10">
                                                {asset.categories?.icon || '📍'}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registry Ref</p>
                                                <p className="font-mono text-xs font-bold text-white uppercase">{asset.id.split('-')[0]}</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 space-y-1">
                                            <p className="text-lg font-bold text-white tracking-tight truncate">{asset.name}</p>
                                            <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider truncate flex items-center gap-2">
                                                <MapPin size={10} /> {asset.address || 'Geo-Location Logged'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                                                <StatusBadge status={asset.status} />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Risk Class</p>
                                                <RiskBadge label={asset.risk_label} />
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => navigate(`/assets/${asset.id}`)}
                                            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[11px] tracking-widest group shadow-lg shadow-emerald-600/10"
                                        >
                                            Inspect Infrastructure <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>

                {/* Top Right Legend & Data Cards */}
                <div className="absolute top-8 right-8 z-[1000] space-y-4">
                    <Card className="border border-slate-200/60 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden w-[220px]">
                        <div className="p-5 flex flex-col items-center">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Network Density</p>
                            <div className="flex items-end gap-1.5">
                                <span className="text-5xl font-bold text-slate-900 tracking-tighter tabular-nums leading-none">
                                    {mappable.length}
                                </span>
                                <span className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-tighter">Nodes</span>
                            </div>
                        </div>
                        <div className="px-5 py-3 bg-emerald-500/5 border-t border-emerald-500/10 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Grid Active</p>
                        </div>
                    </Card>

                    <div className="flex flex-col gap-2 scale-90 origin-top-right">
                        <Button size="icon" className="h-12 w-12 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xl rounded-2xl transition-all hover:text-emerald-600">
                            <Globe size={20} />
                        </Button>
                        <Button size="icon" className="h-12 w-12 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-xl rounded-2xl transition-all hover:text-emerald-600">
                            <Layers size={20} />
                        </Button>
                    </div>
                </div>
            </main>

            <style>{`
                .leaflet-popup-content-wrapper {
                    padding: 0;
                    border-radius: 1.5rem;
                    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.15);
                    border: 0;
                    overflow: hidden;
                }
                .leaflet-popup-content {
                    margin: 0;
                    width: auto !important;
                }
                .leaflet-container {
                    cursor: crosshair !important;
                    background: #f8fafc !important;
                }
                .custom-popup .leaflet-popup-tip-container {
                    display: none;
                }
                .leaflet-bar {
                    border: none !important;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
                }
                .leaflet-bar a {
                    background-color: white !important;
                    color: #475569 !important;
                    border: 1px solid #f1f5f9 !important;
                    border-radius: 8px !important;
                    margin-bottom: 4px !important;
                }
                .leaflet-bar a:hover {
                    color: #059669 !important;
                    background-color: #f8fafc !important;
                }
            `}</style>
        </div>
    )
}
