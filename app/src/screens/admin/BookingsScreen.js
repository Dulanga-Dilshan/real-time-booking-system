import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import dayjs from 'dayjs'
import { getAdminBookings, cancelAdminBooking } from '@/api/admin'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import toast from '@/lib/toast'

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  const load = async (s, p) => {
    setLoading(true)
    try {
      const res = await getAdminBookings({ status: s || undefined, page: p })
      setBookings(res.data.data ?? [])
      setMeta(res.data.meta ?? res.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load(status, page) }, [status, page])

  const handleCancel = async (booking) => {
    try {
      await cancelAdminBooking(booking.id)
      toast.success(`Booking ${booking.booking_reference} cancelled`)
      load(status, page)
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerClassName="p-4">
      <Text className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Bookings</Text>

      <Card className="p-4 mb-4">
        <Select label="Status" selectedValue={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <Select.Item label="All statuses" value="" />
          <Select.Item label="Confirmed" value="confirmed" />
          <Select.Item label="Cancelled" value="cancelled" />
        </Select>
      </Card>

      {loading ? (
        <View className="py-12 items-center"><Spinner size="lg" /></View>
      ) : bookings.length === 0 ? (
        <Card className="items-center py-10"><Text className="text-slate-400">No bookings found</Text></Card>
      ) : (
        bookings.map((b) => (
          <Card key={b.id} className="p-4 mb-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{b.booking_reference}</Text>
              <Badge variant={b.status === 'confirmed' ? 'green' : 'red'}>{b.status}</Badge>
            </View>
            <Text className="text-sm font-medium text-slate-800 dark:text-white">{b.passenger_name}</Text>
            <Text className="text-xs text-slate-400">{b.nic}</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {b.bus_route?.from_location} → {b.bus_route?.to_location} · {dayjs(b.travel_date).format('DD MMM YYYY')}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Seats: {b.seats?.map((s) => s.seat_number).join(', ')} · {b.payment_method}
            </Text>
            {b.status === 'confirmed' && (
              <Button title="Cancel" size="sm" variant="danger" className="mt-3" onPress={() => handleCancel(b)} />
            )}
          </Card>
        ))
      )}

      {meta && meta.last_page > 1 && (
        <View className="flex-row gap-2 justify-center mt-2">
          <Button title="Previous" size="sm" variant="outline" disabled={page <= 1} onPress={() => setPage((p) => p - 1)} />
          <Text className="self-center text-xs text-slate-400">Page {meta.current_page} of {meta.last_page}</Text>
          <Button title="Next" size="sm" variant="outline" disabled={page >= meta.last_page} onPress={() => setPage((p) => p + 1)} />
        </View>
      )}
    </ScrollView>
  )
}