import { useEffect } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import useAuthStore from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'

function Redirecting() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Spinner size="lg" />
    </View>
  )
}

function useRedirect(shouldRedirect, targetRoute) {
  const navigation = useNavigation()
  useEffect(() => {
    if (shouldRedirect) {
      navigation.reset({ index: 0, routes: [{ name: targetRoute }] })
    }
  }, [shouldRedirect])
}

/** Wrap a screen: must be logged in, else -> Auth */
export function requireAuth(Screen) {
  return function Wrapped(props) {
    const user = useAuthStore((s) => s.user)
    useRedirect(!user, 'Auth')
    if (!user) return <Redirecting />
    return <Screen {...props} />
  }
}

/** Wrap a screen: must be admin, else -> Auth (if guest) or Home (if wrong role) */
export function requireAdmin(Screen) {
  return function Wrapped(props) {
    const user = useAuthStore((s) => s.user)
    const target = !user ? 'Auth' : user.role !== 'admin' ? 'Home' : null
    useRedirect(!!target, target)
    if (target) return <Redirecting />
    return <Screen {...props} />
  }
}

/** Wrap a screen: must be bus_staff, else -> Auth (if guest) or Home (if wrong role) */
export function requireStaff(Screen) {
  return function Wrapped(props) {
    const user = useAuthStore((s) => s.user)
    const target = !user ? 'Auth' : user.role !== 'bus_staff' ? 'Home' : null
    useRedirect(!!target, target)
    if (target) return <Redirecting />
    return <Screen {...props} />
  }
}

/** Wrap the Auth screen: logged-in users get sent to their role's home */
export function redirectIfAuthenticated(Screen) {
  return function Wrapped(props) {
    const user = useAuthStore((s) => s.user)
    const target = !user ? null : user.role === 'admin' ? 'AdminDashboard' : user.role === 'bus_staff' ? 'Staff' : 'Home'
    useRedirect(!!target, target)
    if (target) return <Redirecting />
    return <Screen {...props} />
  }
}

/** Wrap a screen: drivers get bounced to their dashboard */
export function blockBusStaff(Screen) {
  return function Wrapped(props) {
    const user = useAuthStore((s) => s.user)
    const shouldRedirect = user?.role === 'bus_staff'
    useRedirect(shouldRedirect, 'Staff')
    if (shouldRedirect) return <Redirecting />
    return <Screen {...props} />
  }
}
