import { test, expect } from "@playwright/test";

test.describe("공개 페이지 네비게이션 @p0", () => {
  test("상담 신청 페이지가 로드된다", async ({ page }) => {
    await page.goto("/consult");
    await expect(page.getByText("상담 신청").first()).toBeVisible();
  });

  test("로그인 페이지가 로드된다", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("로그인").first()).toBeVisible();
  });

  test("소개 페이지가 로드된다", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("main")).toBeVisible();
  });

  test("블로그 페이지가 로드된다", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("main")).toBeVisible();
  });

  test("시스템 페이지가 로드된다", async ({ page }) => {
    await page.goto("/system");
    await expect(page.locator("main")).toBeVisible();
  });

  test("후기 페이지가 로드된다", async ({ page }) => {
    await page.goto("/reviews");
    await expect(page.locator("main")).toBeVisible();
  });
});
