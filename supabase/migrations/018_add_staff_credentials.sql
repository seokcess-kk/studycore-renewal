-- Staff 로그인 보안 강화 SQL
-- Supabase SQL Editor에서 실행하세요.

-- 1. pgcrypto 확장 활성화 (비밀번호 해싱용)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. staff_credentials 테이블 생성
CREATE TABLE IF NOT EXISTS staff_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS 정책 설정 (보안)
ALTER TABLE staff_credentials ENABLE ROW LEVEL SECURITY;

-- 테이블 접근 제한 (서비스 역할만 접근 가능)
CREATE POLICY "Service role only" ON staff_credentials
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 4. 비밀번호 검증 RPC 함수
CREATE OR REPLACE FUNCTION verify_staff_password(p_username TEXT, p_password TEXT)
RETURNS TABLE(
  user_id UUID,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.user_id,
    (sc.password_hash = crypt(p_password, sc.password_hash)) AS is_valid
  FROM staff_credentials sc
  WHERE sc.username = p_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Staff 비밀번호 설정 함수 (관리자용)
CREATE OR REPLACE FUNCTION set_staff_password(
  p_user_id UUID,
  p_username TEXT,
  p_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_password_hash TEXT;
BEGIN
  -- 비밀번호 해싱
  v_password_hash := crypt(p_password, gen_salt('bf', 10));

  -- UPSERT: 존재하면 업데이트, 없으면 삽입
  INSERT INTO staff_credentials (user_id, username, password_hash, updated_at)
  VALUES (p_user_id, p_username, v_password_hash, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    username = EXCLUDED.username,
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 기존 Staff 계정 마이그레이션 (필요시 수동 실행)
-- 주의: 기존 비밀번호를 알고 있어야 함
-- 예시:
-- SELECT set_staff_password(
--   'user-uuid-here',
--   'admin',
--   'new-secure-password'
-- );

-- 7. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_staff_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_staff_credentials_updated_at
  BEFORE UPDATE ON staff_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_credentials_updated_at();

-- 8. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_staff_credentials_username ON staff_credentials(username);
CREATE INDEX IF NOT EXISTS idx_staff_credentials_user_id ON staff_credentials(user_id);
