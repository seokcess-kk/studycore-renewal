import { cleanupAllTestData } from "./fixtures/test-data.fixture";

/**
 * Global Teardown: E2E 테스트 데이터 정리
 */
async function globalTeardown() {
  try {
    await cleanupAllTestData();
    console.log("E2E 테스트 데이터 정리 완료");
  } catch (e) {
    console.warn("테스트 데이터 정리 실패 (무시 가능):", e);
  }
}

export default globalTeardown;
