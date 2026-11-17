import { describe, expect, it } from 'vitest'
import { entryReturn, interviewHash, parseHash, rememberDictionaryHash, setEntryReturn } from './router'

describe('hash routes', () => {
  it('knows the interview, an interview session and the settings', () => {
    expect(parseHash('#/pohovor')).toEqual({ name: 'interview' })
    expect(parseHash(interviewHash('vpn-incident'))).toEqual({ name: 'interviewSession', id: 'vpn-incident' })
    expect(parseHash('#/nastaveni')).toEqual({ name: 'settings' })
  })

  it('keeps the earlier routes and sends unknown addresses to Today', () => {
    expect(parseHash('')).toEqual({ name: 'today' })
    expect(parseHash('#/lekce')).toEqual({ name: 'lesson' })
    expect(parseHash('#/slovnik/access-v-001')).toEqual({ name: 'entry', id: 'access-v-001' })
    expect(parseHash('#/neznamo')).toEqual({ name: 'today' })
  })

  it('keeps a malformed escape in the address as typed instead of throwing', () => {
    expect(parseHash('#/slovnik/%E0%A4%A')).toEqual({ name: 'entry', id: '%E0%A4%A' })
    expect(parseHash('#/pohovor/%')).toEqual({ name: 'interviewSession', id: '%' })
    expect(parseHash('#/slovnik/m365-s-002%')).toEqual({ name: 'entry', id: 'm365-s-002%' })
    expect(parseHash('#/slovnik?q=%E0')).toMatchObject({ name: 'dictionary' })
  })

  it('leads a dictionary entry back to the interview until the dictionary is visited', () => {
    setEntryReturn(interviewHash('vpn-incident'))
    expect(entryReturn()).toBe('#/pohovor/vpn-incident')
    rememberDictionaryHash('#/slovnik?q=vpn')
    expect(entryReturn()).toBeNull()
  })
})
