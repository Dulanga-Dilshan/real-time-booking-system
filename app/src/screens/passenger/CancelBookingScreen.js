import { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { cancelBooking } from '@/api/bookings'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'

export default function CancelBookingScreen() {
  const user = useAuthStore((s) => s.user)

  const [reference, setReference] = useState('')
  const [nic, setNic] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleCancel = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = !user ? { nic } : {}
      await cancelBooking(reference.toUpperCase(), payload)
      setSuccess(`Booking ${reference.toUpperCase()} cancelled.`)
      setReference('')
      setNic('')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-950" contentContainerClassName="p-4">
      <Text className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Cancel booking</Text>
      <Text className="text-slate-500 dark:text-slate-400 text-sm mb-6">You can cancel using your reference number</Text>

      <Card className="p-6">
        {success && <Alert variant="success" className="mb-4">{success}</Alert>}
        {error && <Alert variant="error" className="mb-4">{error}</Alert>}
        {!user && <Alert variant="info" className="mb-4">Enter the NIC used when booking to confirm it's you.</Alert>}
        {user?.role === 'passenger' && <Alert variant="warning" className="mb-4">Cancelling here applies to any booking reference, not just your own.</Alert>}

        <View className="gap-4">
          <Input
            label="Booking reference"
            value={reference}
            onChangeText={(v) => setReference(v.toUpperCase())}
            placeholder="e.g. ABC123"
            autoCapitalize="characters"
          />
          {!user && (
            <Input
              label="NIC"
              value={nic}
              onChangeText={setNic}
              placeholder="e.g. 199012345678"
              hint="The NIC entered when this booking was made"
            />
          )}
          <Button title="Cancel booking" variant="danger" size="lg" loading={loading} onPress={handleCancel} />
        </View>
      </Card>
    </ScrollView>
  )
}