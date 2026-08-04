import EchoModule from 'laravel-echo'
import PusherModule from 'pusher-js/react-native'
import { getReverbConfig } from '@/config/server'

const Echo = EchoModule?.Echo ?? EchoModule?.default ?? EchoModule
const Pusher = PusherModule?.Pusher ?? PusherModule?.default ?? PusherModule

global.Pusher = Pusher

let echoInstance = null

export async function getEcho() {
  if (echoInstance) return echoInstance

  if (typeof Echo !== 'function' || typeof Pusher !== 'function') {
    console.log('Echo or Pusher did not resolve to a constructable class — skipping realtime setup.')
    return null
  }

  try {
    const cfg = await getReverbConfig()

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: cfg.key,
      wsHost: cfg.wsHost,
      wsPort: cfg.wsPort,
      wssPort: cfg.wssPort,
      forceTLS: cfg.forceTLS,
      enabledTransports: cfg.enabledTransports,
      disableStats: true,
    })

    echoInstance.connector.pusher.connection.bind('error', (err) => {
      console.log('Echo/Pusher connection error:', err?.error?.message ?? err)
    })
    echoInstance.connector.pusher.connection.bind('state_change', (states) => {
      console.log('Echo/Pusher state:', states.previous, '->', states.current)
    })

    return echoInstance
  } catch (err) {
    console.log('Failed to create Echo instance:', err)
    return null
  }
}

export function resetEcho() {
  if (echoInstance) {
    try { echoInstance.disconnect() } catch (e) {}
  }
  echoInstance = null
}