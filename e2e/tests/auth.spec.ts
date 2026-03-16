import { test, expect } from "@playwright/test";

const TEST_USERNAME = process.env.TEST_ADMIN_USERNAME || "admin";
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "";

test.describe("스태프 로그인", () => {
  test.skip(!TEST_PASSWORD, "TEST_ADMIN_PASSWORD 환경변수가 설정되지 않음");

  test("올바른 계정으로 로그인하면 홈으로 이동한다", async ({ page }) => {
    await page.goto("/login");

    await page.click("text=Staff");
    await page.fill('[name="username"]', TEST_USERNAME);
    await page.fill('[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(admin)?$/, { timeout: 10000 });
  });

  test("잘못된 비밀번호는 에러 메시지를 표시한다", async ({ page }) => {
    await page.goto("/login");

    await page.click("text=Staff");
    await page.fill('[name="username"]', TEST_USERNAME);
    await page.fill('[name="password"]', "wrongpassword123");
    await page.click('button[type="submit"]');

    await expect(
      page.getByText("올바르지 않습니다").or(page.getByText("실패"))
    ).toBeVisible({ timeout: 10000 });
  });
});
