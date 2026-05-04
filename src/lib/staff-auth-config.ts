/**
 * Staff Auth 고정 비밀번호 (서버 전용)
 *
 * Supabase Auth 세션 생성 전용 비밀번호입니다.
 * 실제 비밀번호 검증은 staff_credentials 테이블 (bcrypt)에서 수행합니다.
 *
 * ⚠️ 서버 전용 — Client Component에서 절대 import 금지
 * ⚠️ 환경변수 `STAFF_AUTH_FIXED_PASSWORD` 필수
 *    - .env.local 및 Vercel(Production/Preview/Development) 모두 등록되어 있어야 함
 *    - 회전 시: 기존 스태프 Auth 계정 비밀번호 일괄 reset 필요
 *      (supabase.auth.admin.updateUserById 또는 마이그레이션 스크립트)
 */
const fromEnv = process.env.STAFF_AUTH_FIXED_PASSWORD;

if (!fromEnv) {
  throw new Error(
    "STAFF_AUTH_FIXED_PASSWORD 환경변수가 설정되지 않았습니다. .env.local 및 배포 환경변수에 등록해주세요."
  );
}

export const STAFF_AUTH_FIXED_PASSWORD = fromEnv;
