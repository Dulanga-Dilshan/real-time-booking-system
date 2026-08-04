import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import dayjs from 'dayjs'
import { getDrivers, assignDriver, unassignDriver } from '@/api/admin'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import toast from '@/lib/toast'

export default function DriversScreen() {
  const [staff, setStaff] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState({})

  const load = async () => {
    try {
      const res = await getDrivers()
      setStaff(res.data.staff ?? [])
      setRoutes(res.data.routes ?? [])
      const init = {}
      res.data.staff?.forEach((s) => { init[s.id] = s.driver_assignment?.bus_route_id ? String(s.driver_assignment.bus_route_id) : '' })
      setAssignments(init)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAssign = async (user) => {
    const routeId = assignments[user.id]
    if (!routeId) return toast.error('Select a route first')
    try {
      await assignDriver(user.id, { bus_route_id: parseInt(routeId) })
      toast.success(`Route assigned to ${user.name}`)
      load()
    } catch {
      toast.error('Something went wrong')
    }
  }

  const handleUnassign = async (user) => {
    try {
      await unassignDriver(user.id)
      toast.success('Assignment removed')
      load()
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
      <Text className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Drivers</Text>
      <Text className="text-slate-500 dark:text-slate-400 text-sm mb-4">
        Bus staff register via the normal auth page. Assign them to routes here.
      </Text>

      {staff.length === 0 ? (
        <Card className="items-center py-16">
          <Text className="text-slate-400 text-sm">No bus staff accounts yet.</Text>
        </Card>
      ) : (
        staff.map((s) => (
          <Card key={s.id} className="p-4 mb-3">
            <Text className="font-medium text-slate-800 dark:text-white">{s.name}</Text>
            <Text className="text-xs text-slate-400 mb-2">{s.email}</Text>

            {s.driver_assignment ? (
              <Text className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {s.driver_assignment.bus_route?.from_location} → {s.driver_assignment.bus_route?.to_location}
                {'  '}
                <Text className="text-xs text-slate-400">
                  {dayjs(`1970-01-01T${s.driver_assignment.bus_route?.departure_time}`).format('h:mm A')}
                </Text>
              </Text>
            ) : (
              <Badge variant="amber" className="mb-3">Not assigned</Badge>
            )}

            <Select selectedValue={assignments[s.id] ?? ''} onValueChange={(v) => setAssignments((p) => ({ ...p, [s.id]: v }))}>
              <Select.Item label="Select route" value="" />
              {routes.map((r) => (
                <Select.Item key={r.id} label={`${r.from_location} → ${r.to_location} (${dayjs(`1970-01-01T${r.departure_time}`).format('h:mm A')})`} value={String(r.id)} />
              ))}
            </Select>

            <View className="flex-row gap-2 mt-3">
              <Button title="Assign" size="sm" className="flex-1" onPress={() => handleAssign(s)} />
              {s.driver_assignment && (
                <Button title="Unassign" size="sm" variant="danger" className="flex-1" onPress={() => handleUnassign(s)} />
              )}
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  )
}