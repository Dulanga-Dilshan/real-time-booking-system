import { useState, useCallback } from 'react'
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native'
import dayjs from 'dayjs'
import { getRoutes } from '@/api/routes'
import { useEchoChannel } from '@/hooks/useEcho'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

function RouteCard({ route, date, onSeatsUpdate, onPress }) {
  useEchoChannel(`bus.${route.id}.${date}`, '.SeatUpdated', (data) => {
    onSeatsUpdate(route.id, route.total_seats - data.booked_seats.length)
  })

  const seatColor =
    route.available_seats > 5
      ? 'text-emerald-600 dark:text-emerald-400'
      : route.available_seats > 0
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-500 dark:text-red-400'

  return (
    <Pressable onPress={onPress}>
      <Card className="p-5 mb-3">
        <View className="flex-row items-center gap-2 mb-2 flex-wrap">
          {route.bus_number && (
            <View className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">{route.bus_number}</Text>
            </View>
          )}
          <Text className="font-semibold text-slate-800 dark:text-white">{route.from_location}</Text>
          <Text className="text-slate-400">→</Text>
          <Text className="font-semibold text-slate-800 dark:text-white">{route.to_location}</Text>
        </View>

        <View className="flex-row items-center gap-3 flex-wrap">
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            {dayjs(`1970-01-01T${route.departure_time}`).format('h:mm A')} → {dayjs(`1970-01-01T${route.arrival_time}`).format('h:mm A')}
          </Text>
          <Text className="text-slate-300 dark:text-slate-700">·</Text>
          <Text className={`text-sm font-medium ${seatColor}`}>
            {route.available_seats > 0 ? `${route.available_seats} seats left` : 'Full'}
          </Text>
        </View>
      </Card>
    </Pressable>
  )
}

export default function HomeScreen({ navigation }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRoutes({ from_location: from, to_location: to, date })
      setRoutes(res.data.data ?? res.data)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }, [from, to, date])

  const handleSeatsUpdate = (routeId, availableSeats) => {
    setRoutes((prev) => prev.map((r) => (r.id === routeId ? { ...r, available_seats: availableSeats } : r)))
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="p-4 mb-4 gap-3">
        <Input label="From" value={from} onChangeText={setFrom} placeholder="e.g. Colombo" />
        <Input label="To" value={to} onChangeText={setTo} placeholder="e.g. Kandy" />
        <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <Button title="Search buses" onPress={handleSearch} loading={loading} />
      </Card>

      {loading && !searched ? (
        <Spinner />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={handleSearch} />}
          renderItem={({ item }) => (
            <RouteCard
              route={item}
              date={date}
              onSeatsUpdate={handleSeatsUpdate}
              onPress={() => navigation.navigate('Booking', { routeId: item.id, date })}
            />
          )}
          ListEmptyComponent={
            searched ? (
              <Text className="text-center text-slate-400 mt-8">No buses found for this route/date.</Text>
            ) : null
          }
        />
      )}
    </View>
  )
}