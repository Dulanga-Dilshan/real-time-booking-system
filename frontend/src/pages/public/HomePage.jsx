import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { getRoutes } from '@/api/routes'
import { useEchoChannel } from '@/hooks/useEcho'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

function RouteCard({ route, date, onSeatsUpdate }) {
  useEchoChannel(`bus.${route.id}.${date}`, '.SeatUpdated', (data) => {
    onSeatsUpdate(route.id, route.total_seats - data.booked_seats.length)
  })

  const navigate = useNavigate()
  const { t }    = useTranslation()

  const seatColor = route.available_seats > 5
    ? 'text-emerald-600 dark:text-emerald-400'
    : route.available_seats > 0
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-500 dark:text-red-400'

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          {route.bus_number && (
            <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {route.bus_number}
            </span>
          )}
          <span className="font-semibold text-slate-800 dark:text-white">{route.from_location}</span>
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
          <span className="font-semibold text-slate-800 dark:text-white">{route.to_location}</span>
        </div>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <span className="text-slate-500 dark:text-slate-400">
            {dayjs(`1970-01-01T${route.departure_time}`).format('h:mm A')} → {dayjs(`1970-01-01T${route.arrival_time}`).format('h:mm A')}
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className={`font-medium ${seatColor}`}>
            {route.available_seats > 0
              ? t('home.seats_left', { count: route.available_seats })
              : t('home.full')}
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            LKR {Number(route.price).toLocaleString()}
          </span>
        </div>
      </div>

      {route.available_seats > 0 ? (
        <Button
          className="ml-4 flex-shrink-0"
          onClick={() => navigate(`/booking/${route.id}?date=${date}`)}
        >
          {t('home.book_seat')}
        </Button>
      ) : (
        <span className="ml-4 flex-shrink-0 text-sm text-slate-400 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl">
          {t('home.full')}
        </span>
      )}
    </div>
  )
}

export default function HomePage() {
  const { t }                           = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const today                           = dayjs().format('YYYY-MM-DD')

  const [from, setFrom]       = useState(searchParams.get('from') ?? '')
  const [to, setTo]           = useState(searchParams.get('to') ?? '')
  const [date, setDate]       = useState(searchParams.get('date') ?? today)
  const [routes, setRoutes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [searched, setSearched] = useState(false)

  const fetchRoutes = async (f, t2, d) => {
    setLoading(true)
    try {
      const params = { date: d }
      if (f)  params.from = f
      if (t2) params.to   = t2
      const res = await getRoutes(params)
      setRoutes(res.data.routes ?? [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchRoutes(
      searchParams.get('from') ?? '',
      searchParams.get('to')   ?? '',
      searchParams.get('date') ?? today
    )
    if (searchParams.get('from') || searchParams.get('to')) setSearched(true)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearched(true)
    setSearchParams({ from, to, date })
    fetchRoutes(from, to, date)
  }

  const updateSeats = (routeId, availableSeats) => {
    setRoutes(prev => prev.map(r =>
      r.id === routeId ? { ...r, available_seats: availableSeats } : r
    ))
  }

  return (
    <div>
      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{t('home.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">{t('home.subtitle')}</p>
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input placeholder={t('home.from')} value={from} onChange={e => setFrom(e.target.value)}/>
            <Input placeholder={t('home.to')}   value={to}   onChange={e => setTo(e.target.value)}/>
            <input
              type="date"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <Button type="submit" size="lg" loading={loading}>{t('home.search_btn')}</Button>
          </div>
        </form>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {searched && (from || to) ? t('home.search_results') : t('home.available_today')}
        </h2>
        <span className="text-xs text-slate-400">{dayjs(date).format('ddd, DD MMM YYYY')}</span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg"/></div>
      ) : routes.length === 0 ? (
        <Card className="text-center py-16">
          <div className="text-5xl mb-3">🚌</div>
          <p className="text-slate-500 dark:text-slate-400">{t('home.no_rides')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {routes.map(route => (
            <RouteCard
              key={route.id}
              route={route}
              date={date}
              onSeatsUpdate={updateSeats}
            />
          ))}
        </div>
      )}
    </div>
  )
}