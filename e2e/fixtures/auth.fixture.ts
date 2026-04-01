/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, type Page } from "@playwright/test";
import { loginAsStaff, getStaffCredentials } from "../helpers/login.helper";

/**
 * 인증 상태가 포함된 테스트 픽스처
 */
type AuthFixtures = {
  adminPage: Page;
  mentorPage: Page;
  assistantPage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const credentials = getStaffCredentials("admin");
    if (!credentials) {
      throw new Error("TEST_ADMIN_USERNAME / TEST_ADMIN_PASSWORD 환경변수 필요");
    }

    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsStaff(page, credentials);
    await use(page);
    await context.close();
  },

  mentorPage: async ({ browser }, use) => {
    const credentials = getStaffCredentials("mentor");
    if (!credentials) {
      throw new Error(
        "TEST_MENTOR_USERNAME / TEST_MENTOR_PASSWORD 환경변수 필요"
      );
    }

    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsStaff(page, credentials);
    await use(page);
    await context.close();
  },

  assistantPage: async ({ browser }, use) => {
    const credentials = getStaffCredentials("assistant");
    if (!credentials) {
      throw new Error(
        "TEST_ASSISTANT_USERNAME / TEST_ASSISTANT_PASSWORD 환경변수 필요"
      );
    }

    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsStaff(page, credentials);
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
