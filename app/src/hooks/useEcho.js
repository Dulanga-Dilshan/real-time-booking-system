import { useEffect, useRef } from 'react'
import { getEcho } from '@/lib/echo'

export function useEchoChannel(channelName, eventName, callback) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!channelName || !eventName) return

    let echo
    let cancelled = false

    getEcho().then((instance) => {
      if (cancelled) return
      echo = instance
      echo.channel(channelName).listen(eventName, (data) => callbackRef.current(data))
    })

    return () => {
      cancelled = true
      if (echo) echo.leaveChannel(channelName)
    }
  }, [channelName, eventName])
}