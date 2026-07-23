import { useEffect, useRef } from 'react'
import echo from '@/lib/echo'

export function useEchoChannel(channelName, eventName, callback) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!channelName || !eventName) return

    const channel = echo.channel(channelName)
    channel.listen(eventName, (data) => callbackRef.current(data))

    return () => {
      echo.leaveChannel(channelName)
    }
  }, [channelName, eventName])
}