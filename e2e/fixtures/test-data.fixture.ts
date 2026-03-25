import {
  createTestAdminClient,
  TEST_PREFIX,
  cleanupTestData,
} from "../helpers/supabase.helper";

/**
 * 테스트용 공지사항 생성
 */
export async function createTestNotice(overrides: Record<string, unknown> = {}) {
  const supabase = createTestAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .insert({
      title: `${TEST_PREFIX} 테스트 공지사항`,
      content: "E2E 테스트용 공지입니다.",
      category: "general",
      is_published: true,
      ...overrides,
    })
    .select()
    .single();

  if (error) throw new Error(`공지 생성 실패: ${error.message}`);
  return data;
}

/**
 * 테스트용 공지사항 삭제
 */
export async function deleteTestNotice(id: string) {
  const supabase = createTestAdminClient();
  await supabase.from("notices").delete().eq("id", id);
}

/**
 * 테스트용 상담 신청 생성
 */
export async function createTestConsultation(
  overrides: Record<string, unknown> = {}
) {
  const supabase = createTestAdminClient();
  const { data, error } = await supabase
    .from("consultations")
    .insert({
      name: `${TEST_PREFIX} 테스트`,
      phone: "010-0000-0000",
      type: "admission",
      message: "E2E 테스트용 상담 신청",
      status: "new",
      ...overrides,
    })
    .select()
    .single();

  if (error) throw new Error(`상담 생성 실패: ${error.message}`);
  return data;
}

/**
 * 테스트용 상담 신청 삭제
 */
export async function deleteTestConsultation(id: string) {
  const supabase = createTestAdminClient();
  await supabase.from("consultations").delete().eq("id", id);
}

/**
 * 전체 E2E 테스트 데이터 정리
 */
export async function cleanupAllTestData() {
  await Promise.allSettled([
    cleanupTestData("notices", "title"),
    cleanupTestData("consultations", "name"),
    cleanupTestData("questions", "title"),
  ]);
}
