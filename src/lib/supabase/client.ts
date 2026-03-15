/**
 * 브라우저 전용 Supabase 클라이언트 (싱글톤)
 *
 * ⚠️ 사용처: Client Component에서만 사용
 * ⚠️ 금지: Server Component, Route Handler, middleware에서 사용 금지
 *
 * globalThis를 사용하여 HMR, 모듈 재로드 시에도 단일 인스턴스 보장
 */

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const GLOBAL_KEY = "__supabase_browser_client__" as const;

declare global {
  // eslint-disable-next-line no-var
  var __supabase_browser_client__: SupabaseClient | undefined;
}

// 환경 변수 확인
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient(): SupabaseClient {
  // 환경 변수 체크
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요."
    );
  }

  // 이미 생성된 클라이언트가 있으면 재사용
  if (globalThis[GLOBAL_KEY]) {
    return globalThis[GLOBAL_KEY];
  }

  // 새 클라이언트 생성
  const client = createSupabaseBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storageKey: "studycore-auth",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });

  // globalThis에 저장하여 싱글톤 보장
  globalThis[GLOBAL_KEY] = client;

  return client;
}

// 별칭 (코드 가독성)
export { createClient as createBrowserClient };
