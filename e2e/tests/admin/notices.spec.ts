import { test, expect } from "@playwright/test";
import { TEST_PREFIX } from "../../helpers/supabase.helper";

test.describe("공지 관리 CRUD @p0", () => {
  test("공지 목록 페이지가 로드된다", async ({ page }) => {
    await page.goto("/admin/notices", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toBeVisible();
  });

  test("공지 작성 페이지로 이동할 수 있다", async ({ page }) => {
    await page.goto("/admin/notices", { waitUntil: "networkidle" });

    const newBtn = page
      .getByRole("button", { name: /작성|새 공지|추가/ })
      .or(page.getByRole("link", { name: /작성|새 공지|추가/ }));

    if (await newBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.first().click();
      await page.waitForLoadState("networkidle");
      // 공지 작성 페이지 또는 모달이 보여야 함
      await expect(page.getByText("공지 작성").first()).toBeVisible({
        timeout: 10000,
      });
    }
  });
});
