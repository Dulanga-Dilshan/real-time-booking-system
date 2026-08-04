import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Platform } from 'react-native'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import * as SecureStore from 'expo-secure-store'
import dayjs from 'dayjs'
import { getBooking, emailReceipt } from '@/api/bookings'
import { getApiBaseUrl } from '@/config/server'
import { TOKEN_KEY } from '@/api/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import toast from '@/lib/toast'

export default function BookingConfirmScreen({ route, navigation }) {
  const { reference } = route.params
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [emailing, setEmailing] = useState(false)

  useEffect(() => {
    getBooking(reference)
      .then((res) => setBooking(res.data.booking))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [reference])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const baseUrl = await getApiBaseUrl()
      const token = await SecureStore.getItemAsync(TOKEN_KEY)
      const fileUri = `${FileSystem.cacheDirectory}BusBook-${reference}.pdf`

      const result = await FileSystem.downloadAsync(
        `${baseUrl}/bookings/${reference}/receipt`,
        fileUri,
        { headers: { Authorization: token ? `Bearer ${token}` : '', Accept: 'application/pdf' } }
      )

      if (result.status !== 200) throw new Error('Download failed')

      if (Platform.OS === 'android') {
        const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
        if (perm.granted) {
          const base64 = await FileSystem.readAsStringAsync(result.uri, { encoding: FileSystem.EncodingType.Base64 })
          const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
            perm.directoryUri,
            `BusBook-${reference}`,
            'application/pdf'
          )
          await FileSystem.writeAsStringAsync(destUri, base64, { encoding: FileSystem.EncodingType.Base64 })
          toast.success('Saved to selected folder')
          return
        }
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf' })
      } else {
        toast.success('Receipt saved')
      }
    } catch {
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  const handleEmail = async () => {
    setEmailing(true)
    try {
      await emailReceipt(reference)
      toast.success(`Receipt sent to ${booking.email}`)
    } catch {
      toast.error('Failed to send email')
    } finally {
      setEmailing(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </View>
    )
  }
  if (!booking) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Text className="text-slate-500">Booking not found</Text>
      </View>
    )
  }

  const rows = [
    ['Travel date', dayjs(booking.travel_date).format('ddd, DD MMM YYYY')],
    ['Passenger', booking.passenger_name],
    ['Payment', booking.payment_method === 'station' ? 'Pay at station' : 'Online'],
    ['Total', `LKR ${Number((booking.route?.price ?? 0) * (booking.seats?.length ?? 1)).toLocaleString()}`],
    ...(booking.email ? [['Email', booking.email]] : []),
  ]

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerClassName="p-4">
      <View className="items-center mb-6">
        <View className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-4">
          <Text className="text-3xl">✓</Text>
        </View>
        <Text className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Booking confirmed!</Text>
        <Text className="text-slate-500 dark:text-slate-400 text-sm">You can cancel using your reference number</Text>
      </View>

      <Card className="p-6 mb-4">
        <View className="items-center mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Reference</Text>
          <Text className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-widest">{booking.booking_reference}</Text>
        </View>

        <View className="bg-slate-800 dark:bg-slate-950 rounded-xl p-4 mb-5 flex-row justify-between items-center">
          <View>
            {booking.bus_number && <Text className="font-mono text-xs text-slate-400 mb-1">{booking.bus_number}</Text>}
            <Text className="font-bold text-white">{booking.route?.from_location} → {booking.route?.to_location}</Text>
            <Text className="text-slate-400 text-xs mt-1">
              {booking.route?.departure_time && dayjs(`1970-01-01T${booking.route.departure_time}`).format('h:mm A')}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-slate-400 mb-1">{booking.seats?.length > 1 ? 'Seats' : 'Seat'}</Text>
            <Text className="font-bold text-lg text-white">{booking.seats?.join(', ')}</Text>
          </View>
        </View>

        <View className="mb-5">
          {rows.map(([label, value]) => (
            <View key={label} className="flex-row justify-between py-2.5 border-b border-slate-100 dark:border-slate-800">
              <Text className="text-slate-500 dark:text-slate-400 text-sm">{label}</Text>
              <Text className="font-medium text-slate-800 dark:text-white text-sm">{value}</Text>
            </View>
          ))}
        </View>

        <View className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Receipt</Text>
          <View className="flex-row gap-3">
            <Button title="Download PDF" variant="outline" className="flex-1" loading={downloading} onPress={handleDownload} />
            {booking.email ? (
              <Button title="Email receipt" variant="outline" className="flex-1" loading={emailing} onPress={handleEmail} />
            ) : null}
          </View>
        </View>
      </Card>

      <Button title="Back to home" size="lg" onPress={() => navigation.popToTop()} />
    </ScrollView>
  )
}