import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { calculateRisk } from '../lib/riskEngine'
import { generateAssetId, STATUSES, ZONES } from '../lib/formatters'
import { toast } from 'sonner'
import { ArrowLeft, Save, Info, MapPin, Wrench, ShieldAlert, Camera, Building2, Layers } from 'lucide-react'
import PageHeader from '../components/shared/PageHeader'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const schema = z.object({
    name: z.string().min(3, 'Corporate Name must be at least 3 characters'),
    description: z.string().optional(),
    category_id: z.string().min(1, 'Departmental classification required'),
    status: z.enum(['Operational', 'Under Maintenance', 'Critical', 'Decommissioned']),
    condition_score: z.coerce.number().min(1).max(10),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
    address: z.string().optional(),
    zone: z.string().min(1, 'Territorial zone assignment is mandatory'),
    install_year: z.coerce.number().min(1900).max(new Date().getFullYear()).optional().nullable(),
    last_maintained: z.string().optional(),
    next_due: z.string().optional(),
    notes: z.string().optional(),
    image_url: z.string().url('Source must be a valid HTTPS URL').optional().or(z.literal('')),
})

export default function AssetFormPage({ mode }) {
    const navigate = useNavigate()
    const { id } = useParams()
    const { categories, assets, setAssets } = useStore()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { status: 'Operational', condition_score: 7 }
    })

    useEffect(() => {
        if (mode === 'edit' && id) {
            const asset = assets.find(a => a.id === id)
            if (asset) reset({ ...asset, category_id: asset.category_id || '' })
        }
    }, [mode, id, assets])

    const onSubmit = async (formData) => {
        setLoading(true)
        try {
            const { risk_score, risk_label } = calculateRisk(formData)
            const payload = { ...formData, risk_score, risk_label }

            if (mode === 'create') {
                const newId = generateAssetId(assets.map(a => a.id))
                const { data, error } = await supabase
                    .from('assets')
                    .insert({ ...payload, id: newId })
                    .select('*, categories(*)')
                    .single()

                if (error) throw error

                // Log history
                await supabase.from('history_log').insert({
                    asset_id: newId, action_type: 'CREATE',
                    new_values: payload, changed_fields: Object.keys(payload),
                    performed_by: 'Admin'
                })

                setAssets([data, ...assets])
                toast.success('Asset commissioned and registered successfully.')
                navigate(`/assets/${newId}`)

            } else {
                const oldAsset = assets.find(a => a.id === id)
                const { data, error } = await supabase
                    .from('assets')
                    .update(payload)
                    .eq('id', id)
                    .select('*, categories(*)')
                    .single()

                if (error) throw error

                // Compute changed fields for log
                const changedFields = Object.keys(formData).filter(k => formData[k] !== oldAsset[k])
                const oldValues = {}
                const newValues = {}
                changedFields.forEach(k => { oldValues[k] = oldAsset[k]; newValues[k] = formData[k] })

                await supabase.from('history_log').insert({
                    asset_id: id, action_type: 'UPDATE',
                    changed_fields: changedFields, old_values: oldValues, new_values: newValues,
                    performed_by: 'Admin'
                })

                setAssets(assets.map(a => a.id === id ? data : a))
                toast.success('Registry record updated.')
                navigate(`/assets/${id}`)
            }
        } catch (err) {
            toast.error(err.message || 'System fault occurred during synchronization.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title={mode === 'create' ? 'Asset Commissioning' : 'Configuration Update'}
                subtitle={mode === 'edit' ? `Modifying technical parameters for record ID: ${id}` : 'Register a new infrastructure component into the global intelligence registry.'}
                actions={
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-900 h-8 font-black uppercase tracking-widest text-[10px]">
                        <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Abort Protocol
                    </Button>
                }
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Section: Core Intelligence */}
                <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                    <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                                <Info size={16} />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Base Metadata</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Essential identification and classification metrics</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Formal Asset Identity *</Label>
                                <Input {...register('name')} placeholder="e.g. Sector 12 Power Grid Interface"
                                    className={cn("rounded-xl border-slate-200 h-11 focus-visible:ring-slate-900/5", errors.name && "border-rose-300")} />
                                {errors.name && <p className="text-[10px] font-bold text-rose-500 uppercase">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Departmental Archetype *</Label>
                                <select {...register('category_id')} className="w-full h-11 px-3 text-sm font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all cursor-pointer">
                                    <option value="">Select Department...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-[10px] font-bold text-rose-500 uppercase">{errors.category_id.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Operational State *</Label>
                                <select {...register('status')} className="w-full h-11 px-3 text-sm font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all cursor-pointer">
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Health Index (1–10) *</Label>
                                <Input {...register('condition_score')} type="number" min={1} max={10}
                                    className="rounded-xl border-slate-200 h-11 focus-visible:ring-slate-900/5" />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Operational Synopsis</Label>
                                <textarea {...register('description')} rows={3}
                                    placeholder="Enter detailed technical description and functional purpose..."
                                    className="w-full p-4 text-sm font-medium border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all resize-none" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section: Geospatial Matrix */}
                <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                    <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                                <MapPin size={16} />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Geospatial Logistics</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Locational coordinates and territorial boundary mapping</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Physical Address</Label>
                                <Input {...register('address')} placeholder="Primary street or landmark reference"
                                    className="rounded-xl border-slate-200 h-11" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Assigned Zone Protocol *</Label>
                                <select {...register('zone')} className="w-full h-11 px-3 text-sm font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all cursor-pointer">
                                    <option value="">Zone Boundary Selection...</option>
                                    {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                                </select>
                                {errors.zone && <p className="text-[10px] font-bold text-rose-500 uppercase">{errors.zone.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Latitude (Decimal)</Label>
                                <Input {...register('latitude')} type="number" step="any" placeholder="e.g. 13.0827"
                                    className="rounded-xl border-slate-200 h-11" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Longitude (Decimal)</Label>
                                <Input {...register('longitude')} type="number" step="any" placeholder="e.g. 80.2707"
                                    className="rounded-xl border-slate-200 h-11" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section: Lifecycle Management */}
                <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                    <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                                <Wrench size={16} />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Lifecycle & Risk Protocol</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Maintenance cycles and documentation</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inception Year</Label>
                                <Input {...register('install_year')} type="number" placeholder="2024"
                                    className="rounded-xl border-slate-200 h-11" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Previous Log Date</Label>
                                <Input {...register('last_maintained')} type="date" className="rounded-xl border-slate-200 h-11" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Scheduled Window</Label>
                                <Input {...register('next_due')} type="date" className="rounded-xl border-slate-200 h-11" />
                            </div>

                            <div className="md:col-span-3 space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Official Record Notes</Label>
                                <textarea {...register('notes')} rows={2}
                                    placeholder="Internal observations for maintenance crews..."
                                    className="w-full p-4 text-xs font-medium border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all resize-none" />
                            </div>

                            <div className="md:col-span-3 space-y-2 pt-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                    <Camera size={12} /> External Visual Asset URL
                                </Label>
                                <Input {...register('image_url')} type="url"
                                    placeholder="https://cloud.storage/official/img-ref.jpg"
                                    className="rounded-xl border-slate-200 h-11" />
                                {errors.image_url && <p className="text-[10px] font-bold text-rose-500 uppercase">{errors.image_url.message}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Final Submission */}
                <div className="flex items-center justify-end gap-4 pt-4 pb-12">
                    <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="rounded-xl px-10 h-12 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100">
                        Cancel Protocol
                    </Button>
                    <Button type="submit" disabled={loading} className="rounded-2xl px-12 h-14 bg-slate-900 shadow-xl shadow-slate-200 font-black uppercase text-xs tracking-[0.2em]">
                        <Save className="mr-3 h-4 w-4" />
                        {loading ? 'Synchronizing Registry...' : mode === 'create' ? 'Finalize Commission' : 'Update Record'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
