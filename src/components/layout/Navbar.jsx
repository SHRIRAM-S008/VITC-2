import { Bell, Menu } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar({ onMenuClick }) {
    const unreadCount = useStore(s => s.unreadCount)
    const navigate = useNavigate()

    return (
        <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-10 shrink-0 relative z-20">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <Menu size={20} className="text-slate-50" />
                </button>


            </div>

            {/* Right */}
            <div className="flex items-center gap-6">
                <button
                    onClick={() => navigate('/alerts')}
                    className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                    <Bell size={19} className="text-slate-500 group-hover:text-emerald-600 transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                            <span className="relative inline-flex rounded-full h-full w-full bg-rose-500 border-2 border-white"></span>
                        </span>
                    )}
                </button>

                <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-1 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 leading-tight">Admin User</p>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Infrastructure Commissioner</p>
                    </div>
                    <Avatar className="h-8 w-8 border border-slate-200 shadow-sm">
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces" />
                        <AvatarFallback className="bg-slate-900 text-white text-[10px] font-bold">AD</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}
