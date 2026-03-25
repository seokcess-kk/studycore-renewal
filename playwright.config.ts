import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

// 테스트 환경변수 로드 (.env.local → .env.test 순서, 먼저 로드된 값 우선)
dotenv.config({ path: path.resolve(__dirname, ".env.local") });
dotenv.config({ path: path.resolve(__dirname, ".env.test") });

const AUTH_DIR = path.join(__dirname, "e2e/.auth");

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  retries: 1,
  workers: 1,
  reporter: "html",

  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",

  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    actionTimeout: 10000,
  },

  expect: {
    timeout: 10000,
  },

  /* CI에서는 webServer로 자동 시작, 로컬에서는 dev 서버를 수동 실행 */
  ...(process.env.CI
    ? {
        webServer: {
          command: "npm run build && npm start",
          url: "http://localhost:3000",
          timeout: 120000,
        },
      }
    : {}),

  projects: [
    // 공개 페이지 — 인증 불필요
    {
      name: "public",
      testDir: "./e2e/tests/public",
      use: { ...devices["Desktop Chrome"] },
    },

    // 인증/권한 테스트 — storageState 사용
    {
      name: "auth",
      testDir: "./e2e/tests/auth",
      use: { ...devices["Desktop Chrome"] },
    },

    // 어드민 테스트 — admin storageState 사용
    {
      name: "admin",
      testDir: "./e2e/tests/admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: `${AUTH_DIR}/admin.json`,
      },
    },

    // 재원생 테스트 — mentor storageState 사용
    {
      name: "member",
      testDir: "./e2e/tests/member",
      use: {
        ...devices["Desktop Chrome"],
        storageState: `${AUTH_DIR}/mentor.json`,
      },
    },
  ],
});
