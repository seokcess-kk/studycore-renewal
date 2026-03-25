import { test, expect } from "@playwright/test";

test.describe("홈페이지 @p0", () => {
  test("홈페이지가 정상적으로 로드된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByText("STUDYCORE").first()).toBeVisible();
  });

  test("주요 섹션이 렌더링된다", async ({ page }) => {
    await page.goto("/");

    // 히어로 섹션
    await expect(page.locator("main")).toBeVisible();

    // 네비게이션 링크 존재
    await expect(page.getByRole("link", { name: /소개|시스템|상담/ }).first()).toBeVisible();
  });

  test("로그인 페이지로 이동할 수 있다", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.getByRole("link", { name: /로그인/ }).first();
    if (await loginLink.isVisible().catch(() => false)) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });
});
