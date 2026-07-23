import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cancelBooking } from '@/api/bookings'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'

export default function CancelBookingPage() {
  const { t }    = useTranslation()
  const { user } = useAuthStore()

  const [reference, setReference] = useState('')
  const [nic, setNic]             = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [success, setSuccess]     = useState(null)

  const handleCancel = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = !user ? { nic } : {}
      await cancelBooking(reference.toUpperCase(), payload)
      setSuccess(t('cancel.success', { ref: reference.toUpperCase() }))
      setReference('')
      setNic('')
    } catch (err) {
      setError(err.response?.data?.message ?? t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{t('cancel.title')}</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{t('cancel.subtitle')}</p>

      <Card className="p-6">
        {success && <Alert variant="success" className="mb-4">{success}</Alert>}
        {error   && <Alert variant="error"   className="mb-4">{error}</Alert>}

        {!user && (
          <Alert variant="info" className="mb-4">{t('cancel.not_logged_in_hint')}</Alert>
        )}
        {user?.role === 'passenger' && (
          <Alert variant="warning" className="mb-4">{t('cancel.logged_in_hint')}</Alert>
        )}

        <form onSubmit={handleCancel} className="space-y-4">
          <Input
            label={t('cancel.reference')}
            value={reference}
            onChange={e => setReference(e.target.value.toUpperCase())}
            placeholder={t('cancel.reference_placeholder')}
            required
            className="uppercase tracking-widest font-mono"
          />
          {!user && (
            <Input
              label={t('cancel.nic')}
              value={nic}
              onChange={e => setNic(e.target.value)}
              placeholder="e.g. 199012345678"
              hint={t('cancel.nic_hint')}
              required
            />
          )}
          <Button type="submit" variant="danger" className="w-full" size="lg" loading={loading}>
            {t('cancel.cancel_btn')}
          </Button>
        </form>
      </Card>
    </div>
  )
}