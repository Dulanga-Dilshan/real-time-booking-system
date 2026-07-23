import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { getAdminRoutes, createRoute, updateRoute, deleteRoute } from '@/api/admin'
import { getTemplates } from '@/api/admin'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'

const EMPTY_FORM = {
  bus_number: '', from_location: '', to_location: '',
  departure_time: '', arrival_time: '', total_seats: 40,
  price: '', route_template_id: '', is_active: true,
}

export default function RoutesPage() {
  const { t } = useTranslation()
  const [routes, setRoutes]       = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  const load = async () => {
    try {
      const [r, t2] = await Promise.all([getAdminRoutes(), getTemplates()])
      setRoutes(r.data.routes ?? [])
      setTemplates(t2.data.templates ?? [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModal(true)
  }

  const openEdit = (route) => {
    setEditing(route)
    setForm({
      bus_number:        route.bus_number        ?? '',
      from_location:     route.from_location,
      to_location:       route.to_location,
      departure_time:    route.departure_time,
      arrival_time:      route.arrival_time,
      total_seats:       route.total_seats,
      price:             route.price,
      route_template_id: route.route_template_id ?? '',
      is_active:         route.is_active,
    })
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        total_seats:       parseInt(form.total_seats),
        price:             parseFloat(form.price),
        route_template_id: form.route_template_id || undefined,
      }
      if (editing) {
        await updateRoute(editing.id, payload)
        toast.success('Route updated')
      } else {
        await createRoute(payload)
        toast.success('Route created')
      }
      setModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (route) => {
    if (!confirm(`Delete ${route.from_location} → ${route.to_location}?`)) return
    try {
      await deleteRoute(route.id)
      toast.success('Route deleted')
      setRoutes(prev => prev.filter(r => r.id !== route.id))
    } catch {
      toast.error(t('common.error'))
    }
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg"/></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('admin.all_routes')}</h1>
        <Button onClick={openCreate}>+ {t('admin.add_route')}</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {['Route', t('admin.departure'), t('admin.seats'), t('admin.price'), 'Status', ''].map((h, i) => (
                  <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {routes.map(route => (
                <tr key={route.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {route.bus_number && (
                        <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {route.bus_number}
                        </span>
                      )}
                      <span className="font-medium text-slate-800 dark:text-white">
                        {route.from_location} → {route.to_location}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {dayjs(`1970-01-01T${route.departure_time}`).format('h:mm A')}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{route.total_seats}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    LKR {Number(route.price).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={route.is_active ? 'green' : 'slate'}>
                      {route.is_active ? t('admin.active') : t('admin.inactive')}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => openEdit(route)}>{t('admin.edit')}</Button>
                      <Button size="sm" variant="danger"  onClick={() => handleDelete(route)}>{t('admin.delete')}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit route' : 'Add route'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Bus number" value={form.bus_number} onChange={f('bus_number')} placeholder="e.g. NB-1234"/>
            </div>
            <Input label="From" value={form.from_location} onChange={f('from_location')} required/>
            <Input label="To"   value={form.to_location}   onChange={f('to_location')}   required/>
            <Input label="Departure time" type="time" value={form.departure_time} onChange={f('departure_time')} required/>
            <Input label="Arrival time"   type="time" value={form.arrival_time}   onChange={f('arrival_time')}   required/>
            <Input label="Total seats" type="number" min={1} max={100} value={form.total_seats} onChange={f('total_seats')} required/>
            <Input label="Price (LKR)"  type="number" min={0} step="0.01" value={form.price} onChange={f('price')} required/>
            <div className="col-span-2">
              <Select label="Route template" value={form.route_template_id} onChange={f('route_template_id')}>
                <option value="">No template</option>
                {templates.map(tmpl => (
                  <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                ))}
              </Select>
            </div>
            {editing && (
              <div className="col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Route is active
                </label>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1" loading={saving}>
              {editing ? t('common.save') : 'Add route'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
