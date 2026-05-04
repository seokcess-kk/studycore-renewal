/**
 * Staff Auth 고정 비밀번호 (서버 전용)
 *
 * Supabase Auth 세션 생성 전용 비밀번호입니다.
 * 실제 비밀번호 검증은 staff_credentials 테이블 (bcrypt)에서 수행합니다.
 *
 * ⚠️ 서버 전용 — Client Component에서 절대 import 금지
 * ⚠️ 환경변수 `STAFF_AUTH_FIXED_PASSWORD` 사용 권장
 *    - .env.local 및 Vercel(Production/Preview/Development)에 등록할 것
 *    - 등록 후, 운영 안정화되면 아래 FALLBACK 상수와 분기 제거 예정(Phase 2)
 *    - 회전 시: 기존 스태프 Auth 계정 비밀번호 일괄 reset 필요
 *      (supabase.auth.admin.updateUserById 또는 마이그레이션 스크립트)
 */

// Phase 1: env 우선, 미설정 시 기존값 fallback (점진적 전환)
const FALLBACK = "SC1_STAFF_SESSION_a7x9k2m4";
const fromEnv = process.env.STAFF_AUTH_FIXED_PASSWORD;

if (!fromEnv && process.env.NODE_ENV === "production") {
  // 운영에서만 명시적으로 경고. dev/test는 fallback 무음 사용.
  console.warn(
    "[staff-auth-config] STAFF_AUTH_FIXED_PASSWORD env가 설정되지 않아 fallback을 사용합니다. " +
      "Vercel 환경변수 등록을 권장합니다."
  );
}

export const STAFF_AUTH_FIXED_PASSWORD = fromEnv || FALLBACK;
