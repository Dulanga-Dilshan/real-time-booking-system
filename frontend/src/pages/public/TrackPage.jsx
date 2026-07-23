"export default function TrackPage(){return null}" 
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { getAllBuses } from '@/api/tracking'
import { useEchoChannel } from '@/hooks/useEcho'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'

function StopDot({ isCurrent, isPast }) {
  if (isCurrent) return (
    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center ring-4 ring-blue-100 dark:ring-blue-900/50">
      <div className="w-2 h-2 rounded-full bg-white"/>
    </div>
  )
  if (isPast) return (
    <div className="w-4 h-4 rounded-full bg-slate-400 flex items-center justify-center">
      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
      </svg>
    </div>
  )
  return <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600"/>
}

function BusCard({ bus, today }) {
  const { t }            = useTranslation()
  const [data, setData]  = useState(bus)

  useEchoChannel(
    `bus-location.${bus.id}.${today}`,
    '.BusLocationUpdated',
    (e) => setData(prev => ({
      ...prev,
      current_stop_index: e.current_stop_index,
      current_stop: prev.stops?.[e.current_stop_index],
    }))
  )

  const stops      = data.stops ?? []
  const currentIdx = data.current_stop_index ?? 0
  const total      = stops.length

  const half    = 2
  let start     = Math.max(0, currentIdx - half)
  let end       = Math.min(total - 1, start + 4)
  start         = Math.max(0, end - 4)
  const visible = stops.slice(start, end + 1)

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 dark:bg-slate-950 text-white px-5 py-4 flex items-center justify-between">
        <div>
          {data.bus_number && (
            <p className="font-mono text-xs text-slate-400 mb-0.5">{data.bus_number}</p>
          )}
          <p className="font-bold text-lg">{data.from_location} → {data.to_location}</p>
          <p className="text-slate-400 text-xs mt-0.5">
            {t('track.currently_at')}: <span className="text-blue-400 font-semibold">{data.current_stop?.name ?? '—'}</span>
          </p>
        </div>
        <Link to={`/map/${data.id}`}>
          <Button size="sm">{t('track.view_map')}</Button>
        </Link>
      </div>

      {/* Stop strip */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-0 overflow-x-auto pb-2 mb-3">
          {start > 0 && (
            <>
              <div className="flex-shrink-0 flex flex-col items-center mr-1">
                <div className="w-2 h-2 rounded-full bg-slate-300 mt-0.5"/>
                <p className="text-xs text-slate-300 mt-1">···</p>
              </div>
              <div className="w-6 h-px bg-slate-200 dark:bg-slate-700 mt-1.5 flex-shrink-0"/>
            </>
          )}

          {visible.map((stop, vi) => {
            const idx       = start + vi
            const isCurrent = idx === currentIdx
            const isPast    = idx < currentIdx
            const isLast    = vi === visible.length - 1

            return (
              <div key={idx} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <StopDot isCurrent={isCurrent} isPast={isPast}/>
                  <p className={`text-xs mt-1.5 whitespace-nowrap max-w-16 text-center truncate ${
                    isCurrent ? 'text-blue-600 dark:text-blue-400 font-bold' :
                    isPast    ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                  }`}>{stop.name}</p>
                  {isCurrent && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full mt-1 font-medium">
                      {t('map.now_here')}
                    </span>
                  )}
                </div>
                {!isLast && (
                  <div className={`w-10 h-px mx-1 mb-5 flex-shrink-0 ${isPast ? 'bg-slate-400' : 'bg-slate-200 dark:bg-slate-700'}`}/>
                )}
              </div>
            )
          })}

          {end < total - 1 && (
            <>
              <div className="w-6 h-px bg-slate-200 dark:bg-slate-700 mt-1.5 flex-shrink-0 ml-1"/>
              <div className="flex-shrink-0 flex flex-col items-center ml-1">
                <div className="w-2 h-2 rounded-full bg-slate-300 mt-0.5"/>
                <p className="text-xs text-slate-300 mt-1">···</p>
              </div>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-1">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${total > 1 ? (currentIdx / (total - 1)) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>{stops[0]?.name}</span>
          <span>{t('track.total_km', { km: stops[total - 1]?.distance ?? 0 })}</span>
          <span>{stops[total - 1]?.name}</span>
        </div>
      </div>
    </Card>
  )
}

export default function TrackPage() {
  const { t }               = useTranslation()
  const [buses, setBuses]   = useState([])
  const [loading, setLoading] = useState(true)
  const today               = dayjs().format('YYYY-MM-DD')

  useEffect(() => {
    getAllBuses()
      .then(res => setBuses(res.data.buses ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg"/></div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('track.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {t('track.subtitle')} · {dayjs().format('ddd, DD MMM YYYY')}
        </p>
      </div>

      {buses.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-slate-400">{t('track.no_buses')}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {buses.map(bus => (
            <BusCard key={bus.id} bus={bus} today={today}/>
          ))}
        </div>
      )}
    </div>
  )
}