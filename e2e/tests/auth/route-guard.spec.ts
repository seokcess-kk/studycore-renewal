import { test, expect } from "@playwright/test";

test.describe("라우트 보호 @p0", () => {
  test("비로그인 사용자가 /notices 접근 시 /login으로 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/notices");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("비로그인 사용자가 /questions 접근 시 /login으로 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/questions");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("비로그인 사용자가 /meal 접근 시 /login으로 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/meal");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("비로그인 사용자가 /my 접근 시 /login으로 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/my");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("비로그인 사용자가 /admin 접근 시 /login으로 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("비로그인 사용자가 /manual 접근 시 /login으로 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/manual");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("리다이렉트 URL에 원래 경로가 포함된다", async ({ page }) => {
    await page.goto("/notices");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fnotices/, {
      timeout: 10000,
    });
  });
});
