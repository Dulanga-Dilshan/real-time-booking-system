import { useEffect, useRef } from 'react'
import { getEcho } from '@/lib/echo'

export function useEchoChannel(channelName, eventName, callback) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!channelName || !eventName) return

    let echo
    let cancelled = false

    getEcho()
      .then((instance) => {
        if (cancelled || !instance) return
        echo = instance
        try {
          echo.channel(channelName).listen(eventName, (data) => callbackRef.current(data))
        } catch (err) {
          console.log('Echo channel subscribe failed:', err)
        }
      })
      .catch((err) => {
        console.log('getEcho() rejected:', err)
      })

    return () => {
      cancelled = true
      if (echo) {
        try { echo.leaveChannel(channelName) } catch (e) {}
      }
    }
  }, [channelName, eventName])
}