import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { getDriverDashboard, updateLocation, updateGps, setTrackingMode } from '@/api/driver'
import { useEchoChannel } from '@/hooks/useEcho'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'

function StopStrip({ stops, currentIdx }) {
  const half    = 2
  let start     = Math.max(0, currentIdx - half)
  let end       = Math.min(stops.length - 1, start + 4)
  start         = Math.max(0, end - 4)
  const visible = stops.slice(start, end + 1)

  return (
    <div className="flex items-start justify-center gap-1 overflow-x-auto pb-1">
      {start > 0 && (
        <>
          <div className="flex-shrink-0 flex flex-col items-center mr-1">
            <div className="w-2 h-2 rounded-full bg-slate-300 mt-0.5"/>
            <p className="text-xs text-slate-300 mt-1">···</p>
          </div>
          <div className="w-5 h-px bg-slate-200 dark:bg-slate-700 mt-1.5 flex-shrink-0"/>
        </>
      )}
      {visible.map((stop, vi) => {
        const idx     = start + vi
        const isCur   = idx === currentIdx
        const isPast  = idx < currentIdx
        const isLast  = vi === visible.length - 1
        return (
          <div key={idx} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 ${
                isCur  ? 'bg-blue-600 border-blue-600' :
                isPast ? 'bg-slate-400 border-slate-400' :
                         'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
              }`}/>
              <p className={`text-xs mt-1 whitespace-nowrap ${isCur ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                {stop.name}
              </p>
            </div>
            {!isLast && (
              <div className={`w-5 h-px ${isPast ? 'bg-slate-400' : 'bg-slate-200 dark:bg-slate-700'} mb-4 flex-shrink-0`}/>
            )}
          </div>
        )
      })}
      {end < stops.length - 1 && (
        <>
          <div className="w-5 h-px bg-slate-200 dark:bg-slate-700 mt-1.5 flex-shrink-0"/>
          <div className="flex-shrink-0 flex flex-col items-center ml-1">
            <div className="w-2 h-2 rounded-full bg-slate-300 mt-0.5"/>
            <p className="text-xs text-slate-300 mt-1">···</p>
          </div>
        </>
      )}
    </div>
  )
}

export default function StaffDashboardPage() {
  const { t }                     = useTranslation()
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [mode, setMode]           = useState('manual')
  const [updating, setUpdating]   = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [passengerCount, setPassengerCount]   = useState(0)
  const [bookedSeats, setBookedSeats]         = useState([])
  const gpsWatchRef = useRef(null)
  const lastSentRef = useRef(0)
  const today       = dayjs().format('YYYY-MM-DD')

  useEffect(() => {
    getDriverDashboard()
      .then(res => {
        setData(res.data)
        setCurrentIdx(res.data.location?.current_stop_index ?? 0)
        setMode(res.data.location?.tracking_mode ?? 'manual')
        setPassengerCount(res.data.total_bookings ?? 0)
        setBookedSeats((res.data.booked_seats ?? []).map(String))
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  // Real-time seat updates
  useEchoChannel(
    data ? `bus.${data.bus_route?.id}.${today}` : null,
    '.SeatUpdated',
    (e) => {
      setBookedSeats(e.booked_seats.map(String))
      setPassengerCount(e.booked_seats.length)
    }
  )

  const handleNext = async () => {
    if (!data) return
    const maxIdx = (data.stops?.length ?? 1) - 1
    if (currentIdx >= maxIdx) return
    setUpdating(true)
    try {
      const res = await updateLocation({ direction: 'next' })
      setCurrentIdx(res.data.current_stop_index)
    } catch { toast.error(t('common.error')) }
    finally { setUpdating(false) }
  }

  const handlePrev = async () => {
    if (!data || currentIdx <= 0) return
    setUpdating(true)
    try {
      const res = await updateLocation({ direction: 'previous' })
      setCurrentIdx(res.data.current_stop_index)
    } catch { toast.error(t('common.error')) }
    finally { setUpdating(false) }
  }

  const sendGps = async () => {
    const now = Date.now()
    if (now - lastSentRef.current < 29000) return
    lastSentRef.current = now

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await updateGps({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setCurrentIdx(res.data.current_stop_index)
      } catch {}
    }, () => {})
  }

  const toggleMode = async () => {
    const newMode = mode === 'manual' ? 'auto' : 'manual'
    try {
      await setTrackingMode({ mode: newMode })
      setMode(newMode)

      if (newMode === 'auto') {
        if (!navigator.geolocation) { toast.error(t('staff.gps_unavailable')); return }
        navigator.permissions?.query({ name: 'geolocation' }).then(r => {
          if (r.state === 'denied') { toast.error(t('staff.gps_denied')); return }
          sendGps()
          gpsWatchRef.current = navigator.geolocation.watchPosition(
            () => sendGps(),
            () => toast.error(t('staff.gps_unavailable')),
            { enableHighAccuracy: true, timeout: 30000 }
          )
        }).catch(() => {
          sendGps()
          gpsWatchRef.current = navigator.geolocation.watchPosition(() => sendGps())
        })
      } else {
        if (gpsWatchRef.current !== null) {
          navigator.geolocation.clearWatch(gpsWatchRef.current)
          gpsWatchRef.current = null
        }
      }
    } catch { toast.error(t('common.error')) }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg"/></div>

  if (!data?.bus_route) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('staff.no_assignment')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('staff.no_assignment_hint')}</p>
      </div>
    )
  }

  const { bus_route, stops = [], bookings = [] } = data
  const maxIdx  = stops.length - 1
  const curStop = stops[currentIdx]

  const totalRows = Math.ceil(bus_route.total_seats / 5)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Bus info */}
      <div className="bg-slate-800 dark:bg-slate-950 text-white rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs mb-1">{t('staff.your_route')}</p>
            {bus_route.bus_number && (
              <p className="font-mono text-xs text-slate-400 mb-0.5">{bus_route.bus_number}</p>
            )}
            <p className="text-xl font-bold">{bus_route.from_location} → {bus_route.to_location}</p>
            <p className="text-slate-400 text-sm mt-1">
              {dayjs(`1970-01-01T${bus_route.departure_time}`).format('h:mm A')} → {dayjs(`1970-01-01T${bus_route.arrival_time}`).format('h:mm A')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs mb-1">{t('staff.passengers_today')}</p>
            <p className="text-3xl font-bold text-blue-400" id="passenger-count">{passengerCount}</p>
            <p className="text-slate-400 text-xs">of {bus_route.total_seats}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* LEFT: Location */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-5">
            {/* Mode toggle */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('staff.current_location')}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {mode === 'auto' ? t('staff.auto_gps') : t('staff.manual')}
                </span>
                <button
                  onClick={toggleMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    mode === 'auto' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    mode === 'auto' ? 'translate-x-6' : 'translate-x-1'
                  }`}/>
                </button>
              </div>
            </div>

            {/* Current stop */}
            {stops.length > 0 && (
              <>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{curStop?.name ?? '—'}</p>
                  <p className="text-slate-400 text-xs mt-1">Stop {currentIdx + 1} of {stops.length}</p>
                </div>

                <StopStrip stops={stops} currentIdx={currentIdx}/>

                {/* Auto mode indicator */}
                {mode === 'auto' && (
                  <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"/>
                      {t('staff.auto_gps')} active
                    </div>
                  </div>
                )}

                {/* Manual controls */}
                {mode === 'manual' && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      disabled={updating || currentIdx === 0}
                      className="flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                      {t('staff.previous')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleNext}
                      disabled={updating || currentIdx === maxIdx}
                      className="flex items-center gap-1"
                    >
                      {t('staff.next')}
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* RIGHT: Seat map + bookings */}
        <div className="md:col-span-3 space-y-4">
          {/* Seat map */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">{t('staff.seat_map')}</p>

            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"/>
              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">🚌 {t('booking.driver')}</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"/>
            </div>

            <div className="space-y-1.5">
              {Array.from({ length: totalRows }, (_, row) => {
                const base = row * 5
                const renderSeat = (offset) => {
                  const num   = base + offset + 1
                  if (num > bus_route.total_seats) return <div key={`e-${offset}`} className="w-9 h-9"/>
                  const taken = bookedSeats.includes(String(num))
                  const bk    = data.bookings?.find(b => b.seats?.includes(String(num)) || b.seats?.some?.(s => String(s) === String(num)))
                  return (
                    <div
                      key={num}
                      onClick={() => {
                        if (taken && bk) setSelectedBooking(bk)
                      }}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-medium transition-colors select-none ${
                        taken
                          ? 'bg-blue-600 text-white border border-blue-700 cursor-pointer hover:bg-blue-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {num}
                    </div>
                  )
                }

                return (
                  <div key={row} className="flex items-center gap-1.5 justify-center">
                    {renderSeat(0)}
                    {renderSeat(1)}
                    <div className="w-3"/>
                    {renderSeat(2)}
                    {renderSeat(3)}
                    {renderSeat(4)}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block"/>
                {t('staff.booked')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 inline-block"/>
                {t('staff.empty')}
              </span>
            </div>
          </Card>

          {/* Bookings list */}
          <Card className="overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('staff.todays_bookings')}</p>
            </div>
            {bookings.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">{t('staff.no_bookings')}</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map(b => (
                  <div
                    key={b.booking_reference}
                    className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedBooking(b)}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{b.booking_reference}</span>
                        <span className="text-xs text-slate-400">Seat {b.seats?.join(', ')}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{b.passenger_name}</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Booking detail modal */}
      <Modal
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking details"
      >
        {selectedBooking && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {[
              ['Reference',  selectedBooking.booking_reference],
              ['Passenger',  selectedBooking.passenger_name],
              ['NIC',        selectedBooking.nic],
              ['Gender',     selectedBooking.gender],
              ['Email',      selectedBooking.email ?? '—'],
              ['Seats',      selectedBooking.seats?.join(', ')],
              ['Payment',    selectedBooking.payment_method === 'station' ? 'Pay at station' : 'Online'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5">
                <span className="text-slate-500 dark:text-slate-400">{label}</span>
                <span className={`font-medium ${label === 'Reference' ? 'font-mono text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}