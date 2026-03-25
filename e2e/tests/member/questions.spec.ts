import { test, expect } from "@playwright/test";

test.describe("질문방 (재원생) @p1", () => {
  test("질문 목록이 로드된다", async ({ page }) => {
    await page.goto("/questions", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toBeVisible();
  });

  test("질문 상세를 열 수 있다", async ({ page }) => {
    await page.goto("/questions", { waitUntil: "networkidle" });

    const firstQuestion = page.locator("a[href*='/questions/']").first();

    if (await firstQuestion.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstQuestion.click();
      await expect(page).toHaveURL(/\/questions\/.+/);
      await expect(page.locator("main")).toBeVisible();
    }
  });
});
