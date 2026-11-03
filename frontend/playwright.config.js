// Playwright — smoke E2E del frontend contra `vite preview` con la API interceptada
// (page.route): no hay backend, BD ni red. Ver e2e/support/mockApi.js.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const ORIGIN = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: ORIGIN,
    trace: 'retain-on-failure',
    locale: 'es-BO',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // El API base se fija en build hacia el mismo origen del preview: las llamadas son
    // same-origin y page.route las intercepta sin CORS.
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: ORIGIN,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      VITE_API_BASE_URL: `${ORIGIN}/api`,
      VITE_API_URL: `${ORIGIN}/api/v1`,
    },
  },
});
