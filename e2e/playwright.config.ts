import { defineConfig, devices } from '@playwright/test'

/**
 * E2E с настоящим сервером без подмены ответов API: поднимаем Spring Boot
 * (8080) и vite dev (5173, проксирует /api). Все сценарии — одной командой
 * `mise run e2e`.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: './mvnw -q spring-boot:run',
      cwd: '../backend',
      url: 'http://localhost:8080/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
    {
      command: 'npm run dev -- --port 5173',
      cwd: '../frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
