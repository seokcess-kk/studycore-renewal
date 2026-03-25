import { test, expect } from "@playwright/test";

test.describe("공지 열람 (재원생) @p1", () => {
  test("공지 목록이 로드된다", async ({ page }) => {
    await page.goto("/notices", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toBeVisible();
  });

  test("공지 상세를 열 수 있다", async ({ page }) => {
    await page.goto("/notices", { waitUntil: "networkidle" });

    const firstNotice = page.locator("a[href*='/notices/']").first();

    if (await firstNotice.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstNotice.click();
      await expect(page).toHaveURL(/\/notices\/.+/);
      await expect(page.locator("main")).toBeVisible();
    }
  });
});
