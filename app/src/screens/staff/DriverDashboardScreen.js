import { useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, Pressable, Switch } from 'react-native'
import * as Location from 'expo-location'
import dayjs from 'dayjs'
import { getDriverDashboard, updateLocation, updateGps, setTrackingMode } from '@/api/driver'
import { useEchoChannel } from '@/hooks/useEcho'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Modal from '@/components/ui/Modal'
import useAuthStore from '@/store/authStore'
import toast from '@/lib/toast'

export default function DriverDashboardScreen() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [mode, setMode] = useState('manual')
  const [updating, setUpdating] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [passengerCount, setPassengerCount] = useState(0)
  const [bookedSeats, setBookedSeats] = useState([])
  const gpsSubRef = useRef(null)
  const lastSentRef = useRef(0)
  const today = dayjs().format('YYYY-MM-DD')

  useEffect(() => {
    getDriverDashboard()
      .then((res) => {
        setData(res.data)
        setCurrentIdx(res.data.location?.current_stop_index ?? 0)
        setMode(res.data.location?.tracking_mode ?? 'manual')
        setPassengerCount(res.data.total_bookings ?? 0)
        setBookedSeats((res.data.booked_seats ?? []).map(String))
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))

    return () => {
      if (gpsSubRef.current) gpsSubRef.current.remove()
    }
  }, [])

  useEchoChannel(data ? `bus.${data.bus_route?.id}.${today}` : null, '.SeatUpdated', (e) => {
    setBookedSeats(e.booked_seats.map(String))
    setPassengerCount(e.booked_seats.length)
  })

  const handleNext = async () => {
    if (!data) return
    const maxIdx = (data.stops?.length ?? 1) - 1
    if (currentIdx >= maxIdx) return
    setUpdating(true)
    try {
      const res = await updateLocation({ direction: 'next' })
      setCurrentIdx(res.data.current_stop_index)
    } catch { toast.error('Something went wrong') }
    finally { setUpdating(false) }
  }

  const handlePrev = async () => {
    if (!data || currentIdx <= 0) return
    setUpdating(true)
    try {
      const res = await updateLocation({ direction: 'previous' })
      setCurrentIdx(res.data.current_stop_index)
    } catch { toast.error('Something went wrong') }
    finally { setUpdating(false) }
  }

  const sendGps = async (coords) => {
    const now = Date.now()
    if (now - lastSentRef.current < 29000) return
    lastSentRef.current = now
    try {
      const res = await updateGps({ latitude: coords.latitude, longitude: coords.longitude })
      setCurrentIdx(res.data.current_stop_index)
    } catch {}
  }

  const toggleMode = async (value) => {
    const newMode = value ? 'auto' : 'manual'
    try {
      await setTrackingMode({ mode: newMode })
      setMode(newMode)

      if (newMode === 'auto') {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') { toast.error('Location permission denied'); setMode('manual'); return }

        gpsSubRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 15000, distanceInterval: 20 },
          (loc) => sendGps(loc.coords)
        )
      } else if (gpsSubRef.current) {
        gpsSubRef.current.remove()
        gpsSubRef.current = null
      }
    } catch { toast.error('Something went wrong') }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </View>
    )
  }

  if (!data?.bus_route) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <Text className="text-xl font-bold text-slate-800 dark:text-white mb-2 text-center">No route assigned</Text>
        <Text className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">
          Contact an admin to get assigned to a bus route.
        </Text>
        <Button title="Log out" variant="secondary" onPress={() => clearAuth()} />
      </View>
    )
  }

  const { bus_route, stops = [], bookings = [] } = data
  const maxIdx = stops.length - 1
  const curStop = stops[currentIdx]
  const totalRows = Math.ceil(bus_route.total_seats / 5)

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerClassName="p-4">
      <View className="bg-slate-800 dark:bg-slate-950 rounded-2xl p-5 mb-5 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-slate-400 text-xs mb-1">Your route</Text>
          {bus_route.bus_number && <Text className="font-mono text-xs text-slate-400 mb-0.5">{bus_route.bus_number}</Text>}
          <Text className="text-xl font-bold text-white">{bus_route.from_location} → {bus_route.to_location}</Text>
          <Text className="text-slate-400 text-sm mt-1">
            {dayjs(`1970-01-01T${bus_route.departure_time}`).format('h:mm A')} → {dayjs(`1970-01-01T${bus_route.arrival_time}`).format('h:mm A')}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-slate-400 text-xs mb-1">Passengers</Text>
          <Text className="text-3xl font-bold text-blue-400">{passengerCount}</Text>
          <Text className="text-slate-400 text-xs">of {bus_route.total_seats}</Text>
        </View>
      </View>

      {/* Location */}
      <Card className="p-5 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Current location</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-slate-500 dark:text-slate-400">{mode === 'auto' ? 'Auto GPS' : 'Manual'}</Text>
            <Switch value={mode === 'auto'} onValueChange={toggleMode} />
          </View>
        </View>

        {stops.length > 0 && (
          <>
            <View className="items-center mb-4">
              <Text className="text-xl font-bold text-slate-800 dark:text-white">{curStop?.name ?? '—'}</Text>
              <Text className="text-slate-400 text-xs mt-1">Stop {currentIdx + 1} of {stops.length}</Text>
            </View>

            {mode === 'auto' ? (
              <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5 items-center">
                <Text className="text-blue-700 dark:text-blue-400 text-sm">GPS tracking active</Text>
              </View>
            ) : (
              <View className="flex-row gap-2">
                <Button title="◀ Previous" variant="outline" size="sm" className="flex-1"
                  disabled={updating || currentIdx === 0} onPress={handlePrev} />
                <Button title="Next ▶" size="sm" className="flex-1"
                  disabled={updating || currentIdx === maxIdx} onPress={handleNext} />
              </View>
            )}
          </>
        )}
      </Card>

      {/* Seat map */}
      <Card className="p-5 mb-4">
        <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Seat map</Text>
        <View className="gap-1.5">
          {Array.from({ length: totalRows }, (_, row) => {
            const base = row * 5
            const renderSeat = (offset) => {
              const num = base + offset + 1
              if (num > bus_route.total_seats) return <View key={`e-${offset}`} className="w-9 h-9" />
              const taken = bookedSeats.includes(String(num))
              const bk = bookings.find((b) => b.seats?.some((s) => String(s) === String(num)))
              return (
                <Pressable
                  key={num}
                  onPress={() => { if (taken && bk) setSelectedBooking(bk) }}
                  className={`w-9 h-9 items-center justify-center rounded-lg border ${
                    taken ? 'bg-blue-600 border-blue-700' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Text className={`text-xs font-medium ${taken ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>{num}</Text>
                </Pressable>
              )
            }
            return (
              <View key={row} className="flex-row items-center gap-1.5 justify-center">
                {renderSeat(0)}{renderSeat(1)}
                <View className="w-3" />
                {renderSeat(2)}{renderSeat(3)}{renderSeat(4)}
              </View>
            )
          })}
        </View>
      </Card>

      {/* Bookings list */}
      <Card className="overflow-hidden">
        <View className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Today's bookings</Text>
        </View>
        {bookings.length === 0 ? (
          <Text className="text-center py-8 text-slate-400 text-sm">No bookings yet</Text>
        ) : (
          bookings.map((b) => (
            <Pressable key={b.booking_reference} onPress={() => setSelectedBooking(b)}
              className="px-5 py-3 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <View>
                <View className="flex-row items-center gap-2 mb-0.5">
                  <Text className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{b.booking_reference}</Text>
                  <Text className="text-xs text-slate-400">Seat {b.seats?.join(', ')}</Text>
                </View>
                <Text className="text-sm font-medium text-slate-800 dark:text-white">{b.passenger_name}</Text>
              </View>
            </Pressable>
          ))
        )}
      </Card>

      <Modal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking details">
        {selectedBooking && (
          <View>
            {[
              ['Reference', selectedBooking.booking_reference],
              ['Passenger', selectedBooking.passenger_name],
              ['NIC', selectedBooking.nic],
              ['Gender', selectedBooking.gender],
              ['Email', selectedBooking.email ?? '—'],
              ['Seats', selectedBooking.seats?.join(', ')],
              ['Payment', selectedBooking.payment_method === 'station' ? 'Pay at station' : 'Online'],
            ].map(([label, value]) => (
              <View key={label} className="flex-row justify-between py-2.5 border-b border-slate-100 dark:border-slate-800">
                <Text className="text-slate-500 dark:text-slate-400 text-sm">{label}</Text>
                <Text className="font-medium text-slate-800 dark:text-white text-sm">{value}</Text>
              </View>
            ))}
          </View>
        )}
      </Modal>
    </ScrollView>
  )
}