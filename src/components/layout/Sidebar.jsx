import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, Map, Database, Tag,
    Bell, Plus, ChevronRight, Building2, Command,
    Settings, LogOut, ChartPie, User
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
        <aside className="h-full flex flex-col bg-[#F9FAFB] border-r border-slate-200/80 w-72 lg:w-64 transition-all duration-300 relative z-40 lg:translate-x-0">
            {/* Logo Section */}
            <div className="px-6 py-7">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                    <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors">
                        <Building2 size={20} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[17px] font-bold text-slate-900 tracking-tight">
                            CityCore <span className="text-emerald-600">Assets</span>
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">Infrastructure Management</p>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-3 space-y-7 overflow-y-auto mt-2">
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-3">
                        Main Menu
                    </p>
                    {navItems.map(({ to, icon: Icon, label, badge }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )
                            }
                        >
                            <span className="flex items-center gap-3">
                                <Icon size={18} className={cn("transition-colors", badge && unreadCount > 0 ? "text-rose-500" : "opacity-70 group-hover:opacity-100")} />
                                <span>{label}</span>
                            </span>
                            {badge && unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 font-bold text-[11px] bg-rose-500 hover:bg-rose-600 border-none">
                                    {unreadCount}
                                </Badge>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-3">
                        Operations
                    </p>
                    <button onClick={() => { navigate('/assets/new'); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all group">
                        <Plus size={18} className="opacity-70 group-hover:opacity-100" />
                        <span>Register New Asset</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 opacity-60 cursor-not-allowed">
                        <ChartPie size={18} />
                        <span>System Audit</span>
                    </button>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 mt-auto space-y-4">
            </div>
        </aside>
    )
}
