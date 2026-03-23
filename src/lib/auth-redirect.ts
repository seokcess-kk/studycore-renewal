/**
 * 인증 관련 리다이렉트 유틸리티
 */

/**
 * 리다이렉트 경로를 내부 상대경로로 검증
 * 외부 URL, 스킴 URL 등 위험한 패턴을 차단하여 오픈 리다이렉트 공격 방지
 */
export function sanitizeRedirectPath(
  input: string | null,
  fallback = "/"
): string {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (/^\/\/|^\/\\|https?:|javascript:|data:/i.test(input)) return fallback;
  return input;
}

/**
 * 인증 후 사용자 상태에 따른 목적지 결정
 * OAuth 콜백과 middleware에서 동일한 규칙을 사용
 */
export function getPostAuthDestination(
  profile: { role?: string; status?: string; phone?: string | null } | null,
  fallbackNext = "/"
): string {
  if (!profile) return "/pending-approval";
  if (profile.role === "student" && profile.status === "pending")
    return "/pending-approval";
  if (profile.role === "student" && profile.status === "inactive")
    return "/account-inactive";
  // 승인된 학생인데 필수 정보 미입력 → 마이페이지로 이동
  if (profile.role === "student" && profile.status === "active" && !profile.phone)
    return "/my";
  return fallbackNext;
}
