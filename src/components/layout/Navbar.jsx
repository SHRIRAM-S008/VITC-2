import { Bell, Search, Menu, Command } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useNavigate } from 'react-router-dom'
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar({ onMenuClick }) {
    const unreadCount = useStore(s => s.unreadCount)
    const setFilter = useStore(s => s.setFilter)
    const navigate = useNavigate()

    return (
        <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-20 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                    <Menu size={20} className="text-slate-600" />
                </button>

                {/* Global Search */}
                <div className="relative hidden md:block group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <Search size={14} className="text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search assets, zones or departments..."
                        onChange={e => {
                            setFilter('search', e.target.value)
                            if (e.target.value) navigate('/assets')
                        }}
                        className="pl-9 pr-12 py-2 text-sm bg-slate-50 border border-slate-100 rounded-xl w-80 lg:w-96 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:bg-white focus:border-slate-200 transition-all font-medium placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 px-1.5 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-400 bg-white shadow-sm">
                        <Command size={10} /> K
                    </div>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/alerts')}
                    className="relative p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
                >
                    <Bell size={20} className="text-slate-600 group-hover:text-slate-900 transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
                        </span>
                    )}
                </button>

                <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block" />

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-1 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-900 leading-tight">Admin User</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Corporation Commissioner</p>
                    </div>
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm group-hover:ring-2 group-hover:ring-slate-100 transition-all">
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces" />
                        <AvatarFallback className="bg-slate-900 text-white text-xs font-black tracking-tighter">AD</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}
