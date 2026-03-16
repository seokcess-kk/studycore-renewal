import { test, expect } from "@playwright/test";

test.describe("페이지 네비게이션", () => {
  test("홈페이지가 정상적으로 로드된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByText("STUDYCORE").first()).toBeVisible();
  });

  test("상담 신청 페이지가 로드된다", async ({ page }) => {
    await page.goto("/consult");
    await expect(page.getByText("상담 신청").first()).toBeVisible();
  });

  test("로그인 페이지가 로드된다", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("로그인").first()).toBeVisible();
  });

  test("비로그인 사용자가 보호 페이지 접근 시 로그인으로 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/notices");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
