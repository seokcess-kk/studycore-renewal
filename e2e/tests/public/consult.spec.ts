import { test, expect } from "@playwright/test";

test.describe("상담 신청 @p0", () => {
  test("비로그인 사용자가 상담을 신청할 수 있다", async ({ page }) => {
    await page.goto("/consult", { waitUntil: "networkidle" });

    await page.fill("#consult-name", "테스트");
    await page.fill("#consult-phone", "01012345678");
    await page.selectOption("#consult-type", "admission");
    await page.fill("#consult-message", "E2E 테스트 문의입니다.");
    await page.click('button[type="submit"]');

    await expect(
      page.getByText("신청이 완료").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("필수 필드 미입력 시 제출이 차단된다", async ({ page }) => {
    await page.goto("/consult", { waitUntil: "networkidle" });

    await page.click('button[type="submit"]');

    // 페이지가 이동하지 않아야 함
    await expect(page).toHaveURL(/\/consult/);
  });
});
