import { test, expect } from "@playwright/test";

// 도시락 신청은 재원생(student) 전용 — 스태프 접근 불가
// 재원생 세션 주입 구현 후 활성화

test.describe("도시락 신청 (재원생) @p1", () => {
  test.skip(true, "재원생 세션 주입 구현 후 활성화");

  test("도시락 신청 페이지가 로드된다", async ({ page }) => {
    await page.goto("/meal");
    await expect(page.locator("main")).toBeVisible();
  });
});
