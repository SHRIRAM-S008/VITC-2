export function calculateRisk(asset) {
    const today = new Date()
    const currentYear = today.getFullYear()

    // Age factor (max 25 pts)
    const age = currentYear - (asset.install_year || currentYear)
    const agePts = Math.min(age / 25, 1) * 25

    // Condition factor (max 35 pts) — lower condition = higher risk
    const condPts = ((10 - (asset.condition_score || 5)) / 9) * 35

    // Overdue factor (max 30 pts)
    let overduePts = 0
    if (asset.next_due) {
        const daysOverdue = Math.floor(
            (today - new Date(asset.next_due)) / 86400000
        )
        if (daysOverdue > 0) {
            overduePts = Math.min(daysOverdue / 180, 1) * 30
        }
    }

    // Critical status bonus (10 pts)
    const statusPts = asset.status === 'Critical' ? 10 : 0

    const total = agePts + condPts + overduePts + statusPts

    return {
        risk_score: Math.round(total * 10) / 10,
        risk_label: total >= 65 ? 'HIGH' : total >= 35 ? 'MEDIUM' : 'LOW'
    }
}

export function generateAlerts(assets) {
    const today = new Date()
    const in30Days = new Date(today.getTime() + 30 * 86400000)
    const alerts = []

    for (const asset of assets) {
        const due = asset.next_due ? new Date(asset.next_due) : null

        if (due && due < today) {
            alerts.push({
                asset_id: asset.id,
                asset_name: asset.name,
                alert_type: 'OVERDUE_MAINTENANCE',
                message: `${asset.name} maintenance overdue since ${asset.next_due}`,
                severity: 'HIGH',
                is_read: false
            })
        } else if (due && due <= in30Days) {
            alerts.push({
                asset_id: asset.id,
                asset_name: asset.name,
                alert_type: 'UPCOMING_MAINTENANCE',
                message: `${asset.name} maintenance due on ${asset.next_due}`,
                severity: 'MEDIUM',
                is_read: false
            })
        }

        if ((asset.condition_score || 10) <= 3) {
            alerts.push({
                asset_id: asset.id,
                asset_name: asset.name,
                alert_type: 'LOW_CONDITION',
                message: `${asset.name} condition score is critically low: ${asset.condition_score}/10`,
                severity: 'HIGH',
                is_read: false
            })
        }
    }

    return alerts
}
