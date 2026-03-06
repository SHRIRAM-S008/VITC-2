import { format, formatDistanceToNow, isPast, isWithinInterval, addDays } from 'date-fns'

export const formatDate = (d) => d ? format(new Date(d), 'dd MMM yyyy') : '—'

export const daysUntil = (d) => {
    if (!d) return null
    const diff = Math.ceil((new Date(d) - new Date()) / 86400000)
    return diff
}

export const isOverdue = (d) => d && isPast(new Date(d))

export const isDueSoon = (d) => {
    if (!d) return false
    return isWithinInterval(new Date(d), {
        start: new Date(),
        end: addDays(new Date(), 30)
    })
}

export const generateAssetId = (existingIds = []) => {
    const year = new Date().getFullYear()
    const nums = existingIds
        .filter(id => id.startsWith(`INF-${year}`))
        .map(id => parseInt(id.split('-')[2]))
        .filter(Boolean)
    const next = nums.length ? Math.max(...nums) + 1 : 1
    return `INF-${year}-${String(next).padStart(3, '0')}`
}

export const ZONES = ['Zone-A', 'Zone-B', 'Zone-C', 'Zone-D']
export const STATUSES = ['Operational', 'Under Maintenance', 'Critical', 'Decommissioned']
export const RISK_LABELS = ['LOW', 'MEDIUM', 'HIGH']
