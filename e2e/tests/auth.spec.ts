import { test, expect } from "@playwright/test";

test.describe("스태프 로그인", () => {
  test("올바른 계정으로 로그인하면 홈으로 이동한다", async ({ page }) => {
    await page.goto("/login");

    // Staff 탭 선택
    await page.click("text=Staff");

    await page.fill('[name="username"]', "admin");
    await page.fill('[name="password"]', "studycore12#");
    await page.click('button[type="submit"]');

    // 로그인 성공 → 홈 또는 관리자 페이지로 이동
    await expect(page).toHaveURL(/\/(admin)?$/, { timeout: 10000 });
  });

  test("잘못된 비밀번호는 에러 메시지를 표시한다", async ({ page }) => {
    await page.goto("/login");

    await page.click("text=Staff");
    await page.fill('[name="username"]', "admin");
    await page.fill('[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(
      page.getByText("올바르지 않습니다").or(page.getByText("실패"))
    ).toBeVisible({ timeout: 10000 });
  });
});
