import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import useThemeStore from '@/store/themeStore'

import PublicLayout  from '@/components/layout/PublicLayout'
import AdminLayout   from '@/components/layout/AdminLayout'
import StaffLayout   from '@/components/layout/StaffLayout'

import {
  RequireAuth, RequireAdmin, RequireStaff,
  RedirectIfAuthenticated, BlockBusStaff
} from '@/routes/guards'

import Spinner from '@/components/ui/Spinner'

// Public pages
const HomePage           = lazy(() => import('@/pages/public/HomePage'))
const AuthPage           = lazy(() => import('@/pages/public/AuthPage'))
const BookingPage        = lazy(() => import('@/pages/public/BookingPage'))
const BookingConfirmPage = lazy(() => import('@/pages/public/BookingConfirmPage'))
const CancelBookingPage  = lazy(() => import('@/pages/public/CancelBookingPage'))
const TrackPage          = lazy(() => import('@/pages/public/TrackPage'))
const MapPage            = lazy(() => import('@/pages/public/MapPage'))
const NotFoundPage       = lazy(() => import('@/pages/public/NotFoundPage'))

// Passenger pages
const ProfilePage = lazy(() => import('@/pages/passenger/ProfilePage'))

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminRoutes    = lazy(() => import('@/pages/admin/RoutesPage'))
const AdminBookings  = lazy(() => import('@/pages/admin/BookingsPage'))
const AdminDrivers   = lazy(() => import('@/pages/admin/DriversPage'))
const AdminTemplates = lazy(() => import('@/pages/admin/TemplatesPage'))

// Staff pages
const StaffDashboard = lazy(() => import('@/pages/staff/DashboardPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Spinner size="lg"/>
    </div>
  )
}

export default function App() {
  const { initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader/>}>
        <Routes>

          {/* Public */}
          <Route path="/" element={
            <BlockBusStaff>
              <PublicLayout><HomePage/></PublicLayout>
            </BlockBusStaff>
          }/>

          <Route path="/auth" element={
            <RedirectIfAuthenticated>
              <PublicLayout><AuthPage/></PublicLayout>
            </RedirectIfAuthenticated>
          }/>

          <Route path="/booking/:routeId" element={
            <BlockBusStaff>
              <PublicLayout><BookingPage/></PublicLayout>
            </BlockBusStaff>
          }/>

          <Route path="/booking-confirmation/:reference" element={
            <BlockBusStaff>
              <PublicLayout><BookingConfirmPage/></PublicLayout>
            </BlockBusStaff>
          }/>

          <Route path="/cancel-booking" element={
            <BlockBusStaff>
              <PublicLayout><CancelBookingPage/></PublicLayout>
            </BlockBusStaff>
          }/>

          <Route path="/track" element={
            <PublicLayout><TrackPage/></PublicLayout>
          }/>

          <Route path="/map/:routeId" element={
            <PublicLayout><MapPage/></PublicLayout>
          }/>

          {/* Passenger */}
          <Route path="/profile" element={
            <RequireAuth>
              <BlockBusStaff>
                <PublicLayout><ProfilePage/></PublicLayout>
              </BlockBusStaff>
            </RequireAuth>
          }/>

          {/* Admin */}
          <Route path="/admin" element={
            <RequireAdmin>
              <AdminLayout><AdminDashboard/></AdminLayout>
            </RequireAdmin>
          }/>
          <Route path="/admin/routes" element={
            <RequireAdmin>
              <AdminLayout><AdminRoutes/></AdminLayout>
            </RequireAdmin>
          }/>
          <Route path="/admin/bookings" element={
            <RequireAdmin>
              <AdminLayout><AdminBookings/></AdminLayout>
            </RequireAdmin>
          }/>
          <Route path="/admin/drivers" element={
            <RequireAdmin>
              <AdminLayout><AdminDrivers/></AdminLayout>
            </RequireAdmin>
          }/>
          <Route path="/admin/templates" element={
            <RequireAdmin>
              <AdminLayout><AdminTemplates/></AdminLayout>
            </RequireAdmin>
          }/>

          {/* Staff */}
          <Route path="/staff" element={
            <RequireStaff>
              <StaffLayout><StaffDashboard/></StaffLayout>
            </RequireStaff>
          }/>

          {/* 404 */}
          <Route path="*" element={
            <PublicLayout><NotFoundPage/></PublicLayout>
          }/>

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}