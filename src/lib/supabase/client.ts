/**
 * 브라우저 전용 Supabase 클라이언트
 *
 * ⚠️ 사용처: Client Component에서만 사용
 * ⚠️ 금지: Server Component, Route Handler, middleware에서 사용 금지
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 별칭 (코드 가독성)
export { createClient as createBrowserClient };
