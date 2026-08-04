import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import dayjs from 'dayjs'
import { getStats, getAdminRoutes } from '@/api/admin'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'

function StatCard({ label, value, color }) {
  return (
    <Card className="p-4 flex-1">
      <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</Text>
      <Text className={`text-2xl font-bold ${color ?? 'text-slate-800 dark:text-white'}`}>{value}</Text>
    </Card>
  )
}

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null)
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getAdminRoutes()])
      .then(([s, r]) => {
        setStats(s.data)
        setRoutes(r.data.routes ?? [])
      })
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

  const links = [
    { to: 'AdminRoutes', label: 'All routes' },
    { to: 'AdminBookings', label: 'Bookings' },
    { to: 'AdminDrivers', label: 'Drivers' },
    { to: 'AdminTemplates', label: 'Templates' },
  ]

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerClassName="p-4">
      <Text className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Admin dashboard</Text>

      <View className="flex-row gap-3 mb-4">
        <StatCard label="Total routes" value={stats?.total_routes ?? 0} />
        <StatCard label="Total bookings" value={stats?.total_bookings ?? 0} />
        <StatCard label="Today" value={stats?.today_bookings ?? 0} color="text-blue-600 dark:text-blue-400" />
      </View>

      <View className="flex-row flex-wrap gap-3 mb-6">
        {links.map((item) => (
          <Pressable key={item.to} onPress={() => navigation.navigate(item.to)} className="w-[47%]">
            <Card className="p-4">
              <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</Text>
            </Card>
          </Pressable>
        ))}
      </View>

      <Card className="overflow-hidden">
        <View className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">All routes</Text>
        </View>
        {routes.map((route) => (
          <View key={route.id} className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="font-medium text-slate-800 dark:text-white flex-1">
                {route.from_location} → {route.to_location}
              </Text>
              <Badge variant={route.is_active ? 'green' : 'slate'}>{route.is_active ? 'Active' : 'Inactive'}</Badge>
            </View>
            <Text className="text-xs text-slate-400">
              {dayjs(`1970-01-01T${route.departure_time}`).format('h:mm A')} · {route.total_seats} seats · LKR {Number(route.price).toLocaleString()}
            </Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  )
}