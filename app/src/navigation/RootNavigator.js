import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import HomeScreen from '@/screens/passenger/HomeScreen'
import AuthScreen from '@/screens/public/AuthScreen'
import ServerSettingsScreen from '@/screens/public/ServerSettingsScreen'
import BookingScreen from '@/screens/passenger/BookingScreen'
import BookingConfirmScreen from '@/screens/passenger/BookingConfirmScreen'
import CancelBookingScreen from '@/screens/passenger/CancelBookingScreen'
import TrackScreen from '@/screens/passenger/TrackScreen'
import MapScreen from '@/screens/passenger/MapScreen'
import ProfileScreen from '@/screens/passenger/ProfileScreen'

import DriverDashboardScreen from '@/screens/staff/DriverDashboardScreen'

import AdminDashboardScreen from '@/screens/admin/DashboardScreen'
import AdminRoutesScreen from '@/screens/admin/RoutesScreen'
import AdminBookingsScreen from '@/screens/admin/BookingsScreen'
import AdminDriversScreen from '@/screens/admin/DriversScreen'
import AdminTemplatesScreen from '@/screens/admin/TemplatesScreen'

import {
  requireAuth, requireAdmin, requireStaff,
  redirectIfAuthenticated, blockBusStaff,
} from './guards'

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* Public — matches "/" */}
        <Stack.Screen name="Home" component={blockBusStaff(HomeScreen)} options={{ title: 'Search Buses' }} />

        {/* matches "/auth" */}
        <Stack.Screen name="Auth" component={redirectIfAuthenticated(AuthScreen)} options={{ headerShown: false }} />
        <Stack.Screen name="ServerSettings" component={ServerSettingsScreen} options={{ title: 'Server Settings' }} />

        {/* matches "/booking/:routeId" etc */}
        <Stack.Screen name="Booking" component={blockBusStaff(BookingScreen)} options={{ title: 'Book Seat' }} />
        <Stack.Screen name="BookingConfirm" component={blockBusStaff(BookingConfirmScreen)} options={{ title: 'Confirmation' }} />
        <Stack.Screen name="CancelBooking" component={blockBusStaff(CancelBookingScreen)} options={{ title: 'Cancel Booking' }} />

        {/* matches "/track", "/map/:routeId" — no guard on web */}
        <Stack.Screen name="Track" component={TrackScreen} options={{ title: 'Track Buses' }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Live Map' }} />

        {/* matches "/profile" — RequireAuth + BlockBusStaff */}
        <Stack.Screen name="Profile" component={requireAuth(blockBusStaff(ProfileScreen))} options={{ title: 'My Profile' }} />

        {/* matches "/staff" — RequireStaff */}
        <Stack.Screen name="Staff" component={requireStaff(DriverDashboardScreen)} options={{ title: 'My Route' }} />

        {/* matches "/admin/*" — RequireAdmin */}
        <Stack.Screen name="AdminDashboard" component={requireAdmin(AdminDashboardScreen)} options={{ title: 'Admin Dashboard' }} />
        <Stack.Screen name="AdminRoutes" component={requireAdmin(AdminRoutesScreen)} options={{ title: 'Routes' }} />
        <Stack.Screen name="AdminBookings" component={requireAdmin(AdminBookingsScreen)} options={{ title: 'Bookings' }} />
        <Stack.Screen name="AdminDrivers" component={requireAdmin(AdminDriversScreen)} options={{ title: 'Drivers' }} />
        <Stack.Screen name="AdminTemplates" component={requireAdmin(AdminTemplatesScreen)} options={{ title: 'Route Templates' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}