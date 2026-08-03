import Echo from 'laravel-echo'
import Pusher from 'pusher-js/react-native'
import { getReverbConfig } from '@/config/server'

global.Pusher = Pusher

let echoInstance = null

export async function getEcho() {
  if (echoInstance) return echoInstance

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

  return echoInstance
}

export function resetEcho() {
  if (echoInstance) {
    try {
      echoInstance.disconnect()
    } catch (e) {
      // ignore
    }
  }
  echoInstance = null
}