-- 신규 스태프 계정의 첫 로그인 시 비밀번호 강제 변경(Phase 2)
--
-- 변경 사항
-- 1. staff_credentials.must_change_password 컬럼 추가 (기존 계정은 FALSE — 강제 변경 안 함)
-- 2. set_staff_password에 p_must_change 파라미터 추가 (기본 FALSE — 호환성 유지)
-- 3. authenticate_staff 결과에 must_change_password 포함
-- 4. change_staff_password: 변경 시 must_change_password=FALSE로 reset.
--    또한 auth.users.encrypted_password 동기화 제거 — STAFF_AUTH_FIXED_PASSWORD 정책과 충돌하던 버그 해결.

-- 1. 컬럼 추가
ALTER TABLE staff_credentials
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. set_staff_password 시그니처 확장
DROP FUNCTION IF EXISTS set_staff_password(UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION set_staff_password(
  p_user_id UUID,
  p_username TEXT,
  p_password TEXT,
  p_must_change BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN AS $$
DECLARE
  v_password_hash TEXT;
BEGIN
  v_password_hash := crypt(p_password, gen_salt('bf', 10));

  INSERT INTO staff_credentials (user_id, username, password_hash, must_change_password, updated_at)
  VALUES (p_user_id, p_username, v_password_hash, p_must_change, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    username = EXCLUDED.username,
    password_hash = EXCLUDED.password_hash,
    must_change_password = EXCLUDED.must_change_password,
    updated_at = NOW();

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_staff_password(UUID, TEXT, TEXT, BOOLEAN) TO authenticated;

-- 3. authenticate_staff: must_change_password 결과 포함
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
  v_must_change BOOLEAN;
  v_profile JSONB;
  v_role TEXT;
BEGIN
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

  SELECT sc.user_id,
         (sc.password_hash = crypt(p_password, sc.password_hash)),
         sc.must_change_password
  INTO v_user_id, v_is_valid, v_must_change
  FROM staff_credentials sc
  WHERE sc.username = p_username;

  IF v_user_id IS NULL OR NOT v_is_valid THEN
    INSERT INTO login_attempts (username, success) VALUES (p_username, false);
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CREDENTIALS');
  END IF;

  SELECT to_jsonb(p.*) INTO v_profile FROM profiles p WHERE p.id = v_user_id;
  IF v_profile IS NULL THEN
    INSERT INTO login_attempts (username, success) VALUES (p_username, false);
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CREDENTIALS');
  END IF;

  v_role := v_profile->>'role';
  IF v_role NOT IN ('admin', 'mentor', 'assistant') THEN
    INSERT INTO login_attempts (username, success) VALUES (p_username, false);
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CREDENTIALS');
  END IF;

  INSERT INTO login_attempts (username, success) VALUES (p_username, true);
  DELETE FROM login_attempts
  WHERE username = p_username
    AND success = false
    AND attempted_at < NOW() - v_lockout_duration;

  RETURN jsonb_build_object(
    'success', true,
    'profile', v_profile,
    'must_change_password', COALESCE(v_must_change, false)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION authenticate_staff(TEXT, TEXT) TO anon, authenticated;

-- 4. change_staff_password: must_change_password=false reset + auth.users 동기화 제거
CREATE OR REPLACE FUNCTION change_staff_password(
  p_current_password TEXT,
  p_new_password TEXT
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_stored_hash TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_AUTHENTICATED');
  END IF;

  SELECT password_hash INTO v_stored_hash
  FROM staff_credentials WHERE user_id = v_user_id;

  IF v_stored_hash IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NO_CREDENTIALS');
  END IF;

  IF NOT (v_stored_hash = crypt(p_current_password, v_stored_hash)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'WRONG_PASSWORD');
  END IF;

  UPDATE staff_credentials
  SET password_hash = crypt(p_new_password, gen_salt('bf', 10)),
      must_change_password = FALSE,
      updated_at = now()
  WHERE user_id = v_user_id;

  -- auth.users.encrypted_password는 STAFF_AUTH_FIXED_PASSWORD 정책상 변경하지 않음
  -- (Staff Auth 세션은 고정 비밀번호로 생성, 실 검증은 staff_credentials만 사용)

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
