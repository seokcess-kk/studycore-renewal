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

export function createClient(): SupabaseClient {
  // 이미 생성된 클라이언트가 있으면 재사용
  if (globalThis[GLOBAL_KEY]) {
    return globalThis[GLOBAL_KEY];
  }

  // 새 클라이언트 생성 (단일 storageKey로 lock 충돌 방지)
  const client = createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storageKey: "studycore-auth",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  // globalThis에 저장하여 싱글톤 보장
  globalThis[GLOBAL_KEY] = client;

  return client;
}

// 별칭 (코드 가독성)
export { createClient as createBrowserClient };
