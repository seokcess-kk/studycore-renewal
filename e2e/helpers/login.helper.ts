import { type Page, expect } from "@playwright/test";

export interface StaffCredentials {
  username: string;
  password: string;
}

/**
 * 스태프 로그인 수행
 */
export async function loginAsStaff(page: Page, credentials: StaffCredentials) {
  await page.goto("/login", { waitUntil: "networkidle" });

  // Staff 로그인 버튼이 렌더링될 때까지 대기 (hydration 완료)
  const staffBtn = page.getByText("Staff 로그인");
  await staffBtn.waitFor({ state: "visible", timeout: 15000 });
  await staffBtn.click();

  // 폼이 열릴 때까지 대기
  await page.waitForSelector("#staff-username", { state: "visible", timeout: 5000 });

  // 폼 입력
  await page.fill("#staff-username", credentials.username);
  await page.fill("#staff-password", credentials.password);

  // Staff 폼 내부의 submit 버튼 클릭 + API 응답 대기
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes("/api/auth/staff-login"),
      { timeout: 15000 }
    ),
    page.locator("form button[type='submit']").click(),
  ]);

  // API 응답 확인
  if (!response.ok()) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`로그인 실패 (${response.status()}): ${body.error || "알 수 없는 에러"}`);
  }

  // 로그인 성공 대기 (window.location.href 사용하므로 full navigation)
  await page.waitForURL(/\/(admin)?$/, { timeout: 20000 });
}

/**
 * 환경변수에서 스태프 계정 정보 읽기
 */
export function getStaffCredentials(
  role: "admin" | "mentor" | "assistant"
): StaffCredentials | null {
  const prefix = `TEST_${role.toUpperCase()}`;
  const username = process.env[`${prefix}_USERNAME`];
  const password = process.env[`${prefix}_PASSWORD`];

  if (!username || !password) return null;
  return { username, password };
}

/**
 * 로그아웃 수행
 */
export async function logout(page: Page) {
  // 마이페이지 또는 네비게이션에서 로그아웃 버튼 클릭
  await page.goto("/my");
  const logoutBtn = page.getByText("로그아웃");
  if (await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await logoutBtn.click();
    await page.waitForURL("/", { timeout: 10000 });
  }
}

/**
 * 현재 로그인 상태 확인
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  await page.goto("/");
  // nav에 로그아웃이나 마이페이지 링크가 보이면 로그인 상태
  const myLink = page.getByRole("link", { name: /마이페이지|MY/ });
  return myLink.isVisible({ timeout: 3000 }).catch(() => false);
}
