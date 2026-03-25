import { createClient } from "@supabase/supabase-js";

/**
 * E2E 테스트용 Supabase Admin Client
 * RLS를 우회하여 테스트 데이터를 생성/정리할 때 사용
 */
export function createTestAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "E2E 테스트에 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * 테스트 데이터 prefix — 프로덕션 데이터와 구분
 */
export const TEST_PREFIX = "[E2E]";

/**
 * prefix가 붙은 테스트 데이터 정리
 */
export async function cleanupTestData(table: string, column = "title") {
  const supabase = createTestAdminClient();
  await supabase.from(table).delete().like(column, `${TEST_PREFIX}%`);
}
