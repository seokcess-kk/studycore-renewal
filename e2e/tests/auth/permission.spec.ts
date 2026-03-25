import { test as base, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const AUTH_DIR = path.join(__dirname, "../../.auth");
const adminAuthPath = `${AUTH_DIR}/admin.json`;
const assistantAuthPath = `${AUTH_DIR}/assistant.json`;

base.describe("역할별 접근 제어 @p1", () => {
  base.describe.configure({ retries: 0 });

  base.describe("스태프 → 재원생 전용 라우트 차단", () => {
    base.skip(
      () => !fs.existsSync(adminAuthPath),
      "admin 세션 파일 없음"
    );
    base.use({ storageState: adminAuthPath });

    base("admin이 /meal 접근 시 /admin으로 리다이렉트", async ({ page }) => {
      await page.goto("/meal");
      await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    });

    base("admin이 /questions/new 접근 시 /admin으로 리다이렉트", async ({
      page,
    }) => {
      await page.goto("/questions/new");
      await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    });

    base("admin이 /reviews/write 접근 시 /admin으로 리다이렉트", async ({
      page,
    }) => {
      await page.goto("/reviews/write");
      await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    });
  });

  base.describe("assistant 접근 제한", () => {
    base.skip(
      () => !fs.existsSync(assistantAuthPath),
      "assistant 세션 파일 없음"
    );
    base.use({ storageState: assistantAuthPath });

    base("assistant가 /admin/guide 접근 가능", async ({ page }) => {
      await page.goto("/admin/guide");
      await expect(page).toHaveURL(/\/admin\/guide/, { timeout: 10000 });
    });

    base("assistant가 /admin/members 접근 시 홈으로 리다이렉트", async ({
      page,
    }) => {
      await page.goto("/admin/members");
      await expect(page).toHaveURL("/", { timeout: 10000 });
    });
  });
});
