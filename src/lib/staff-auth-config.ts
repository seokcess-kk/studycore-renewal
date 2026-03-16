/**
 * Staff Auth 고정 비밀번호 (서버 전용)
 *
 * Supabase Auth 세션 생성 전용 비밀번호입니다.
 * 실제 비밀번호 검증은 staff_credentials 테이블 (bcrypt)에서 수행합니다.
 *
 * ⚠️ 서버 전용 — Client Component에서 절대 import 금지
 * ⚠️ 이 값은 보안 비밀이 아닙니다 — 실제 인증은 authenticate_staff RPC가 담당
 */
export const STAFF_AUTH_FIXED_PASSWORD = "SC1_STAFF_SESSION_a7x9k2m4";
