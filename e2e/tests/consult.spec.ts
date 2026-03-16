import { test, expect } from "@playwright/test";

test.describe("상담 신청", () => {
  test("비로그인 사용자가 상담을 신청할 수 있다", async ({ page }) => {
    await page.goto("/consult");

    await page.fill('[name="name"]', "테스트");
    await page.fill('[name="phone"]', "010-1234-5678");
    await page.selectOption('[name="type"]', "admission");
    await page.fill('[name="message"]', "테스트 문의입니다.");
    await page.click('button[type="submit"]');

    await expect(
      page.getByText("신청이 완료").or(page.getByText("접수"))
    ).toBeVisible({ timeout: 10000 });
  });
});
