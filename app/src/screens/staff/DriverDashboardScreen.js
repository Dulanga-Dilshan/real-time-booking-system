import { View, Text } from 'react-native'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function DriverDashboardScreen() {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="p-5">
        <Text className="text-lg font-semibold text-slate-800 dark:text-white">
          Welcome, {user?.name ?? 'Driver'}
        </Text>
        <Text className="text-sm text-slate-400 mt-1">Driver dashboard — coming next</Text>

        <Button
          title="Log out"
          variant="secondary"
          className="mt-6"
          onPress={() => clearAuth()}
        />
      </Card>
    </View>
  )
}