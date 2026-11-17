import { expect, it } from 'vitest'
import { APP_VERSION } from './version'

const files = import.meta.glob('/package.json', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

it('APP_VERSION matches package.json', () => {
  const pkg = JSON.parse(Object.values(files)[0] ?? '{}') as { version?: string }
  expect(APP_VERSION).toBe(pkg.version)
})
