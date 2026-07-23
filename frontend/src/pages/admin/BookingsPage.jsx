import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { getAdminBookings, cancelAdminBooking } from '@/api/admin'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'

export default function BookingsPage() {
  const { t }                 = useTranslation()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [status, setStatus]     = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState(null)

  const load = async (s, p) => {
    setLoading(true)
    try {
      const res = await getAdminBookings({ status: s || undefined, page: p })
      setBookings(res.data.data ?? [])
      setMeta(res.data.meta ?? res.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load(status, page) }, [status, page])

  const handleCancel = async (booking) => {
    if (!confirm(`Cancel booking ${booking.booking_reference}?`)) return
    try {
      await cancelAdminBooking(booking.id)
      toast.success(`Booking ${booking.booking_reference} cancelled`)
      load(status, page)
    } catch {
      toast.error(t('common.error'))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('admin.view_bookings')}</h1>
      </div>

      {/* Filter */}
      <Card className="p-4 mb-4">
        <div className="flex gap-3 items-end">
          <div className="w-48">
            <Select
              label="Status"
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1) }}
            >
              <option value="">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
          <Button variant="secondary" onClick={() => { setStatus(''); setPage(1) }}>
            Clear
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg"/></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {['Ref', 'Passenger', 'Route', 'Date', 'Seats', 'Payment', 'Status', ''].map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400">No bookings found</td></tr>
                ) : bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{b.booking_reference}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-white">{b.passenger_name}</p>
                      <p className="text-xs text-slate-400">{b.nic}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {b.bus_route?.from_location} → {b.bus_route?.to_location}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {dayjs(b.travel_date).format('DD MMM YYYY')}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {b.seats?.map(s => s.seat_number).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize">{b.payment_method}</td>
                    <td className="px-4 py-3">
                      <Badge variant={b.status === 'confirmed' ? 'green' : 'red'}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {b.status === 'confirmed' && (
                        <Button size="sm" variant="danger" onClick={() => handleCancel(b)}>
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Page {meta.current_page} of {meta.last_page}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
