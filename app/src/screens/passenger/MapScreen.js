import { useEffect, useState, useRef } from 'react'
import { View, Text } from 'react-native'
import { WebView } from 'react-native-webview'
import * as Location from 'expo-location'
import dayjs from 'dayjs'
import { getBus } from '@/api/tracking'
import { useEchoChannel } from '@/hooks/useEcho'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import toast from '@/lib/toast'

function buildMapHtml(bus, stops, busPos, userPos) {
  const stopMarkers = stops
    .filter((s) => s.lat && s.lng)
    .map((s, i) => {
      const isEnd = i === 0 || i === stops.length - 1
      const color = isEnd ? '#1e40af' : '#64748b'
      const size = isEnd ? 14 : 10
      return `L.circleMarker([${s.lat}, ${s.lng}], {radius: ${size / 2}, color: 'white', weight: 2, fillColor: '${color}', fillOpacity: 1}).addTo(map).bindPopup(${JSON.stringify(s.name)});`
    })
    .join('\n')

  const line = stops
    .filter((s) => s.lat && s.lng)
    .map((s) => `[${s.lat}, ${s.lng}]`)
    .join(',')

  const busMarker = busPos
    ? `L.marker([${busPos.latitude}, ${busPos.longitude}], {
        icon: L.divIcon({ className: '', html: '<div style="background:#2563eb;color:white;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 10px rgba(37,99,235,0.5);border:2px solid white">🚌</div>', iconSize:[38,38], iconAnchor:[19,19] })
      }).addTo(map).bindPopup(${JSON.stringify(`${bus.from_location} → ${bus.to_location}`)});`
    : ''

  const userMarker = userPos
    ? `L.marker([${userPos.latitude}, ${userPos.longitude}], {
        icon: L.divIcon({ className: '', html: '<div style="background:#10b981;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 1px 6px rgba(16,185,129,0.7)"></div>', iconSize:[16,16], iconAnchor:[8,8] })
      }).addTo(map).bindPopup('You are here');`
    : ''

  const center = busPos ?? (stops[0] ? { latitude: stops[0].lat, longitude: stops[0].lng } : { latitude: 7.8731, longitude: 80.7718 })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html,body,#map{height:100%;margin:0;padding:0;}</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([${center.latitude}, ${center.longitude}], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    ${line ? `L.polyline([${line}], {color: '#2563eb', weight: 5, opacity: 0.75}).addTo(map);` : ''}
    ${stopMarkers}
    ${busMarker}
    ${userMarker}
  </script>
</body>
</html>`
}

export default function MapScreen({ route: navRoute }) {
  const { routeId } = navRoute.params
  const today = dayjs().format('YYYY-MM-DD')

  const [bus, setBus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userPos, setUserPos] = useState(null)
  const [busPos, setBusPos] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    getBus(routeId)
      .then((res) => {
        setBus(res.data.bus)
        const stops = res.data.bus.stops ?? []
        const idx = res.data.bus.current_stop_index ?? 0
        if (res.data.bus.latitude && res.data.bus.longitude) {
          setBusPos({ latitude: res.data.bus.latitude, longitude: res.data.bus.longitude })
        } else if (stops[idx]) {
          setBusPos({ latitude: stops[idx].lat, longitude: stops[idx].lng })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [routeId])

  useEchoChannel(`bus-location.${routeId}.${today}`, '.BusLocationUpdated', (e) => {
    setBus((prev) => (prev ? { ...prev, current_stop_index: e.current_stop_index, current_stop: prev.stops?.[e.current_stop_index] } : prev))
    if (e.latitude && e.longitude) {
      setBusPos({ latitude: e.latitude, longitude: e.longitude })
    }
    setReloadKey((k) => k + 1)
  })

  const locateMe = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return toast.error('Location permission denied')
    const loc = await Location.getCurrentPositionAsync({})
    setUserPos({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
    setReloadKey((k) => k + 1)
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </View>
    )
  }
  if (!bus) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Text className="text-slate-500">Bus not found</Text>
      </View>
    )
  }

  const stops = bus.stops ?? []
  const html = buildMapHtml(bus, stops, busPos, userPos)

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Card className="mx-4 mt-4 mb-3 px-5 py-3 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">
          Currently at: <Text className="text-blue-600 dark:text-blue-400 font-semibold">{bus.current_stop?.name ?? '—'}</Text>
        </Text>
        <Button title="Locate me" size="sm" variant="outline" onPress={locateMe} />
      </Card>

      <WebView key={reloadKey} originWhitelist={['*']} source={{ html }} style={{ flex: 1 }} />
    </View>
  )
}