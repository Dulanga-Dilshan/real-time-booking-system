import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/api/admin'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'

const EMPTY = { name: '', stops: [] }
const EMPTY_STOP = { name: '', time_to_arrive: '', distance: '', lat: '', lng: '' }

export default function TemplatesPage() {
  const { t }                       = useTranslation()
  const [templates, setTemplates]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [stopForm, setStopForm]     = useState(EMPTY_STOP)

  const load = async () => {
    try {
      const res = await getTemplates()
      setTemplates(res.data.templates ?? [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setStopForm(EMPTY_STOP)
    setModal(true)
  }

  const openEdit = (tmpl) => {
    setEditing(tmpl)
    setForm({ name: tmpl.name, stops: [...tmpl.stops] })
    setStopForm(EMPTY_STOP)
    setModal(true)
  }

  const addStop = () => {
    if (!stopForm.name || stopForm.time_to_arrive === '' || stopForm.distance === '') {
      toast.error('Fill name, time and distance')
      return
    }
    const newStop = {
      index:           form.stops.length,
      name:            stopForm.name,
      time_to_arrive:  parseFloat(stopForm.time_to_arrive),
      distance:        parseFloat(stopForm.distance),
      lat:             parseFloat(stopForm.lat) || 0,
      lng:             parseFloat(stopForm.lng) || 0,
    }
    setForm(p => ({ ...p, stops: [...p.stops, newStop] }))
    setStopForm(EMPTY_STOP)
  }

  const removeStop = (idx) => {
    setForm(p => ({
      ...p,
      stops: p.stops.filter((_, i) => i !== idx).map((s, i) => ({ ...s, index: i }))
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (form.stops.length < 2) { toast.error('Add at least 2 stops'); return }
    setSaving(true)
    try {
      if (editing) {
        await updateTemplate(editing.id, form)
        toast.success('Template updated')
      } else {
        await createTemplate(form)
        toast.success('Template created')
      }
      setModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tmpl) => {
    if (!confirm(`Delete template "${tmpl.name}"?`)) return
    try {
      await deleteTemplate(tmpl.id)
      toast.success('Template deleted')
      setTemplates(prev => prev.filter(t => t.id !== tmpl.id))
    } catch {
      toast.error(t('common.error'))
    }
  }

  const sf = (k) => (e) => setStopForm(p => ({ ...p, [k]: e.target.value }))

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg"/></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('admin.route_templates')}</h1>
        <Button onClick={openCreate}>+ Add template</Button>
      </div>

      {templates.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-slate-400">No route templates yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {templates.map(tmpl => (
            <Card key={tmpl.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-slate-800 dark:text-white">{tmpl.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{tmpl.stops?.length ?? 0} stops · Used by {tmpl.bus_routes_count ?? 0} bus(es)</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(tmpl)}>{t('admin.edit')}</Button>
                  <Button size="sm" variant="danger"  onClick={() => handleDelete(tmpl)}>{t('admin.delete')}</Button>
                </div>
              </div>

              {/* Stop preview */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {tmpl.stops?.map((stop, i) => (
                  <div key={i} className="flex items-center gap-1 flex-shrink-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${i === 0 || i === tmpl.stops.length - 1 ? 'bg-blue-600' : 'bg-slate-300'}`}/>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap">{stop.name}</p>
                      <p className="text-xs text-slate-300 dark:text-slate-600">{stop.distance}km</p>
                    </div>
                    {i < tmpl.stops.length - 1 && (
                      <div className="w-6 h-px bg-slate-200 dark:bg-slate-700 mb-5 flex-shrink-0"/>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit template' : 'Add template'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Template name"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Colombo → Kandy"
            required
          />

          {/* Add stop */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Add a stop</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
              <Input placeholder="City name" value={stopForm.name} onChange={sf('name')}/>
              <Input placeholder="Hours (e.g. 1.5)" type="number" step="0.25" value={stopForm.time_to_arrive} onChange={sf('time_to_arrive')}/>
              <Input placeholder="Distance (km)"     type="number" value={stopForm.distance} onChange={sf('distance')}/>
              <Input placeholder="Latitude"  type="number" step="any" value={stopForm.lat} onChange={sf('lat')}/>
              <Input placeholder="Longitude" type="number" step="any" value={stopForm.lng} onChange={sf('lng')}/>
              <Button type="button" variant="secondary" onClick={addStop} className="self-end">Add stop</Button>
            </div>
          </div>

          {/* Stop list */}
          {form.stops.length > 0 && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{form.stops.length} stops</p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                {form.stops.map((stop, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-800 dark:text-white">{stop.name}</span>
                      <span className="text-xs text-slate-400 ml-2">{stop.distance} km · {stop.time_to_arrive}h</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStop(i)}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1" loading={saving}>
              {editing ? t('common.save') : 'Create template'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
