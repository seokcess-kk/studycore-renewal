-- Staff Auth 고정 비밀번호 전환
--
-- 목적: Supabase Auth 비밀번호를 세션 생성 전용 고정값으로 통일
-- 실제 비밀번호 검증은 staff_credentials (bcrypt)에서만 수행
-- 이중 비밀번호 동기화 문제를 완전히 제거합니다.

-- 1. 기존 Staff의 Auth 비밀번호를 고정값으로 일괄 변경
UPDATE auth.users
SET encrypted_password = crypt('SC1_STAFF_SESSION_a7x9k2m4', gen_salt('bf'))
WHERE id IN (SELECT user_id FROM staff_credentials);

-- 2. change_staff_password RPC 업데이트 — auth.users 동기화 제거
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

  -- staff_credentials만 업데이트 (auth.users는 고정값 유지)
  UPDATE staff_credentials
  SET password_hash = crypt(p_new_password, gen_salt('bf', 10)),
      updated_at = now()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
