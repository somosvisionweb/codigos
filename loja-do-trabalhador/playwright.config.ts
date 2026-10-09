import { defineConfig, devices } from '@playwright/test';

// Rodar com: npm run test:e2e (sobe os emuladores e o servidor de desenvolvimento).
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  reporter: [['list']],
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], browserName: 'chromium' } },
  ],
  webServer: {
    command: 'npm run dev:emu',
    url: 'http://127.0.0.1:4321/robots.txt',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
