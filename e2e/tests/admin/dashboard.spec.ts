import { test, expect } from "@playwright/test";

test.describe("어드민 대시보드 @p0", () => {
  test("대시보드가 정상 로드된다", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });

    await expect(
      page.locator("main").or(page.locator("[data-testid='admin-layout']"))
    ).toBeVisible();
  });

  test("사이드바 메뉴가 표시된다", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "networkidle" });

    const menuTexts = ["회원 관리", "공지 관리", "질문 관리"];
    for (const text of menuTexts) {
      await expect(
        page.getByText(text, { exact: false }).first()
      ).toBeVisible({ timeout: 10000 });
    }
  });
});
