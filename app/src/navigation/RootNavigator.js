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

import AppHeader from './AppHeader'

import {
  requireAuth, requireAdmin, requireStaff,
  redirectIfAuthenticated, blockBusStaff,
} from './guards'

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ header: (props) => <AppHeader {...props} /> }}
      >
        <Stack.Screen name="Home" component={blockBusStaff(HomeScreen)} />
        <Stack.Screen name="Auth" component={redirectIfAuthenticated(AuthScreen)} />
        <Stack.Screen name="ServerSettings" component={ServerSettingsScreen} />
        <Stack.Screen name="Booking" component={blockBusStaff(BookingScreen)} />
        <Stack.Screen name="BookingConfirm" component={blockBusStaff(BookingConfirmScreen)} />
        <Stack.Screen name="CancelBooking" component={blockBusStaff(CancelBookingScreen)} />
        <Stack.Screen name="Track" component={TrackScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Profile" component={requireAuth(blockBusStaff(ProfileScreen))} />
        <Stack.Screen name="Staff" component={requireStaff(DriverDashboardScreen)} />
        <Stack.Screen name="AdminDashboard" component={requireAdmin(AdminDashboardScreen)} />
        <Stack.Screen name="AdminRoutes" component={requireAdmin(AdminRoutesScreen)} />
        <Stack.Screen name="AdminBookings" component={requireAdmin(AdminBookingsScreen)} />
        <Stack.Screen name="AdminDrivers" component={requireAdmin(AdminDriversScreen)} />
        <Stack.Screen name="AdminTemplates" component={requireAdmin(AdminTemplatesScreen)} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}