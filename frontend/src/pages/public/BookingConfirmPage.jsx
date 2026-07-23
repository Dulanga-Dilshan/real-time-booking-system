import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { getBooking, downloadReceipt, emailReceipt } from '@/api/bookings'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function BookingConfirmPage() {
  const { t }         = useTranslation()
  const { reference } = useParams()
  const [booking, setBooking]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [emailing, setEmailing] = useState(false)

  useEffect(() => {
    getBooking(reference)
      .then(res => setBooking(res.data.booking))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [reference])

  const handleDownload = async () => {
    try {
      const res  = await downloadReceipt(reference)
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `BusBook-${reference}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
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

  if (loading) return (
    <div className="flex justify-center py-24"><Spinner size="lg"/></div>
  )

  if (!booking) return (
    <div className="text-center py-24 text-slate-500">Booking not found</div>
  )

  const rows = [
    [t('confirmation.travel_date'), dayjs(booking.travel_date).format('ddd, DD MMM YYYY')],
    [t('confirmation.passenger'),   booking.passenger_name],
    [t('confirmation.payment'),     booking.payment_method === 'station' ? t('confirmation.pay_station') : 'Online'],
    [t('confirmation.total_price'), `LKR ${Number((booking.route?.price ?? 0) * (booking.seats?.length ?? 1)).toLocaleString()}`],
    ...(booking.email ? [[t('confirmation.email_label'), booking.email]] : []),
  ]

  return (
    <div className="max-w-md mx-auto">
      {/* Success header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{t('confirmation.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('confirmation.subtitle')}</p>
      </div>

      <Card className="p-6 mb-4">
        {/* Reference */}
        <div className="text-center mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{t('confirmation.reference')}</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-widest">{booking.booking_reference}</p>
        </div>

        {/* Route strip */}
        <div className="bg-slate-800 dark:bg-slate-950 text-white rounded-xl p-4 mb-5 flex justify-between items-center">
          <div>
            {booking.bus_number && (
              <p className="font-mono text-xs text-slate-400 mb-1">{booking.bus_number}</p>
            )}
            <p className="font-bold">{booking.route?.from_location} → {booking.route?.to_location}</p>
            <p className="text-slate-400 text-xs mt-1">
              {booking.route?.departure_time && dayjs(`1970-01-01T${booking.route.departure_time}`).format('h:mm A')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">{booking.seats?.length > 1 ? t('confirmation.seats') : t('confirmation.seat')}</p>
            <p className="font-bold text-lg">{booking.seats?.join(', ')}</p>
          </div>
        </div>

        {/* Detail rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm mb-5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between py-2.5">
              <span className="text-slate-500 dark:text-slate-400">{label}</span>
              <span className="font-medium text-slate-800 dark:text-white">{value}</span>
            </div>
          ))}
        </div>

        {/* Receipt buttons */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{t('confirmation.receipt')}</p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              {t('confirmation.download_pdf')}
            </Button>

            {booking.email ? (
              <Button variant="outline" onClick={handleEmail} loading={emailing} className="gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                {t('confirmation.email_receipt')}
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-800 rounded-xl py-2 text-sm text-slate-300 dark:text-slate-600 cursor-not-allowed">
                {t('confirmation.no_email')}
              </div>
            )}
          </div>
        </div>
      </Card>

      <p className="text-xs text-slate-400 text-center mb-4">{t('cancel.subtitle')}</p>
      <Link to="/"><Button className="w-full" size="lg">{t('confirmation.back_home')}</Button></Link>
    </div>
  )
}