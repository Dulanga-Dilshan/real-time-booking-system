import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

const echo = new Echo({
  broadcaster:       'reverb',
  key:               import.meta.env.VITE_REVERB_APP_KEY,
  wsHost:            import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
  wsPort:            isLocalhost ? (import.meta.env.VITE_REVERB_PORT ?? 8080) : 80,
  wssPort:           isLocalhost ? (import.meta.env.VITE_REVERB_PORT ?? 8080) : 443,
  forceTLS:          !isLocalhost,
  disableStats:      true,
  enabledTransports: isLocalhost ? ['ws'] : ['ws', 'wss'],
})

export default echo