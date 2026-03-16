-- 스태프 비밀번호 변경 RPC
-- Supabase SQL Editor에서 실행하세요.

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

  -- staff_credentials 업데이트
  UPDATE staff_credentials
  SET password_hash = crypt(p_new_password, gen_salt('bf', 10)),
      updated_at = now()
  WHERE user_id = v_user_id;

  -- auth.users 비밀번호도 동기화
  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf'))
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
