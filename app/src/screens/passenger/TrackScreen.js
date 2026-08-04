import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import dayjs from 'dayjs'
import { getAllBuses } from '@/api/tracking'
import { useEchoChannel } from '@/hooks/useEcho'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'

function BusCard({ bus, today, navigation }) {
  const [data, setData] = useState(bus)

  useEchoChannel(`bus-location.${bus.id}.${today}`, '.BusLocationUpdated', (e) =>
    setData((prev) => ({
      ...prev,
      current_stop_index: e.current_stop_index,
      current_stop: prev.stops?.[e.current_stop_index],
    }))
  )

  const stops = data.stops ?? []
  const currentIdx = data.current_stop_index ?? 0
  const total = stops.length

  return (
    <Card className="overflow-hidden mb-4">
      <View className="bg-slate-800 dark:bg-slate-950 px-5 py-4 flex-row items-center justify-between">
        <View className="flex-1">
          {data.bus_number && <Text className="font-mono text-xs text-slate-400 mb-0.5">{data.bus_number}</Text>}
          <Text className="font-bold text-lg text-white">{data.from_location} → {data.to_location}</Text>
          <Text className="text-slate-400 text-xs mt-0.5">
            Currently at: <Text className="text-blue-400 font-semibold">{data.current_stop?.name ?? '—'}</Text>
          </Text>
        </View>
        <Button title="View map" size="sm" onPress={() => navigation.navigate('Map', { routeId: data.id })} />
      </View>

      <View className="px-5 py-4">
        <View className="bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-2">
          <View
            className="bg-blue-600 h-1.5 rounded-full"
            style={{ width: `${total > 1 ? (currentIdx / (total - 1)) * 100 : 0}%` }}
          />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-slate-400">{stops[0]?.name}</Text>
          <Text className="text-xs text-slate-400">{stops[total - 1]?.distance ?? 0} km total</Text>
          <Text className="text-xs text-slate-400">{stops[total - 1]?.name}</Text>
        </View>
      </View>
    </Card>
  )
}

export default function TrackScreen({ navigation }) {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const today = dayjs().format('YYYY-MM-DD')

  useEffect(() => {
    getAllBuses()
      .then((res) => setBuses(res.data.buses ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerClassName="p-4">
      <Text className="text-2xl font-bold text-slate-800 dark:text-white">Live bus tracking</Text>
      <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">
        {dayjs().format('ddd, DD MMM YYYY')}
      </Text>

      {buses.length === 0 ? (
        <Card className="items-center py-16">
          <Text className="text-slate-400">No buses on the road right now.</Text>
        </Card>
      ) : (
        buses.map((bus) => <BusCard key={bus.id} bus={bus} today={today} navigation={navigation} />)
      )}
    </ScrollView>
  )
}