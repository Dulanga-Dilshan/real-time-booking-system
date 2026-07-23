"export default function ProfilePage(){return null}" 
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { getMyBookings } from '@/api/profile'
import { updatePassword } from '@/api/profile'
import useAuthStore from '@/store/authStore'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'

export default function ProfilePage() {
  const { t }    = useTranslation()
  const { user } = useAuthStore()

  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [pwForm, setPwForm]       = useState({ current_password: '', password: '', password_confirmation: '' })
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    getMyBookings()
      .then(res => setBookings(res.data.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handlePassword = async (e) => {
    e.preventDefault()
    setPwLoading(true)
    try {
      await updatePassword(pwForm)
      toast.success('Password updated!')
      setPwForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      toast.error(err.response?.data?.message ?? t('common.error'))
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{t('profile.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-4">
          {/* Avatar card */}
          <Card className="p-5 text-center">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
            <div className="mt-3">
              <Badge variant="blue" className="capitalize">{user?.role}</Badge>
            </div>
          </Card>

          {/* Password card */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{t('profile.change_password')}</h2>
            <form onSubmit={handlePassword} className="space-y-3">
              <Input label={t('profile.current_password')} type="password"
                value={pwForm.current_password}
                onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))} required/>
              <Input label={t('profile.new_password')} type="password"
                value={pwForm.password}
                onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))} required/>
              <Input label={t('profile.confirm_new_password')} type="password"
                value={pwForm.password_confirmation}
                onChange={e => setPwForm(p => ({ ...p, password_confirmation: e.target.value }))} required/>
              <Button type="submit" variant="secondary" className="w-full" loading={pwLoading}>
                {t('profile.update_password')}
              </Button>
            </form>
          </Card>
        </div>

        {/* Bookings */}
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('profile.my_bookings')}</h2>
            </div>
            {loading ? (
              <div className="flex justify-center py-8"><Spinner/></div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">{t('profile.no_bookings')}</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map(b => (
                  <div key={b.booking_reference} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                          {b.booking_reference}
                        </span>
                        <Badge variant={b.status === 'confirmed' ? 'green' : 'red'}>
                          {b.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">
                        {b.route?.from_location} → {b.route?.to_location}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {dayjs(b.travel_date).format('ddd, DD MMM YYYY')} · Seat {b.seats?.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}