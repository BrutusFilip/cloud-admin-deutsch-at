import { defineConfig } from 'vitest/config'

// Tests build dates with local-time constructors, so they pass in any time zone.
// A fixed zone with daylight saving time keeps the midnight tests realistic.
process.env.TZ = 'Europe/Prague'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
