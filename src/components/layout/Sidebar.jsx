import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, Map, Database, Tag,
    Bell, Plus, ChevronRight, Building2, Command,
    Settings, LogOut, ChartPie
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Analytics' },
    { to: '/map', icon: Map, label: 'Geo-Intelligence' },
    { to: '/assets', icon: Database, label: 'Asset Register' },
    { to: '/alerts', icon: Bell, label: 'Incident Log', badge: true },
]

export default function Sidebar({ onClose }) {
    const navigate = useNavigate()
    const unreadCount = useStore(s => s.unreadCount)

    return (
        <aside className="h-full flex flex-col bg-white border-r border-slate-200/60 w-72 lg:w-64 transition-all duration-300 relative z-40 lg:translate-x-0">
            {/* Logo Section */}
            <div className="px-6 py-8 border-b border-slate-50">
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <Command size={20} className="text-white fill-white/10" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1">
                            SCIS Intelligence
                        </p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter truncate font-mono">Mission Critical System</p>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 py-8 space-y-6 overflow-y-auto scrollbar-none">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-3">
                        Operational Intelligence
                    </p>
                    {navItems.map(({ to, icon: Icon, label, badge }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group relative",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 active:scale-95"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )
                            }
                        >
                            <span className="flex items-center gap-4">
                                <Icon size={18} className={cn("transition-transform group-hover:scale-110", badge && unreadCount > 0 && "animate-pulse")} />
                                <span className="tracking-tight">{label}</span>
                            </span>
                            {badge && unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-[20px] px-1 shadow-sm font-black text-[10px] border-none ring-2 ring-white">
                                    {unreadCount}
                                </Badge>
                            )}
                            <ChevronRight size={12} className={cn("opacity-0 transition-opacity", !badge && "group-hover:opacity-40")} />
                        </NavLink>
                    ))}
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-3">
                        Strategic Management
                    </p>
                    <button onClick={() => { navigate('/assets/new'); onClose(); }}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 group">
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        <span>Deploy New Asset</span>
                    </button>
                    <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 group opacity-50 cursor-not-allowed">
                        <ChartPie size={18} />
                        <span>Executive Summary</span>
                    </button>
                </div>
            </nav>

            {/* Action Bar / Utility Footer */}
            <div className="p-4 space-y-2 mb-2">
                <div className="bg-slate-50 rounded-2xl p-4 space-y-4 shadow-inner border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                            <Settings size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 leading-tight">System Settings</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Configurations</p>
                        </div>
                    </div>
                </div>

                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all duration-300 group">
                    <span className="flex items-center gap-4">
                        <LogOut size={18} />
                        <span className="tracking-tight">Sign Out</span>
                    </span>
                    <ChevronRight size={12} className="opacity-0 group-hover:opacity-40" />
                </button>
            </div>

            <div className="px-6 pb-6 text-center">
                <p className="text-[10px] font-black uppercase text-rose-500 tracking-[0.3em] animate-pulse">
                    CODE RED: SYSTEM ACTIVE
                </p>
            </div>
        </aside>
    )
}
