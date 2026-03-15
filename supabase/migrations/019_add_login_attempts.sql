-- 로그인 시도 추적 및 계정 잠금 SQL
-- Supabase SQL Editor에서 실행하세요.

-- 1. login_attempts 테이블 생성
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts(username);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_username_time ON login_attempts(username, attempted_at DESC);

-- 3. RLS 정책 (서비스 역할만 접근)
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON login_attempts
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- 4. 로그인 시도 기록 함수
CREATE OR REPLACE FUNCTION record_login_attempt(
  p_username TEXT,
  p_success BOOLEAN,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO login_attempts (username, success, ip_address)
  VALUES (p_username, p_success, p_ip_address);

  -- 성공 시 이전 실패 기록 정리 (선택사항)
  IF p_success THEN
    DELETE FROM login_attempts
    WHERE username = p_username
      AND success = false
      AND attempted_at < NOW() - INTERVAL '15 minutes';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 계정 잠금 상태 확인 함수
CREATE OR REPLACE FUNCTION check_account_lockout(p_username TEXT)
RETURNS TABLE(
  is_locked BOOLEAN,
  failed_attempts INT,
  unlock_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_failed_count INT;
  v_last_failed TIMESTAMP WITH TIME ZONE;
  v_lockout_threshold INT := 5;
  v_lockout_duration INTERVAL := '15 minutes';
BEGIN
  -- 최근 15분간 실패 횟수 조회
  SELECT COUNT(*), MAX(attempted_at)
  INTO v_failed_count, v_last_failed
  FROM login_attempts
  WHERE username = p_username
    AND success = false
    AND attempted_at > NOW() - v_lockout_duration;

  -- 잠금 여부 및 정보 반환
  RETURN QUERY SELECT
    v_failed_count >= v_lockout_threshold,
    v_failed_count,
    CASE
      WHEN v_failed_count >= v_lockout_threshold
      THEN v_last_failed + v_lockout_duration
      ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 잠금 해제 (관리자용)
CREATE OR REPLACE FUNCTION unlock_account(p_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM login_attempts
  WHERE username = p_username
    AND success = false;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 오래된 기록 정리 (정기적으로 실행)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS INT AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM login_attempts
  WHERE attempted_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
