import { create } from 'zustand'

export const useStore = create((set, get) => ({
    // Data
    assets: [],
    categories: [],
    alerts: [],
    maintenanceLogs: [],

    // UI Filters (shared between Map and Table)
    filters: {
        status: 'All',
        category: 'All',
        zone: 'All',
        risk: 'All',
        search: ''
    },

    // Alert count
    unreadCount: 0,

    // Setters
    setAssets: (assets) => set({ assets }),
    setCategories: (categories) => set({ categories }),
    setMaintenanceLogs: (logs) => set({ maintenanceLogs: logs }),

    setAlerts: (alerts) => set({
        alerts,
        unreadCount: alerts.filter(a => !a.is_read).length
    }),

    setFilter: (key, value) =>
        set(state => ({ filters: { ...state.filters, [key]: value } })),

    resetFilters: () =>
        set({ filters: { status: 'All', category: 'All', zone: 'All', risk: 'All', search: '' } }),

    // Derived: maintenance logs for a specific asset
    getAssetLogs: (assetId) => {
        const { maintenanceLogs } = get()
        return maintenanceLogs.filter(l => l.asset_id === assetId)
            .sort((a, b) => new Date(b.maintenance_date) - new Date(a.maintenance_date))
    },

    // Derived: filtered assets
    getFilteredAssets: () => {
        const { assets, filters } = get()
        return assets.filter(a => {
            const matchStatus = filters.status === 'All' || a.status === filters.status
            const matchCategory = filters.category === 'All' || a.category_id === filters.category
            const matchZone = filters.zone === 'All' || a.zone === filters.zone
            const matchRisk = filters.risk === 'All' || a.risk_label === filters.risk
            const matchSearch = !filters.search ||
                a.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                a.address?.toLowerCase().includes(filters.search.toLowerCase())
            return matchStatus && matchCategory && matchZone && matchRisk && matchSearch
        })
    }
}))
