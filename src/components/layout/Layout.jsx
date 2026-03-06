import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { supabase } from '../../lib/supabase'
import { generateAlerts } from '../../lib/riskEngine'
import { Toaster } from "@/components/ui/sonner"

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { setAssets, setCategories, setAlerts, setMaintenanceLogs } = useStore()

    // Bootstrap: load all data on app start
    useEffect(() => {
        async function init() {
            const [{ data: assets }, { data: categories }, { data: maintLogs }] = await Promise.all([
                supabase.from('assets').select('*, categories(*)').order('created_at', { ascending: false }),
                supabase.from('categories').select('*').order('name'),
                supabase.from('maintenance_logs').select('*').order('maintenance_date', { ascending: false })
            ])

            if (assets) setAssets(assets)
            if (categories) setCategories(categories)
            if (maintLogs) setMaintenanceLogs(maintLogs)

            // Generate and sync alerts
            if (assets) {
                const fresh = generateAlerts(assets)
                // Upsert only if new (by message text to avoid duplicates on refresh)
                const { data: existingAlerts } = await supabase
                    .from('alerts').select('message')

                const existingMessages = new Set(existingAlerts?.map(a => a.message) || [])
                const newAlerts = fresh.filter(a => !existingMessages.has(a.message))

                if (newAlerts.length) {
                    await supabase.from('alerts').insert(newAlerts)
                }

                const { data: allAlerts } = await supabase
                    .from('alerts').select('*').order('created_at', { ascending: false })

                if (allAlerts) setAlerts(allAlerts)
            }
        }

        init()
    }, [])

    return (
        <div className="flex h-screen overflow-hidden bg-neutral-50">

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — desktop always visible, mobile overlay */}
            <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Mobile Menu Trigger (Sticky/Floating since Navbar is removed) */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-700 transition-all active:scale-95"
                >
                    <Menu size={24} />
                </button>

                <main className="flex-1 overflow-y-auto bg-slate-50/50">
                    <Outlet />
                </main>
                <Toaster richColors position="top-right" />
            </div>
        </div>
    )
}
