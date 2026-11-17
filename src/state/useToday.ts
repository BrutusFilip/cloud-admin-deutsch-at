import { useEffect, useState } from 'react'
import { localDay, msUntilNextLocalMidnight, type LocalDay } from '../domain/localDay'

/** The current local day; updates at local midnight and when the tab becomes visible again. */
export function useToday(): LocalDay {
  const [today, setToday] = useState(() => localDay(new Date()))
  useEffect(() => {
    let timer = 0
    const update = () => setToday(localDay(new Date()))
    const schedule = () => {
      timer = window.setTimeout(() => {
        update()
        schedule()
      }, msUntilNextLocalMidnight(new Date()) + 1000)
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') update()
    }
    schedule()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', update)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', update)
    }
  }, [])
  return today
}
