import { View, Text, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useAuthStore from '@/store/authStore'
import { logout } from '@/api/auth'

export default function AppHeader({ navigation, route, back }) {
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const isAdmin = user?.role === 'admin'
  const isBusStaff = user?.role === 'bus_staff'

  const handleLogout = async () => {
    try { await logout() } catch {}
    await clearAuth()
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
  }

  return (
    <View style={{ paddingTop: insets.top }} className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <View className="h-14 px-4 flex-row items-center justify-between">
        {/* Left: back button (if nested) or logo */}
        <Pressable
          onPress={() => (back ? navigation.goBack() : navigation.navigate('Home'))}
          className="flex-row items-center gap-2"
        >
          {back && <Text className="text-blue-600 text-lg mr-1">‹</Text>}
          <View className="w-7 h-7 bg-blue-600 rounded-lg items-center justify-center">
            <Text className="text-white text-xs">🚌</Text>
          </View>
          <Text className="font-bold text-slate-800 dark:text-white">BusBook</Text>
        </Pressable>

        {/* Right: nav links */}
        <View className="flex-row items-center gap-3">
          {!isAdmin && !isBusStaff && (
            <>
              <Pressable onPress={() => navigation.navigate('Track')}>
                <Text className="text-sm text-slate-500 dark:text-slate-400">Track</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('CancelBooking')}>
                <Text className="text-sm text-slate-500 dark:text-slate-400">Cancel</Text>
              </Pressable>
            </>
          )}

          {user ? (
            <>
              {!isAdmin && !isBusStaff && (
                <Pressable onPress={() => navigation.navigate('Profile')}>
                  <Text className="text-sm text-slate-600 dark:text-slate-300 font-medium">{user.name}</Text>
                </Pressable>
              )}
              <Pressable onPress={handleLogout} className="border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg">
                <Text className="text-sm text-slate-600 dark:text-slate-300">Log out</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => navigation.navigate('Auth')} className="bg-blue-600 px-3 py-1.5 rounded-lg">
              <Text className="text-sm text-white font-medium">Log in</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}