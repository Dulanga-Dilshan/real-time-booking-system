import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Toast from 'react-native-toast-message'
import useAuthStore from '@/store/authStore'
import { setUnauthorizedHandler } from '@/api/client'
import RootNavigator from '@/navigation/RootNavigator'
import './global.css'

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)
  const hydrated = useAuthStore((s) => s.hydrated)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    hydrate().then(() => setReady(true))
    setUnauthorizedHandler(() => clearAuth())
  }, [])

  if (!ready || !hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
      <Toast />
    </>
  )
}