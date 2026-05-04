/**
 * Rate Limiter
 *
 * - `checkRateLimitDB(supabase, ...)` — Supabase 테이블(rate_limits) 기반 중앙 카운터.
 *   serverless 다중 인스턴스에서도 일관된 한도. 민감한 API에서 사용.
 * - `checkRateLimit(...)` — 인메모리 폴백. 인스턴스별로 분리되므로 정확하지 않음.
 *   가벼운 스팸 방지나 비민감 라우트에서만 사용.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// 만료된 엔트리 정리 (메모리 누수 방지)
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// 10분마다 정리 실행
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredEntries, 10 * 60 * 1000);
}

export interface RateLimitConfig {
  /** 윈도우 내 최대 요청 수 */
  maxRequests: number;
  /** 윈도우 크기 (밀리초) */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Rate limit 체크
 *
 * @param identifier - 고유 식별자 (IP, 사용자 ID 등)
 * @param config - Rate limit 설정
 * @returns Rate limit 결과
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // 새 요청자 또는 윈도우 만료
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // 기존 윈도우 내 요청
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // 카운트 증가
  entry.count += 1;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * 상담 신청 API용 Rate Limit 설정
 * - 동일 IP에서 1분에 3회까지 허용
 */
export const CONSULT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3,
  windowMs: 60 * 1000, // 1분
};

/**
 * 스태프 계정 생성 API용 Rate Limit 설정
 * - 동일 IP에서 5분에 5회까지 허용
 */
export const STAFF_CREATE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 5 * 60 * 1000, // 5분
};

/**
 * Supabase 테이블 기반 중앙 Rate Limit 체크
 *
 * - serverless 다중 인스턴스에서도 일관된 카운터.
 * - RPC `check_rate_limit`(SECURITY DEFINER) 호출.
 * - RPC 실패 시 fail-open(요청 허용) — 가용성 우선.
 *
 * @param supabase - server/anon client 모두 가능 (RPC가 SECURITY DEFINER)
 * @param identifier - 고유 식별자 (e.g. "create-staff:1.2.3.4")
 * @param config - 한도/윈도우
 */
export async function checkRateLimitDB(
  supabase: SupabaseClient,
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const windowSeconds = Math.max(1, Math.ceil(config.windowMs / 1000));

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_identifier: identifier,
    p_max_requests: config.maxRequests,
    p_window_seconds: windowSeconds,
  });

  if (error || !data) {
    // RPC 실패 시 fail-open (가용성 우선)
    console.warn("[rate-limit] check_rate_limit RPC 실패 → 통과:", error?.message);
    return {
      success: true,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
    };
  }

  const result = data as { success: boolean; remaining: number; reset_at: string };
  return {
    success: result.success,
    remaining: result.remaining,
    resetTime: new Date(result.reset_at).getTime(),
  };
}
