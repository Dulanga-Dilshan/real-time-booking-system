import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/api/admin'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import toast from '@/lib/toast'

const EMPTY = { name: '', stops: [] }
const EMPTY_STOP = { name: '', time_to_arrive: '', distance: '', lat: '', lng: '' }

export default function TemplatesScreen() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [stopForm, setStopForm] = useState(EMPTY_STOP)

  const load = async () => {
    try {
      const res = await getTemplates()
      setTemplates(res.data.templates ?? [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setStopForm(EMPTY_STOP); setModal(true) }
  const openEdit = (tmpl) => { setEditing(tmpl); setForm({ name: tmpl.name, stops: [...tmpl.stops] }); setStopForm(EMPTY_STOP); setModal(true) }

  const addStop = () => {
    if (!stopForm.name || stopForm.time_to_arrive === '' || stopForm.distance === '') {
      toast.error('Fill name, time and distance')
      return
    }
    const newStop = {
      index: form.stops.length,
      name: stopForm.name,
      time_to_arrive: parseFloat(stopForm.time_to_arrive),
      distance: parseFloat(stopForm.distance),
      lat: parseFloat(stopForm.lat) || 0,
      lng: parseFloat(stopForm.lng) || 0,
    }
    setForm((p) => ({ ...p, stops: [...p.stops, newStop] }))
    setStopForm(EMPTY_STOP)
  }

  const removeStop = (idx) => {
    setForm((p) => ({ ...p, stops: p.stops.filter((_, i) => i !== idx).map((s, i) => ({ ...s, index: i })) }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Enter a template name')
    if (form.stops.length < 2) return toast.error('Add at least 2 stops')
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
      toast.error(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tmpl) => {
    try {
      await deleteTemplate(tmpl.id)
      toast.success('Template deleted')
      setTemplates((prev) => prev.filter((t) => t.id !== tmpl.id))
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
        <Text className="text-2xl font-bold text-slate-800 dark:text-white">Route templates</Text>
        <Button title="+ Add" onPress={openCreate} />
      </View>

      {templates.length === 0 ? (
        <Card className="items-center py-16"><Text className="text-slate-400">No templates yet.</Text></Card>
      ) : (
        templates.map((tmpl) => (
          <Card key={tmpl.id} className="p-4 mb-3">
            <Text className="font-semibold text-slate-800 dark:text-white">{tmpl.name}</Text>
            <Text className="text-xs text-slate-400 mb-3">
              {tmpl.stops?.length ?? 0} stops · Used by {tmpl.bus_routes_count ?? 0} bus(es)
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {tmpl.stops?.map((s) => s.name).join('  →  ')}
            </Text>
            <View className="flex-row gap-2">
              <Button title="Edit" size="sm" variant="outline" className="flex-1" onPress={() => openEdit(tmpl)} />
              <Button title="Delete" size="sm" variant="danger" className="flex-1" onPress={() => handleDelete(tmpl)} />
            </View>
          </Card>
        ))
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit template' : 'Add template'}>
        <ScrollView style={{ maxHeight: 500 }}>
          <Input label="Template name" value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="e.g. Colombo → Kandy" />

          <View className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mt-4 gap-2">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Add a stop</Text>
            <Input placeholder="City name" value={stopForm.name} onChangeText={(v) => setStopForm((p) => ({ ...p, name: v }))} />
            <Input placeholder="Hours from start (e.g. 1.5)" value={stopForm.time_to_arrive} onChangeText={(v) => setStopForm((p) => ({ ...p, time_to_arrive: v }))} keyboardType="decimal-pad" />
            <Input placeholder="Distance (km)" value={stopForm.distance} onChangeText={(v) => setStopForm((p) => ({ ...p, distance: v }))} keyboardType="decimal-pad" />
            <Input placeholder="Latitude" value={stopForm.lat} onChangeText={(v) => setStopForm((p) => ({ ...p, lat: v }))} keyboardType="decimal-pad" />
            <Input placeholder="Longitude" value={stopForm.lng} onChangeText={(v) => setStopForm((p) => ({ ...p, lng: v }))} keyboardType="decimal-pad" />
            <Button title="Add stop" variant="secondary" onPress={addStop} />
          </View>

          {form.stops.length > 0 && (
            <View className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-4">
              <View className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{form.stops.length} stops</Text>
              </View>
              {form.stops.map((stop, i) => (
                <View key={i} className="px-4 py-2.5 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <Text className="text-sm text-slate-800 dark:text-white">
                    {stop.name} <Text className="text-xs text-slate-400">{stop.distance}km · {stop.time_to_arrive}h</Text>
                  </Text>
                  <Pressable onPress={() => removeStop(i)}>
                    <Text className="text-xs text-red-500">Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View className="flex-row gap-3 pt-4">
          <Button title="Cancel" variant="secondary" className="flex-1" onPress={() => setModal(false)} />
          <Button title={editing ? 'Save' : 'Create'} className="flex-1" loading={saving} onPress={handleSave} />
        </View>
      </Modal>
    </ScrollView>
  )
}