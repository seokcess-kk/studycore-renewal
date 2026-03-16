-- Staff 인증 통합 RPC
-- 기존 5회 네트워크 호출(lockout + profile + verify + signIn + record)을
-- 단일 트랜잭션(authenticate_staff + signIn)으로 단축합니다.
--
-- 기존 개별 RPC(check_account_lockout, verify_staff_password, record_login_attempt)는
-- 하위 호환을 위해 유지합니다.

CREATE OR REPLACE FUNCTION authenticate_staff(
  p_username TEXT,
  p_password TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_failed_count INT;
  v_last_failed TIMESTAMPTZ;
  v_lockout_threshold INT := 5;
  v_lockout_duration INTERVAL := '15 minutes';
  v_user_id UUID;
  v_is_valid BOOLEAN;
  v_profile JSONB;
  v_role TEXT;
BEGIN
  -- 1. 계정 잠금 확인
  SELECT COUNT(*), MAX(attempted_at)
  INTO v_failed_count, v_last_failed
  FROM login_attempts
  WHERE username = p_username
    AND success = false
    AND attempted_at > NOW() - v_lockout_duration;

  IF v_failed_count >= v_lockout_threshold THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ACCOUNT_LOCKED',
      'unlock_at', (v_last_failed + v_lockout_duration)
    );
  END IF;

  -- 2. 비밀번호 검증 (staff_credentials 단일 소스)
  SELECT sc.user_id, (sc.password_hash = crypt(p_password, sc.password_hash))
  INTO v_user_id, v_is_valid
  FROM staff_credentials sc
  WHERE sc.username = p_username;

  -- 사용자 없음 또는 비밀번호 불일치
  IF v_user_id IS NULL OR NOT v_is_valid THEN
    INSERT INTO login_attempts (username, success) VALUES (p_username, false);
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CREDENTIALS');
  END IF;

  -- 3. 프로필 조회 + Staff 역할 확인
  SELECT to_jsonb(p.*) INTO v_profile
  FROM profiles p WHERE p.id = v_user_id;

  IF v_profile IS NULL THEN
    INSERT INTO login_attempts (username, success) VALUES (p_username, false);
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CREDENTIALS');
  END IF;

  v_role := v_profile->>'role';
  IF v_role NOT IN ('admin', 'mentor', 'assistant') THEN
    INSERT INTO login_attempts (username, success) VALUES (p_username, false);
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CREDENTIALS');
  END IF;

  -- 4. 성공 기록
  INSERT INTO login_attempts (username, success) VALUES (p_username, true);

  -- 이전 실패 기록 정리
  DELETE FROM login_attempts
  WHERE username = p_username
    AND success = false
    AND attempted_at < NOW() - v_lockout_duration;

  RETURN jsonb_build_object(
    'success', true,
    'profile', v_profile
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 실행 권한 부여 (로그인 전이므로 anon 필요)
GRANT EXECUTE ON FUNCTION authenticate_staff(TEXT, TEXT) TO anon, authenticated;
