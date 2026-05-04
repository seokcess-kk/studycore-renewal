-- profiles에 must_change_password mirror 컬럼 추가
-- 이유: 미들웨어가 매 요청마다 profiles만 조회하므로(staff_credentials는 RLS로 차단),
-- 첫 로그인 강제 변경을 미들웨어 레벨에서 강제하려면 profiles에 동기화가 필요.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

-- set_staff_password: profiles 동기화
DROP FUNCTION IF EXISTS set_staff_password(UUID, TEXT, TEXT, BOOLEAN);

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

  -- profiles mirror
  UPDATE profiles
  SET must_change_password = p_must_change
  WHERE id = p_user_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_staff_password(UUID, TEXT, TEXT, BOOLEAN) TO authenticated;

-- change_staff_password: profiles 동기화
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

  -- profiles mirror
  UPDATE profiles
  SET must_change_password = FALSE
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 staff_credentials.must_change_password 값을 profiles로 1회 동기화
UPDATE profiles p
SET must_change_password = sc.must_change_password
FROM staff_credentials sc
WHERE p.id = sc.user_id
  AND p.must_change_password IS DISTINCT FROM sc.must_change_password;
