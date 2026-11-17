import { describe, expect, it } from 'vitest'
import { CHALLENGES } from '../content'
import { cs } from './cs'
import { de, STAGES_DE } from './de'

/** Strings that are the same in both interfaces on purpose. */
const SAME = new Set(['appName', 'language.cs', 'language.de', 'language.short.cs', 'language.short.de', 'verdict.self', 'challenge.situation', 'feedback.plural', 'settings.testText', 'settings.exportTitle', 'settings.importTitle', 'interview.step.situation'])

function strings(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]]
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}.${i}`))
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k))
  return []
}

describe('German interface', () => {
  it('translates every Czech interface text', () => {
    const czech = new Map(strings(cs))
    const untranslated = strings(de).filter(([path, text]) => !SAME.has(path) && czech.get(path) === text)
    expect(untranslated).toEqual([])
  })

  it('has the same structure as the Czech interface', () => {
    expect(strings(de).map(([path]) => path)).toEqual(strings(cs).map(([path]) => path))
  })

  it('names every challenge stage and shows German titles', () => {
    const stages = CHALLENGES.flatMap((c) => c.steps.map((s) => s.stageCz))
    expect(stages.filter((stage) => !STAGES_DE[stage])).toEqual([])
    expect(de.title({ titleCz: 'Sítě a VPN', titleDe: 'Netzwerk & VPN' })).toBe('Netzwerk & VPN')
    expect(de.subtitle({ titleCz: 'Sítě a VPN', titleDe: 'Netzwerk & VPN' })).toBeNull()
    expect(cs.subtitle({ titleCz: 'Sítě a VPN', titleDe: 'Netzwerk & VPN' })).toBe('Netzwerk & VPN')
  })

  it('keeps Czech as the default and German as an option', () => {
    expect(cs.htmlLang).toBe('cs')
    expect(de.htmlLang).toBe('de-AT')
    expect(de.locale).toBe('de-AT')
  })
})
