"export default function MapPage(){return null}" 
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getBus } from '@/api/tracking'
import { useEchoChannel } from '@/hooks/useEcho'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const BUS_ICON = L.divIcon({
  className: '',
  html: `<div style="background:#2563eb;color:white;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 10px rgba(37,99,235,0.5);border:2px solid white">🚌</div>`,
  iconSize: [38, 38], iconAnchor: [19, 19],
})

const USER_ICON = L.divIcon({
  className: '',
  html: `<div style="background:#10b981;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 1px 6px rgba(16,185,129,0.7)"></div>`,
  iconSize: [16, 16], iconAnchor: [8, 8],
})

function makeStopIcon(isEnd) {
  const color = isEnd ? '#1e40af' : '#64748b'
  const size  = isEnd ? 14 : 10
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [size, size], iconAnchor: [size/2, size/2],
  })
}

function PanToBus({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.panTo(position, { animate: true, duration: 1 })
  }, [position])
  return null
}

export default function MapPage() {
  const { t }       = useTranslation()
  const { routeId } = useParams()
  const today       = dayjs().format('YYYY-MM-DD')

  const [bus, setBus]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [userPos, setUserPos]   = useState(null)
  const [routeLine, setRouteLine] = useState([])

  useEffect(() => {
    getBus(routeId)
      .then(res => {
        setBus(res.data.bus)
        drawRoute(res.data.bus.stops ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [routeId])

  const drawRoute = async (stops) => {
    const coords = stops.filter(s => s.lat && s.lng)
    if (coords.length < 2) return
    const CHUNK = 10
    const lines = []
    for (let i = 0; i < coords.length - 1; i += CHUNK - 1) {
      const chunk = coords.slice(i, i + CHUNK)
      const wp    = chunk.map(s => `${s.lng},${s.lat}`).join(';')
      try {
        const res  = await fetch(`https://router.project-osrm.org/route/v1/driving/${wp}?overview=full&geometries=geojson`)
        const data = await res.json()
        if (data.routes?.[0]?.geometry?.coordinates) {
          lines.push(...data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]))
        }
      } catch {
        lines.push(...chunk.map(s => [s.lat, s.lng]))
      }
    }
    setRouteLine(lines)
  }

  useEchoChannel(`bus-location.${routeId}.${today}`, '.BusLocationUpdated', (e) => {
    setBus(prev => prev ? {
      ...prev,
      current_stop_index: e.current_stop_index,
      current_stop:       prev.stops?.[e.current_stop_index],
      latitude:           e.latitude,
      longitude:          e.longitude,
    } : prev)
  })

  const locateMe = () => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      ()  => alert('Could not get your location')
    )
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg"/></div>
  if (!bus)    return <div className="text-center py-24 text-slate-500">Bus not found</div>

  const stops      = bus.stops ?? []
  const currentIdx = bus.current_stop_index ?? 0
  const busPos     = bus.latitude && bus.longitude
    ? [bus.latitude, bus.longitude]
    : stops[currentIdx] ? [stops[currentIdx].lat, stops[currentIdx].lng] : null
  const center     = busPos ?? [7.8731, 80.7718]
  const departure  = dayjs(`1970-01-01T${bus.departure_time}`)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            {bus.from_location} → {bus.to_location}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {bus.bus_number && (
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mr-2">
                {bus.bus_number}
              </span>
            )}
            {t('map.title')} · {dayjs().format('ddd, DD MMM YYYY')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={locateMe}>
            📍 {t('map.locate_me')}
          </Button>
          <Link to={-1}>
            <Button variant="secondary" size="sm">{t('map.back')}</Button>
          </Link>
        </div>
      </div>

      {/* Status bar */}
      <Card className="px-5 py-3 mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"/>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('map.currently_at')}: <span className="text-blue-600 dark:text-blue-400 font-semibold">{bus.current_stop?.name ?? '—'}</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"/>
            {t('map.bus')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/>
            {t('map.you')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"/>
            {t('map.stops')}
          </span>
        </div>
      </Card>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm mb-4" style={{ height: 520 }}>
        <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {routeLine.length > 0 && (
            <Polyline positions={routeLine} color="#2563eb" weight={5} opacity={0.75}/>
          )}

          {stops.map((stop, i) => {
            if (!stop.lat || !stop.lng) return null
            const isEnd     = i === 0 || i === stops.length - 1
            const isCurrent = currentIdx === i
            const arrival   = departure.add(Math.round(stop.time_to_arrive * 60), 'minute')

            return (
              <Marker key={i} position={[stop.lat, stop.lng]} icon={makeStopIcon(isEnd)}>
                {(isEnd || isCurrent) && (
                  <Tooltip permanent direction="top" offset={[0, -8]} className="busbook-tooltip">
                    <span className={isCurrent ? 'text-blue-600 font-bold' : 'font-semibold'}>
                      {stop.name}{isCurrent ? ' ★' : ''}
                    </span>
                  </Tooltip>
                )}
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>{stop.name}</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>📍 {stop.distance} km from start</p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>🕐 ~{arrival.format('h:mm A')}</p>
                    {i === 0 && <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>🚌 {t('map.starting_point')}</p>}
                    {i === stops.length - 1 && <p style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, marginTop: 4 }}>🏁 {t('map.final_destination')}</p>}
                    {isCurrent && <p style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, marginTop: 4 }}>📍 {t('map.now_here')}</p>}
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {busPos && (
            <>
              <Marker position={busPos} icon={BUS_ICON} zIndexOffset={1000}>
                <Popup><strong>🚌 {bus.from_location} → {bus.to_location}</strong><br/>At {bus.current_stop?.name}</Popup>
              </Marker>
              <PanToBus position={busPos}/>
            </>
          )}

          {userPos && (
            <Marker position={userPos} icon={USER_ICON}>
              <Popup><strong>You are here</strong></Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Stop list */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('map.all_stops')}</p>
          {bus.bus_number && (
            <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {bus.bus_number}
            </span>
          )}
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {stops.map((stop, i) => {
            const arrival   = departure.add(Math.round(stop.time_to_arrive * 60), 'minute')
            const isCurrent = currentIdx === i
            const isPast    = currentIdx > i
            return (
              <div key={i} className={`px-5 py-3 flex items-center justify-between ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    isCurrent ? 'bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-800' :
                    isPast    ? 'bg-slate-300 dark:bg-slate-600' :
                    'border-2 border-slate-300 dark:border-slate-600'
                  }`}/>
                  <div>
                    <p className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-700 dark:text-blue-400' :
                      isPast    ? 'text-slate-400 dark:text-slate-500' :
                      'text-slate-800 dark:text-white'
                    }`}>
                      {stop.name}
                      {isCurrent && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          {t('map.now_here')}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">{stop.distance} km</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{arrival.format('h:mm A')}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}