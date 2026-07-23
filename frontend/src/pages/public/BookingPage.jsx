"export default function BookingPage(){return null}" 
import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { getRoute } from '@/api/routes'
import { getAllBuses } from '@/api/tracking'
import { createBooking } from '@/api/bookings'
import { useEchoChannel } from '@/hooks/useEcho'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Modal from '@/components/ui/Modal'

export default function BookingPage() {
  const { t }          = useTranslation()
  const { routeId }    = useParams()
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const date           = searchParams.get('date') ?? dayjs().format('YYYY-MM-DD')
  const isToday        = date === dayjs().format('YYYY-MM-DD')

  const [route, setRoute]             = useState(null)
  const [stops, setStops]             = useState([])
  const [bookedSeats, setBookedSeats] = useState([])
  const [busLocation, setBusLocation] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [showStops, setShowStops]     = useState(false)

  const [selectedSeats, setSelectedSeats] = useState([])
  const MAX_SEATS = 5

  const [form, setForm] = useState({
    passenger_name: '', gender: '', nic: '',
    email: '', board_stop_index: '', alight_stop_index: '',
    payment_method: 'station',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const routeRes = await getRoute(routeId, { date })
        const r        = routeRes.data.route
        const s        = routeRes.data.stops ?? []
        setRoute(r)
        setStops(s)
        setBookedSeats((routeRes.data.booked_seats ?? []).map(String))
        if (s.length > 0) {
          setForm(p => ({ ...p, board_stop_index: '0', alight_stop_index: String(s.length - 1) }))
        }

        if (isToday) {
          try {
            const trackRes = await getAllBuses()
            const bus = trackRes.data.buses?.find(b => b.id === parseInt(routeId))
            if (bus) setBusLocation(bus)
          } catch {}
        }
      } catch {
        toast.error(t('common.error'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [routeId, date])

  useEchoChannel(`bus.${routeId}.${date}`, '.SeatUpdated', (data) => {
    const newBooked = data.booked_seats.map(String)
    setBookedSeats(newBooked)
    setSelectedSeats(prev => {
      const removed = prev.filter(s => newBooked.includes(s))
      if (removed.length > 0) toast.error('A seat you selected was just booked!')
      return prev.filter(s => !newBooked.includes(s))
    })
  })

  useEchoChannel(
    isToday ? `bus-location.${routeId}.${date}` : null,
    '.BusLocationUpdated',
    (data) => setBusLocation(prev => prev ? { ...prev, ...data, current_stop: stops[data.current_stop_index] } : prev)
  )

  const toggleSeat = (num) => {
    const str = String(num)
    if (bookedSeats.includes(str)) return
    setSelectedSeats(prev => {
      if (prev.includes(str)) return prev.filter(s => s !== str)
      if (prev.length >= MAX_SEATS) { toast.error(`Max ${MAX_SEATS} seats`); return prev }
      return [...prev, str]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedSeats.length === 0) { toast.error('Select at least one seat'); return }
    if (!form.board_stop_index)  { toast.error('Select boarding stop'); return }
    if (!form.alight_stop_index) { toast.error('Select alighting stop'); return }
    setSubmitting(true)
    try {
      const res = await createBooking({
        bus_route_id:      parseInt(routeId),
        seat_numbers:      selectedSeats,
        travel_date:       date,
        passenger_name:    form.passenger_name,
        gender:            form.gender,
        email:             form.email || undefined,
        nic:               form.nic,
        board_stop_index:  parseInt(form.board_stop_index),
        alight_stop_index: parseInt(form.alight_stop_index),
        payment_method:    form.payment_method,
      })
      navigate(`/booking-confirmation/${res.data.booking.booking_reference}`)
    } catch (err) {
      toast.error(err.response?.data?.message ?? t('common.error'))
      if (err.response?.data?.taken_seats) {
        const taken = err.response.data.taken_seats.map(String)
        setBookedSeats(prev => [...new Set([...prev, ...taken])])
        setSelectedSeats(prev => prev.filter(s => !taken.includes(s)))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg"/></div>
  if (!route)  return null

  const totalRows  = Math.ceil(route.total_seats / 5)
  const currentIdx = busLocation?.current_stop_index ?? 0
  const curStop    = stops[currentIdx]
  const nextStop   = stops[currentIdx + 1]
  const boardIdx   = parseInt(form.board_stop_index || 0)
  const departure  = dayjs(`1970-01-01T${route.departure_time}`)

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/?date=${date}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        {t('common.back')}
      </Link>

      {/* Route info */}
      <Card className="p-5 mb-4">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          {route.bus_number && (
            <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {route.bus_number}
            </span>
          )}
          <span className="text-lg font-bold text-slate-800 dark:text-white">{route.from_location}</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          <span className="text-lg font-bold text-slate-800 dark:text-white">{route.to_location}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
          <span>{dayjs(`1970-01-01T${route.departure_time}`).format('h:mm A')} → {dayjs(`1970-01-01T${route.arrival_time}`).format('h:mm A')}</span>
          <span className="text-slate-300">·</span>
          <span>{dayjs(date).format('ddd, DD MMM YYYY')}</span>
          <span className="text-slate-300">·</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">LKR {Number(route.price).toLocaleString()} {t('home.per_seat')}</span>
        </div>
      </Card>

      {/* Live location bar */}
      {isToday && curStop && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse mt-1.5 flex-shrink-0"/>
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  {t('booking.bus_at')} <span>{curStop.name}</span>
                </p>
                {nextStop && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    {t('booking.heading_to')} {nextStop.name} · {t('booking.arrives_in', {
                      mins: Math.round((nextStop.time_to_arrive - curStop.time_to_arrive) * 60)
                    })}
                  </p>
                )}
              </div>
            </div>
            <Link to={`/map/${routeId}`} className="text-xs text-blue-600 border border-blue-300 dark:border-blue-700 px-3 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex-shrink-0">
              {t('booking.open_map')}
            </Link>
          </div>
        </div>
      )}

      {/* Seat map */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('booking.choose_seats')}</p>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              selectedSeats.length >= MAX_SEATS
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {t('booking.selected', { count: selectedSeats.length })}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700 inline-block"/>
            {t('booking.available')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 inline-block"/>
            {t('booking.selected_label')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-red-100 border border-red-300 dark:bg-red-900/30 dark:border-red-700 inline-block"/>
            {t('booking.taken')}
          </span>
        </div>

        {/* Driver */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"/>
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            🚌 {t('booking.front')} — {t('booking.driver')}
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"/>
        </div>

        {/* Seat grid */}
        <div className="space-y-2">
          {Array.from({ length: totalRows }, (_, row) => {
            const base = row * 5
            const renderSeat = (offset) => {
              const num      = base + offset + 1
              if (num > route.total_seats) return <div key={`e-${offset}`} className="w-10 h-10"/>
              const taken    = bookedSeats.includes(String(num))
              const selected = selectedSeats.includes(String(num))
              return (
                <div
                  key={num}
                  onClick={() => toggleSeat(num)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-xs font-medium select-none transition-colors ${
                    taken    ? 'bg-red-100 text-red-400 border border-red-200 cursor-not-allowed dark:bg-red-900/20 dark:border-red-800 dark:text-red-500' :
                    selected ? 'bg-blue-600 text-white border border-blue-600 cursor-pointer font-bold' :
                               'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-pointer hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700'
                  }`}
                >
                  {num}
                </div>
              )
            }

            return (
              <div key={row} className="flex items-center gap-2 justify-center">
                {renderSeat(0)}
                {renderSeat(1)}
                <div className="w-6 flex items-center justify-center">
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"/>
                </div>
                {renderSeat(2)}
                {renderSeat(3)}
                {renderSeat(4)}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Booking form */}
      {selectedSeats.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">{t('booking.passenger_details')}</h2>
            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold px-3 py-1 rounded-full">
              {selectedSeats.join(', ')}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="col-span-2">
                <Input
                  label={`${t('booking.full_name')} (${t('booking.full_name_hint')})`}
                  value={form.passenger_name}
                  onChange={e => setForm(p => ({ ...p, passenger_name: e.target.value }))}
                  required
                />
              </div>
              <Select
                label={t('booking.gender')}
                value={form.gender}
                onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                required
              >
                <option value="">— Select —</option>
                <option value="male">{t('booking.gender_male')}</option>
                <option value="female">{t('booking.gender_female')}</option>
                <option value="other">{t('booking.gender_other')}</option>
              </Select>
              <Input
                label={t('booking.nic')}
                value={form.nic}
                onChange={e => setForm(p => ({ ...p, nic: e.target.value }))}
                placeholder="199012345678"
                required
              />
              <div className="col-span-2">
                <Input
                  label={`${t('booking.email')} (${t('booking.email_hint')})`}
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>

              {stops.length > 0 && (
                <>
                  <Select
                    label={t('booking.board_at')}
                    value={form.board_stop_index}
                    onChange={e => {
                      const idx = parseInt(e.target.value)
                      setForm(p => ({
                        ...p,
                        board_stop_index:  String(idx),
                        alight_stop_index: String(idx + 1 < stops.length ? idx + 1 : idx),
                      }))
                    }}
                    required
                  >
                    {stops.slice(0, stops.length - 1).map((s, i) => (
                      <option key={i} value={i}>{s.name}</option>
                    ))}
                  </Select>

                  <Select
                    label={t('booking.alight_at')}
                    value={form.alight_stop_index}
                    onChange={e => setForm(p => ({ ...p, alight_stop_index: e.target.value }))}
                    required
                  >
                    {stops.slice(boardIdx + 1).map((s, i) => {
                      const realIdx = boardIdx + 1 + i
                      return <option key={realIdx} value={realIdx}>{s.name}</option>
                    })}
                  </Select>

                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={() => setShowStops(true)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                      {t('booking.view_stops')}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Payment */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('booking.payment')}</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  onClick={() => setForm(p => ({ ...p, payment_method: 'station' }))}
                  className={`flex flex-col items-center gap-2 border-2 rounded-xl py-4 px-3 cursor-pointer transition-colors ${
                    form.payment_method === 'station'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('booking.pay_station')}</span>
                  <span className="text-xs text-slate-400">{t('booking.pay_station_hint')}</span>
                </div>
                <div className="flex flex-col items-center gap-2 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-4 px-3 opacity-50 cursor-not-allowed">
                  <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-300">{t('booking.pay_online')}</span>
                  <span className="text-xs text-amber-500 font-semibold">{t('booking.pay_online_hint')}</span>
                </div>
              </div>
              <Button type="submit" className="w-full" size="xl" loading={submitting}>
                {t('booking.confirm')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Stops modal */}
      <Modal open={showStops} onClose={() => setShowStops(false)} title={t('booking.view_stops')}>
        <div className="space-y-0">
          {stops.map((stop, i) => {
            const arrival   = departure.add(Math.round(stop.time_to_arrive * 60), 'minute')
            const isCurrent = (busLocation?.current_stop_index ?? 0) === i
            const isPast    = (busLocation?.current_stop_index ?? 0) > i
            return (
              <div key={i} className="flex items-start gap-3 pb-3">
                <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    isCurrent ? 'bg-blue-600 ring-2 ring-blue-200' :
                    isPast    ? 'bg-slate-300' :
                    'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}>
                    {isPast && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                  </div>
                  {i < stops.length - 1 && <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mt-1"/>}
                </div>
                <div className="flex-1 flex items-start justify-between pb-1">
                  <div>
                    <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600 dark:text-blue-400' : isPast ? 'text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                      {stop.name}
                      {isCurrent && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">{t('map.now_here')}</span>}
                    </p>
                    <p className="text-xs text-slate-400">{stop.distance} km</p>
                  </div>
                  <p className="text-xs text-slate-500 ml-2">{arrival.format('h:mm A')}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}