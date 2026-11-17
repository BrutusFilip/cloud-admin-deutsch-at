import { defineConfig, devices, type Project } from '@playwright/test'

/**
 * Browser tests of the production build under the GitHub Pages sub-path.
 *
 *   npm run test:e2e                      build, then test in Chromium (desktop and a 360 px phone)
 *   E2E_BROWSERS=chrome,firefox,webkit npm run test:e2e
 *                                         the same tests in more browsers as well; each one has to be
 *                                         installed first: npx playwright install chromium firefox webkit
 *                                         ("chrome" uses an installed Google Chrome)
 *
 * Playwright starts `vite preview` on port 4180 and reuses one that is already running (not on CI).
 */
const PORT = 4180
const BASE_PATH = '/cloud-admin-deutsch-at/'
const BASE_URL = `http://localhost:${PORT}${BASE_PATH}`
const CI = Boolean(process.env.CI)
const MOBILE = /mobile\.spec\.ts$/
const desktop = { viewport: { width: 1280, height: 900 } }

const projects: Project[] = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'], ...desktop }, testIgnore: MOBILE },
  {
    name: 'mobile',
    use: { browserName: 'chromium', viewport: { width: 360, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    testMatch: MOBILE,
  },
]

const optional: Record<string, Project[]> = {
  chrome: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], ...desktop, channel: 'chrome' }, testIgnore: MOBILE }],
  firefox: [{ name: 'firefox', use: { ...devices['Desktop Firefox'], ...desktop }, testIgnore: MOBILE }],
  webkit: [
    { name: 'webkit', use: { ...devices['Desktop Safari'], ...desktop }, testIgnore: MOBILE },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'] }, testMatch: MOBILE },
  ],
}
for (const name of (process.env.E2E_BROWSERS ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
  const extra = optional[name]
  if (!extra) throw new Error(`E2E_BROWSERS: unknown browser "${name}" (use chrome, firefox or webkit)`)
  projects.push(...extra)
}

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['list'], ['github']] : 'list',
  use: {
    baseURL: BASE_URL,
    locale: 'cs-CZ',
    timezoneId: 'Europe/Prague',
    trace: 'retain-on-failure',
  },
  projects,
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort --base ${BASE_PATH}`,
    url: BASE_URL,
    reuseExistingServer: !CI,
  },
})
