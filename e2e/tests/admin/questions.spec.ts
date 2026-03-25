import { test, expect } from "@playwright/test";

test.describe("질문 관리 @p0", () => {
  test("질문 목록 페이지가 로드된다", async ({ page }) => {
    await page.goto("/admin/questions", { waitUntil: "networkidle" });
    await expect(page.locator("main")).toBeVisible();
  });

  test("질문 상세 페이지에서 답변 영역이 보인다", async ({ page }) => {
    await page.goto("/admin/questions", { waitUntil: "networkidle" });

    const firstQuestion = page
      .locator(
        "tr a, [data-testid='question-item'], a[href*='/admin/questions/']"
      )
      .first();

    if (await firstQuestion.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstQuestion.click();
      await page.waitForLoadState("networkidle");

      await expect(
        page
          .getByText("답변")
          .or(page.locator(".tiptap, [contenteditable='true']"))
          .first()
      ).toBeVisible({ timeout: 10000 });
    }
  });
});
