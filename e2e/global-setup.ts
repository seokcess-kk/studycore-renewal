import { chromium, type FullConfig } from "@playwright/test";
import { loginAsStaff, getStaffCredentials } from "./helpers/login.helper";
import { createTestAdminClient } from "./helpers/supabase.helper";
import fs from "fs";

const AUTH_DIR = "./e2e/.auth";

/**
 * 서버 접근 가능 여부 확인
 */
async function waitForServer(url: string, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // 연결 실패 — 재시도
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

/**
 * 모든 테스트 계정의 로그인 잠금 해제
 */
async function unlockAllAccounts() {
  try {
    const supabase = createTestAdminClient();
    const usernames = ["admin", "mentor", "staff"];
    for (const username of usernames) {
      await supabase.rpc("unlock_account", { p_username: username });
    }
    console.log("계정 잠금 해제 완료");
  } catch (e) {
    console.warn("계정 잠금 해제 실패 (무시 가능):", (e as Error).message);
  }
}

/**
 * Global Setup: 계정 잠금 해제 → 스태프 로그인 → storageState 저장
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || "http://localhost:3000";

  // auth 디렉터리 생성
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  // 1. 계정 잠금 해제 (이전 테스트에서 잠긴 경우)
  await unlockAllAccounts();

  // 2. 서버 대기
  const serverReady = await waitForServer(baseURL);
  if (!serverReady) {
    console.warn("dev 서버 미응답 — globalSetup skip");
    return;
  }

  // 3. 하나의 브라우저에서 순차적으로 로그인
  const browser = await chromium.launch();

  const roles = ["admin", "mentor", "assistant"] as const;
  for (const role of roles) {
    const creds = getStaffCredentials(role);
    if (!creds) {
      console.warn(`${role} 환경변수 없음 — skip`);
      continue;
    }

    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();

    try {
      await loginAsStaff(page, creds);
      await context.storageState({ path: `${AUTH_DIR}/${role}.json` });
      console.log(`${role} 세션 저장 완료`);
    } catch (e) {
      console.warn(`${role} 로그인 실패:`, (e as Error).message);
    }

    await context.close();
  }

  await browser.close();
}

export default globalSetup;
