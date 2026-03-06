import { cn } from "@/lib/utils"

export default function PageHeader({ title, subtitle, actions, className }) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10", className)}>
            <div className="space-y-1.5 min-w-0">
                <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-[14px] font-medium text-slate-500 max-w-2xl leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3 shrink-0 pt-1">
                    {actions}
                </div>
            )}
        </div>
    )
}
