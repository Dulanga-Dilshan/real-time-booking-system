import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

export function RequireAuth({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth" replace />
  return children
}

export function RequireAdmin({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export function RequireStaff({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth" replace />
  if (user.role !== 'bus_staff') return <Navigate to="/" replace />
  return children
}

export function RedirectIfAuthenticated({ children }) {
  const { user } = useAuthStore()
  if (!user) return children
  if (user.role === 'admin')     return <Navigate to="/admin" replace />
  if (user.role === 'bus_staff') return <Navigate to="/staff" replace />
  return <Navigate to="/" replace />
}

export function BlockBusStaff({ children }) {
  const { user } = useAuthStore()
  if (user?.role === 'bus_staff') return <Navigate to="/staff" replace />
  return children
}