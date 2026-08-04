import { useState, useEffect } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import dayjs from 'dayjs'
import { getRoute } from '@/api/routes'
import { getAllBuses } from '@/api/tracking'
import { createBooking } from '@/api/bookings'
import { useEchoChannel } from '@/hooks/useEcho'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Modal from '@/components/ui/Modal'
import toast from '@/lib/toast'

const MAX_SEATS = 5

export default function BookingScreen({ route: navRoute, navigation }) {
  const { routeId, date: dateParam } = navRoute.params
  const date = dateParam ?? dayjs().format('YYYY-MM-DD')
  const isToday = date === dayjs().format('YYYY-MM-DD')

  const [route, setRoute] = useState(null)
  const [stops, setStops] = useState([])
  const [bookedSeats, setBookedSeats] = useState([])
  const [busLocation, setBusLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showStops, setShowStops] = useState(false)
  const [selectedSeats, setSelectedSeats] = useState([])

  const [form, setForm] = useState({
    passenger_name: '', gender: '', nic: '',
    email: '', board_stop_index: '', alight_stop_index: '',
    payment_method: 'station',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const routeRes = await getRoute(routeId, { date })
        const r = routeRes.data.route
        const s = routeRes.data.stops ?? []
        setRoute(r)
        setStops(s)
        setBookedSeats((routeRes.data.booked_seats ?? []).map(String))
        if (s.length > 0) {
          setForm((p) => ({ ...p, board_stop_index: '0', alight_stop_index: String(s.length - 1) }))
        }

        if (isToday) {
          try {
            const trackRes = await getAllBuses()
            const bus = trackRes.data.buses?.find((b) => b.id === parseInt(routeId))
            if (bus) setBusLocation(bus)
          } catch {}
        }
      } catch {
        toast.error('Something went wrong loading this route')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [routeId, date])

  useEchoChannel(`bus.${routeId}.${date}`, '.SeatUpdated', (data) => {
    const newBooked = data.booked_seats.map(String)
    setBookedSeats(newBooked)

    const lostSeats = selectedSeats.filter((s) => newBooked.includes(s))
    if (lostSeats.length > 0 && !submitting) {
      toast.error('A seat you selected was just booked!')
    }
    setSelectedSeats((prev) => prev.filter((s) => !newBooked.includes(s)))
  })

  useEchoChannel(
    isToday ? `bus-location.${routeId}.${date}` : null,
    '.BusLocationUpdated',
    (data) => setBusLocation((prev) => (prev ? { ...prev, ...data, current_stop: stops[data.current_stop_index] } : prev))
  )

  const toggleSeat = (num) => {
    const str = String(num)
    if (bookedSeats.includes(str)) return

    if (selectedSeats.includes(str)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== str))
      return
    }

    if (selectedSeats.length >= MAX_SEATS) {
      toast.error(`Max ${MAX_SEATS} seats`)
      return
    }

    setSelectedSeats((prev) => [...prev, str])
  }

  const handleSubmit = async () => {
    if (selectedSeats.length === 0) return toast.error('Select at least one seat')
    if (!form.passenger_name?.trim()) return toast.error('Enter passenger name')
    if (!form.gender) return toast.error('Select gender')
    if (!form.nic?.trim()) return toast.error('Enter NIC number')
    if (!/^(?:\d{9}[vVxX]|\d{12})$/.test(form.nic.trim())) return toast.error('Enter a valid NIC number')
    if (!form.email?.trim()) return toast.error('Email is required')
    if (!form.board_stop_index) return toast.error('Select boarding stop')
    if (!form.alight_stop_index) return toast.error('Select alighting stop')

    setSubmitting(true)
    try {
      const res = await createBooking({
        bus_route_id: parseInt(routeId),
        seat_numbers: selectedSeats,
        travel_date: date,
        passenger_name: form.passenger_name,
        gender: form.gender,
        email: form.email.trim(),
        nic: form.nic.trim(),
        board_stop_index: parseInt(form.board_stop_index),
        alight_stop_index: parseInt(form.alight_stop_index),
        payment_method: form.payment_method,
      })
      navigation.replace('BookingConfirm', { reference: res.data.booking.booking_reference })
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Something went wrong')
      if (err.response?.data?.taken_seats) {
        const taken = err.response.data.taken_seats.map(String)
        setBookedSeats((prev) => [...new Set([...prev, ...taken])])
        setSelectedSeats((prev) => prev.filter((s) => !taken.includes(s)))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </View>
    )
  }
  if (!route) return null

  const totalRows = Math.ceil(route.total_seats / 5)
  const currentIdx = busLocation?.current_stop_index ?? 0
  const curStop = stops[currentIdx]
  const nextStop = stops[currentIdx + 1]
  const boardIdx = parseInt(form.board_stop_index || 0)
  const departure = dayjs(`1970-01-01T${route.departure_time}`)

  const seatColor = (num) => {
    const str = String(num)
    if (bookedSeats.includes(str)) return 'bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800'
    if (selectedSeats.includes(str)) return 'bg-blue-600 border-blue-600'
    return 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700'
  }
  const seatTextColor = (num) => {
    const str = String(num)
    if (bookedSeats.includes(str)) return 'text-red-400 dark:text-red-500'
    if (selectedSeats.includes(str)) return 'text-white font-bold'
    return 'text-emerald-700 dark:text-emerald-400'
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerClassName="p-4">
      {/* Route info */}
      <Card className="p-5 mb-4">
        <View className="flex-row items-center gap-2 mb-1 flex-wrap">
          {route.bus_number && (
            <View className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">{route.bus_number}</Text>
            </View>
          )}
          <Text className="text-lg font-bold text-slate-800 dark:text-white">{route.from_location}</Text>
          <Text className="text-slate-400">→</Text>
          <Text className="text-lg font-bold text-slate-800 dark:text-white">{route.to_location}</Text>
        </View>
        <View className="flex-row items-center gap-3 flex-wrap">
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            {dayjs(`1970-01-01T${route.departure_time}`).format('h:mm A')} → {dayjs(`1970-01-01T${route.arrival_time}`).format('h:mm A')}
          </Text>
          <Text className="text-slate-300">·</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">{dayjs(date).format('ddd, DD MMM YYYY')}</Text>
          <Text className="text-slate-300">·</Text>
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            LKR {Number(route.price).toLocaleString()} / seat
          </Text>
        </View>
      </Card>

      {/* Live location bar */}
      {isToday && curStop && (
        <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-4">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-blue-800 dark:text-blue-300">Bus at {curStop.name}</Text>
              {nextStop && (
                <Text className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  Heading to {nextStop.name} · arrives in {Math.round((nextStop.time_to_arrive - curStop.time_to_arrive) * 60)} min
                </Text>
              )}
            </View>
            <Pressable
              onPress={() => navigation.navigate('Map', { routeId })}
              className="border border-blue-300 dark:border-blue-700 px-3 py-1 rounded-lg"
            >
              <Text className="text-xs text-blue-600">Open map</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Seat map */}
      <Card className="p-5 mb-4">
        <View className="flex-row items-center justify-between mb-4 flex-wrap gap-2">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">Choose your seats</Text>
          <View className={`px-2.5 py-1 rounded-full ${selectedSeats.length >= MAX_SEATS ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
            <Text className={`text-xs font-medium ${selectedSeats.length >= MAX_SEATS ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {selectedSeats.length} selected
            </Text>
          </View>
        </View>

        {/* Legend */}
        <View className="flex-row items-center gap-4 mb-4 flex-wrap">
          <View className="flex-row items-center gap-1.5">
            <View className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700" />
            <Text className="text-xs text-slate-500 dark:text-slate-400">Available</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-3.5 h-3.5 rounded bg-blue-600" />
            <Text className="text-xs text-slate-500 dark:text-slate-400">Selected</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-3.5 h-3.5 rounded bg-red-100 border border-red-300 dark:bg-red-900/30 dark:border-red-700" />
            <Text className="text-xs text-slate-500 dark:text-slate-400">Taken</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 mb-4">
          <View className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <Text className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Front — Driver
          </Text>
          <View className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </View>

        <View className="gap-2">
          {Array.from({ length: totalRows }, (_, row) => {
            const base = row * 5
            const renderSeat = (offset) => {
              const num = base + offset + 1
              if (num > route.total_seats) return <View key={`e-${offset}`} className="w-10 h-10" />
              const taken = bookedSeats.includes(String(num))
              return (
                <Pressable
                  key={num}
                  onPress={() => toggleSeat(num)}
                  disabled={taken}
                  className={`w-10 h-10 items-center justify-center rounded-lg border ${seatColor(num)}`}
                >
                  <Text className={`text-xs font-medium ${seatTextColor(num)}`}>{num}</Text>
                </Pressable>
              )
            }
            return (
              <View key={row} className="flex-row items-center gap-2 justify-center">
                {renderSeat(0)}
                {renderSeat(1)}
                <View className="w-6 items-center justify-center">
                  <View className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                </View>
                {renderSeat(2)}
                {renderSeat(3)}
                {renderSeat(4)}
              </View>
            )
          })}
        </View>
      </Card>

      {/* Booking form */}
      {selectedSeats.length > 0 && (
        <Card className="p-5">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-base font-semibold text-slate-800 dark:text-white">Passenger details</Text>
            <View className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
              <Text className="text-sm font-semibold text-blue-700 dark:text-blue-300">{selectedSeats.join(', ')}</Text>
            </View>
          </View>

          <View className="gap-4 mb-5">
            <Input
              label="Full name (as on NIC)"
              value={form.passenger_name}
              onChangeText={(v) => setForm((p) => ({ ...p, passenger_name: v }))}
            />
            <Select
              label="Gender"
              selectedValue={form.gender}
              onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}
            >
              <Select.Item label="— Select —" value="" />
              <Select.Item label="Male" value="male" />
              <Select.Item label="Female" value="female" />
              <Select.Item label="Other" value="other" />
            </Select>
            <Input
              label="NIC number"
              value={form.nic}
              onChangeText={(v) => setForm((p) => ({ ...p, nic: v }))}
              placeholder="199012345678"
              autoCapitalize="characters"
            />
            <Input
              label="Email"
              value={form.email}
              onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {stops.length > 0 && (
              <>
                <Select
                  label="Board at"
                  selectedValue={form.board_stop_index}
                  onValueChange={(v) => {
                    const idx = parseInt(v)
                    setForm((p) => ({
                      ...p,
                      board_stop_index: String(idx),
                      alight_stop_index: String(idx + 1 < stops.length ? idx + 1 : idx),
                    }))
                  }}
                >
                  {stops.slice(0, stops.length - 1).map((s, i) => (
                    <Select.Item key={i} label={s.name} value={String(i)} />
                  ))}
                </Select>

                <Select
                  label="Alight at"
                  selectedValue={form.alight_stop_index}
                  onValueChange={(v) => setForm((p) => ({ ...p, alight_stop_index: v }))}
                >
                  {stops.slice(boardIdx + 1).map((s, i) => {
                    const realIdx = boardIdx + 1 + i
                    return <Select.Item key={realIdx} label={s.name} value={String(realIdx)} />
                  })}
                </Select>

                <Pressable onPress={() => setShowStops(true)}>
                  <Text className="text-sm text-blue-600 dark:text-blue-400">View all stops</Text>
                </Pressable>
              </>
            )}
          </View>

          {/* Payment */}
          <View className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Payment</Text>
            <View className="flex-row gap-3 mb-4">
              <Pressable
                onPress={() => setForm((p) => ({ ...p, payment_method: 'station' }))}
                className={`flex-1 items-center gap-2 border-2 rounded-xl py-4 px-3 ${
                  form.payment_method === 'station' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">Pay at station</Text>
                <Text className="text-xs text-slate-400 text-center">Pay cash when boarding</Text>
              </Pressable>
              <View className="flex-1 items-center gap-2 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-4 px-3 opacity-50">
                <Text className="text-sm font-medium text-slate-300">Pay online</Text>
                <Text className="text-xs text-amber-500 font-semibold">Coming soon</Text>
              </View>
            </View>
            <Button title="Confirm booking" size="xl" loading={submitting} onPress={handleSubmit} />
          </View>
        </Card>
      )}

      {/* Stops modal */}
      <Modal open={showStops} onClose={() => setShowStops(false)} title="Route stops">
        {stops.map((stop, i) => {
          const arrival = departure.add(Math.round(stop.time_to_arrive * 60), 'minute')
          const isCurrent = (busLocation?.current_stop_index ?? 0) === i
          const isPast = (busLocation?.current_stop_index ?? 0) > i
          return (
            <View key={i} className="flex-row items-start gap-3 pb-3">
              <View
                className={`w-4 h-4 rounded-full mt-0.5 ${
                  isCurrent ? 'bg-blue-600' : isPast ? 'bg-slate-300' : 'border-2 border-slate-300 dark:border-slate-600'
                }`}
              />
              <View className="flex-1 flex-row items-start justify-between pb-1">
                <View>
                  <Text className={`text-sm font-medium ${isCurrent ? 'text-blue-600 dark:text-blue-400' : isPast ? 'text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                    {stop.name}{isCurrent ? '  (now here)' : ''}
                  </Text>
                  <Text className="text-xs text-slate-400">{stop.distance} km</Text>
                </View>
                <Text className="text-xs text-slate-500 ml-2">{arrival.format('h:mm A')}</Text>
              </View>
            </View>
          )
        })}
      </Modal>
    </ScrollView>
  )
}