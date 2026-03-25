import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const AUTH_DIR = path.join(__dirname, "../../.auth");
const adminAuthPath = `${AUTH_DIR}/admin.json`;

test.describe("스태프 로그인 @p0", () => {
  // 잠금 방지: retry 비활성화
  test.describe.configure({ retries: 0 });

  test("globalSetup에서 admin 로그인이 성공했다", async () => {
    // globalSetup에서 storageState가 생성되었는지 확인
    expect(fs.existsSync(adminAuthPath)).toBe(true);
  });

  test("admin storageState로 어드민 페이지 접근이 가능하다", async ({
    browser,
  }) => {
    test.skip(!fs.existsSync(adminAuthPath), "admin 세션 파일 없음");

    const context = await browser.newContext({
      storageState: adminAuthPath,
    });
    const page = await context.newPage();

    await page.goto("/admin", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toBeVisible();
    // /login으로 리다이렉트되지 않아야 함
    expect(page.url()).not.toContain("/login");

    await context.close();
  });

  test("로그인 폼이 빈 상태로 제출 시 유효성 검사 에러", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });

    const staffBtn = page.getByText("Staff 로그인");
    await staffBtn.waitFor({ state: "visible", timeout: 15000 });
    await staffBtn.click();
    await page.waitForSelector("#staff-username", {
      state: "visible",
      timeout: 5000,
    });

    await page.locator("form button[type='submit']").click();
    await expect(page).toHaveURL(/\/login/);
  });
});
