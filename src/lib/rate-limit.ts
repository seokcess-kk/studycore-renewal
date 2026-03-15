/**
 * 간단한 In-Memory Rate Limiter
 *
 * Vercel Edge/Serverless 환경에서는 인스턴스별로 메모리가 분리되므로
 * 완벽한 방어는 아니지만, 기본적인 스팸 방지에 효과적입니다.
 * 프로덕션에서는 Redis 기반 rate limiting 권장.
 */

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
