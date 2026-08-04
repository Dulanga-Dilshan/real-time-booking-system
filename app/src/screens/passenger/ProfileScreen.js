import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import dayjs from 'dayjs'
import { getMyBookings, updatePassword } from '@/api/profile'
import useAuthStore from '@/store/authStore'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import toast from '@/lib/toast'

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    getMyBookings()
      .then((res) => setBookings(res.data.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handlePassword = async () => {
    setPwLoading(true)
    try {
      await updatePassword(pwForm)
      toast.success('Password updated!')
      setPwForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerClassName="p-4">
      <Text className="text-2xl font-bold text-slate-800 dark:text-white mb-6">My profile</Text>

      <Card className="p-5 items-center mb-4">
        <View className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-3">
          <Text className="text-blue-600 dark:text-blue-400 text-xl font-bold">{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text className="font-semibold text-slate-800 dark:text-white">{user?.name}</Text>
        <Text className="text-sm text-slate-400 mt-0.5">{user?.email}</Text>
        <Badge variant="blue" className="mt-3">{user?.role}</Badge>
        <Button title="Log out" variant="secondary" className="mt-4 self-stretch" onPress={() => clearAuth()} />
      </Card>

      <Card className="p-5 mb-4">
        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Change password</Text>
        <View className="gap-3">
          <Input label="Current password" secureTextEntry value={pwForm.current_password}
            onChangeText={(v) => setPwForm((p) => ({ ...p, current_password: v }))} />
          <Input label="New password" secureTextEntry value={pwForm.password}
            onChangeText={(v) => setPwForm((p) => ({ ...p, password: v }))} />
          <Input label="Confirm new password" secureTextEntry value={pwForm.password_confirmation}
            onChangeText={(v) => setPwForm((p) => ({ ...p, password_confirmation: v }))} />
          <Button title="Update password" variant="secondary" loading={pwLoading} onPress={handlePassword} />
        </View>
      </Card>

      <Card className="overflow-hidden">
        <View className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300">My bookings</Text>
        </View>
        {loading ? (
          <View className="py-8 items-center"><Spinner /></View>
        ) : bookings.length === 0 ? (
          <Text className="text-center py-10 text-slate-400 text-sm">No bookings yet</Text>
        ) : (
          bookings.map((b) => (
            <View key={b.booking_reference} className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                  {b.booking_reference}
                </Text>
                <Badge variant={b.status === 'confirmed' ? 'green' : 'red'}>{b.status}</Badge>
              </View>
              <Text className="text-sm font-medium text-slate-800 dark:text-white">
                {b.route?.from_location} → {b.route?.to_location}
              </Text>
              <Text className="text-xs text-slate-400 mt-0.5">
                {dayjs(b.travel_date).format('ddd, DD MMM YYYY')} · Seat {b.seats?.join(', ')}
              </Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  )
}