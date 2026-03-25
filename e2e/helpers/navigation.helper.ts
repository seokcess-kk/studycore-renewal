import { type Page, expect } from "@playwright/test";

/**
 * 페이지 로드 후 주요 요소 대기
 */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  // Zustand store 초기화 대기 — 로딩 스피너가 사라질 때까지
  const spinner = page.locator('[data-testid="loading-spinner"]');
  if (await spinner.isVisible({ timeout: 1000 }).catch(() => false)) {
    await spinner.waitFor({ state: "hidden", timeout: 10000 });
  }
}

/**
 * 페이지가 특정 URL로 리다이렉트되었는지 확인
 */
export async function expectRedirectTo(page: Page, urlPattern: RegExp) {
  await expect(page).toHaveURL(urlPattern, { timeout: 10000 });
}

/**
 * Nav가 정상적으로 렌더링되었는지 확인
 */
export async function expectNavVisible(page: Page) {
  await expect(page.locator("nav")).toBeVisible();
}

/**
 * 토스트 메시지 확인
 */
export async function expectToast(page: Page, text: string | RegExp) {
  const toast =
    typeof text === "string"
      ? page.getByText(text)
      : page.locator(`text=${text.source}`);
  await expect(toast).toBeVisible({ timeout: 5000 });
}

/**
 * 모바일 뷰포트 설정
 */
export async function setMobileViewport(page: Page) {
  await page.setViewportSize({ width: 375, height: 812 });
}

/**
 * 데스크탑 뷰포트 설정
 */
export async function setDesktopViewport(page: Page) {
  await page.setViewportSize({ width: 1280, height: 800 });
}
