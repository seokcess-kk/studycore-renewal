import { test, expect } from "@playwright/test";

test.describe("마이페이지 @p1", () => {
  test("마이페이지가 로드된다", async ({ page }) => {
    await page.goto("/my", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toBeVisible();
  });

  test("프로필 정보가 표시된다", async ({ page }) => {
    await page.goto("/my", { waitUntil: "networkidle" });

    await expect(
      page.getByText(/프로필|이름|역할/).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
