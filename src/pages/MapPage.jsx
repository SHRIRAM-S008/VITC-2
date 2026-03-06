import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useStore } from '../store/useStore'
import { StatusBadge, RiskBadge } from '../components/shared/Badge'
import { STATUSES, ZONES } from '../lib/formatters'
import { ArrowRight, Filter, Globe, Layers, Navigation, Search, X } from 'lucide-react'
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
    'Operational': '#10b981',
    'Under Maintenance': '#f59e0b',
    'Critical': '#ef4444',
    'Decommissioned': '#64748b',
}

export default function MapPage() {
    const navigate = useNavigate()
    const { assets, filters, setFilter, resetFilters, categories } = useStore()

    const mappable = useMemo(() => assets.filter(a =>
        a.latitude && a.longitude &&
        (filters.status === 'All' || a.status === filters.status) &&
        (filters.zone === 'All' || a.zone === filters.zone) &&
        (filters.category === 'All' || a.category_id === filters.category)
    ), [assets, filters])

    const CENTER = [13.0827, 80.2707] // Chennai

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 animate-in fade-in duration-500">

            {/* Left Control Panel */}
            <aside className="w-80 shrink-0 bg-white border-r border-slate-200/60 flex flex-col z-10 shadow-xl shadow-slate-200/50">
                <div className="p-6 border-b border-slate-50 bg-slate-900 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <Navigation size={14} className="text-blue-400" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Geo-Spatial Intelligence</h2>
                    </div>
                    <p className="text-xl font-black tracking-tight">Real-time Overlay</p>
                    <div className="mt-4 flex items-center justify-between">
                        <Badge className="bg-white/10 text-white border-none text-[10px] font-black uppercase tracking-widest">
                            {mappable.length} Nodes Active
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={resetFilters} className="h-6 w-6 text-slate-400 hover:text-white rounded-lg">
                            <X size={14} />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-8">
                        {/* Status Filter */}
                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-4 h-0.5 bg-slate-200 rounded-full" /> Operational Status
                            </h3>
                            <div className="grid grid-cols-1 gap-1.5">
                                <button
                                    onClick={() => setFilter('status', 'All')}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all",
                                        filters.status === 'All' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <span>All Units</span>
                                    {filters.status === 'All' && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                </button>
                                {STATUSES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilter('status', s)}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all",
                                            filters.status === s ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2 h-2 rounded-full ring-2 ring-offset-2 ring-transparent" style={{ backgroundColor: STATUS_COLORS[s] }} />
                                            <span>{s}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Zone Filter */}
                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-4 h-0.5 bg-slate-200 rounded-full" /> Territory
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilter('zone', 'All')}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border",
                                        filters.zone === 'All' ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                                    )}
                                >
                                    All Zones
                                </button>
                                {ZONES.map(z => (
                                    <button
                                        key={z}
                                        onClick={() => setFilter('zone', z)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border",
                                            filters.zone === z ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                                        )}
                                    >
                                        {z}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Category Filter */}
                        <section className="space-y-4 pt-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-4 h-0.5 bg-slate-200 rounded-full" /> Category Type
                            </h3>
                            <div className="grid grid-cols-1 gap-1">
                                <button
                                    onClick={() => setFilter('category', 'All')}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                                        filters.category === 'All' ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <Layers size={14} className="text-slate-300" />
                                    <span>Global Inventory</span>
                                </button>
                                {categories.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setFilter('category', c.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                                            filters.category === c.id ? "bg-slate-100 text-slate-900 border-l-2 border-slate-900 rounded-l-none" : "text-slate-500 hover:bg-slate-50"
                                        )}
                                    >
                                        <span className="text-base group-hover:scale-125 transition-transform">{c.icon}</span>
                                        <span>{c.name}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </ScrollArea>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Satellite Reference: OS-V3</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Continuous Geo-Sync Active</p>
                </div>
            </aside>

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

                    {mappable.map(asset => (
                        <CircleMarker
                            key={asset.id}
                            center={[asset.latitude, asset.longitude]}
                            radius={8}
                            pathOptions={{
                                fillColor: STATUS_COLORS[asset.status] || '#64748b',
                                fillOpacity: 0.9,
                                color: 'white',
                                weight: 2,
                                className: 'cursor-pointer hover:scale-125 transition-all outline-none border-none shadow-2xl'
                            }}
                        >
                            <Popup className="custom-popup">
                                <div className="min-w-[240px] p-2 space-y-4 animate-in zoom-in-95 duration-200">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-lg shrink-0 shadow-lg">
                                            {asset.categories?.icon || '📍'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-900 tracking-tight leading-tight mb-0.5 truncate">{asset.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{asset.address}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live State</p>
                                            <StatusBadge status={asset.status} className="scale-75 origin-left" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Risk Factor</p>
                                            <RiskBadge label={asset.risk_label} className="scale-75 origin-left" />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => navigate(`/assets/${asset.id}`)}
                                        className="w-full h-8 rounded-lg bg-slate-900 font-bold uppercase text-[9px] tracking-[0.1em] mt-2 group"
                                    >
                                        Inspect Entity <ArrowRight size={10} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>

                {/* Floating Map Controls & Overlays */}
                <div className="absolute top-6 right-6 z-[1000] space-y-3">
                    <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden min-w-[160px]">
                        <div className="p-4 flex flex-col items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Density</p>
                            <div className="flex items-end gap-1">
                                <span className="text-4xl font-black text-slate-900 tabular-nums">
                                    {mappable.length}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Nodes</span>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-slate-900/5 flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[9px] font-bold text-slate-600 uppercase">Feed Stable</p>
                        </div>
                    </Card>

                    <div className="flex flex-col gap-2">
                        <Button size="icon" className="h-10 w-10 bg-white hover:bg-slate-50 text-slate-900 border-none shadow-xl rounded-xl">
                            <Globe size={18} />
                        </Button>
                        <Button size="icon" className="h-10 w-10 bg-white hover:bg-slate-50 text-slate-900 border-none shadow-xl rounded-xl">
                            <Layers size={18} />
                        </Button>
                    </div>
                </div>
            </main>

            <style>{`
                .leaflet-popup-content-wrapper {
                    padding: 0;
                    border-radius: 1.25rem;
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
                }
                .custom-popup .leaflet-popup-tip-container {
                    display: none;
                }
            `}</style>
        </div>
    )
}
