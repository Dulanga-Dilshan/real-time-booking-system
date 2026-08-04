import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Switch } from 'react-native'
import { getAdminRoutes, createRoute, updateRoute, deleteRoute, getTemplates } from '@/api/admin'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import dayjs from 'dayjs'
import toast from '@/lib/toast'

const EMPTY_FORM = {
  bus_number: '', from_location: '', to_location: '',
  departure_time: '', arrival_time: '', total_seats: '40',
  price: '', route_template_id: '', is_active: true,
}

export default function RoutesScreen() {
  const [routes, setRoutes] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [r, t2] = await Promise.all([getAdminRoutes(), getTemplates()])
      setRoutes(r.data.routes ?? [])
      setTemplates(t2.data.templates ?? [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true) }

  const openEdit = (route) => {
    setEditing(route)
    setForm({
      bus_number: route.bus_number ?? '',
      from_location: route.from_location,
      to_location: route.to_location,
      departure_time: route.departure_time,
      arrival_time: route.arrival_time,
      total_seats: String(route.total_seats),
      price: String(route.price),
      route_template_id: route.route_template_id ? String(route.route_template_id) : '',
      is_active: route.is_active,
    })
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.from_location || !form.to_location || !form.departure_time || !form.arrival_time || !form.price) {
      toast.error('Fill in all required fields')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        total_seats: parseInt(form.total_seats),
        price: parseFloat(form.price),
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
      toast.error(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (route) => {
    try {
      await deleteRoute(route.id)
      toast.success('Route deleted')
      setRoutes((prev) => prev.filter((r) => r.id !== route.id))
    } catch {
      toast.error('Something went wrong')
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerClassName="p-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-slate-800 dark:text-white">Routes</Text>
        <Button title="+ Add" onPress={openCreate} />
      </View>

      {routes.map((route) => (
        <Card key={route.id} className="p-4 mb-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-medium text-slate-800 dark:text-white flex-1">
              {route.from_location} → {route.to_location}
            </Text>
            <Badge variant={route.is_active ? 'green' : 'slate'}>{route.is_active ? 'Active' : 'Inactive'}</Badge>
          </View>
          <Text className="text-xs text-slate-400 mb-3">
            {dayjs(`1970-01-01T${route.departure_time}`).format('h:mm A')} · {route.total_seats} seats · LKR {Number(route.price).toLocaleString()}
          </Text>
          <View className="flex-row gap-2">
            <Button title="Edit" size="sm" variant="outline" className="flex-1" onPress={() => openEdit(route)} />
            <Button title="Delete" size="sm" variant="danger" className="flex-1" onPress={() => handleDelete(route)} />
          </View>
        </Card>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit route' : 'Add route'}>
        <ScrollView className="gap-4" style={{ maxHeight: 500 }}>
          <View className="gap-4">
            <Input label="Bus number" value={form.bus_number} onChangeText={(v) => setForm((p) => ({ ...p, bus_number: v }))} placeholder="e.g. NB-1234" />
            <Input label="From" value={form.from_location} onChangeText={(v) => setForm((p) => ({ ...p, from_location: v }))} />
            <Input label="To" value={form.to_location} onChangeText={(v) => setForm((p) => ({ ...p, to_location: v }))} />
            <Input label="Departure time (HH:MM)" value={form.departure_time} onChangeText={(v) => setForm((p) => ({ ...p, departure_time: v }))} placeholder="08:00" />
            <Input label="Arrival time (HH:MM)" value={form.arrival_time} onChangeText={(v) => setForm((p) => ({ ...p, arrival_time: v }))} placeholder="12:00" />
            <Input label="Total seats" value={form.total_seats} onChangeText={(v) => setForm((p) => ({ ...p, total_seats: v }))} keyboardType="number-pad" />
            <Input label="Price (LKR)" value={form.price} onChangeText={(v) => setForm((p) => ({ ...p, price: v }))} keyboardType="decimal-pad" />
            <Select label="Route template" selectedValue={form.route_template_id} onValueChange={(v) => setForm((p) => ({ ...p, route_template_id: v }))}>
              <Select.Item label="No template" value="" />
              {templates.map((tmpl) => (
                <Select.Item key={tmpl.id} label={tmpl.name} value={String(tmpl.id)} />
              ))}
            </Select>
            {editing && (
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">Route is active</Text>
                <Switch value={form.is_active} onValueChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
              </View>
            )}
          </View>
        </ScrollView>
        <View className="flex-row gap-3 pt-4">
          <Button title="Cancel" variant="secondary" className="flex-1" onPress={() => setModal(false)} />
          <Button title={editing ? 'Save' : 'Add route'} className="flex-1" loading={saving} onPress={handleSave} />
        </View>
      </Modal>
    </ScrollView>
  )
}