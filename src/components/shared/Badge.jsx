import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export function StatusBadge({ status, className }) {
    const variants = {
        'Operational': 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 shadow-none',
        'Under Maintenance': 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 shadow-none',
        'Critical': 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50 shadow-none',
        'Decommissioned': 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-50 shadow-none',
    }

    return (
        <Badge variant="outline" className={cn(variants[status] || 'bg-slate-50 text-slate-700 border-slate-200', 'px-2 py-0.5 font-medium rounded-lg', className)}>
            {status}
        </Badge>
    )
}

export function RiskBadge({ label, className }) {
    const variants = {
        HIGH: 'bg-red-600 text-white border-transparent hover:bg-red-600',
        MEDIUM: 'bg-amber-500 text-white border-transparent hover:bg-amber-500',
        LOW: 'bg-emerald-500 text-white border-transparent hover:bg-emerald-500',
    }

    return (
        <Badge className={cn(variants[label] || '', 'px-1.5 py-0 font-bold text-[10px] tracking-widest rounded-sm', className)}>
            {label}
        </Badge>
    )
}

export function ConditionBar({ score, className }) {
    const colorClass = score <= 3 ? '[&>div]:bg-red-500' : score <= 6 ? '[&>div]:bg-amber-400' : '[&>div]:bg-emerald-500'

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Progress
                value={score * 10}
                className={cn("h-1.5 w-full bg-slate-100", colorClass)}
            />
            <span className="text-xs font-semibold text-slate-500 min-w-8 text-right font-mono">{score}/10</span>
        </div>
    )
}
