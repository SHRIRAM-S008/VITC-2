import { cn } from "@/lib/utils"

export default function PageHeader({ title, subtitle, actions, className }) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-50", className)}>
            <div className="space-y-1.5 min-w-0">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                    {title}
                    <span className="text-blue-500 ml-1 opacity-20">.</span>
                </h1>
                {subtitle && (
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-2xl">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    )
}
