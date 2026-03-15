/**
 * 서버 전용 Supabase 클라이언트
 *
 * ⚠️ 사용처: Server Component, Route Handler, Server Action, middleware
 * ⚠️ 금지: Client Component에서 사용 금지
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 무시
            // middleware나 Server Action에서는 정상 동작
          }
        },
      },
    }
  );
}

/**
 * Admin 클라이언트 (Service Role)
 *
 * ⚠️ 사용처: 서버 전용 (Route Handler, Server Action)
 * ⚠️ 위험: RLS를 우회하므로 신중하게 사용
 * ⚠️ 절대 금지: 클라이언트에 노출 금지
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 무시
          }
        },
      },
    }
  );
}
