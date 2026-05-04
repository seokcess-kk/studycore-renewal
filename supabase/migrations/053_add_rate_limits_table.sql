-- 분산 환경(Vercel serverless 다중 인스턴스) 대응 rate limit
-- 기존 인메모리 src/lib/rate-limit.ts는 인스턴스별 분리되어 우회 가능 → 중앙 저장소(Postgres) 기반으로 전환.

-- 1. 테이블
CREATE TABLE IF NOT EXISTS rate_limits (
  identifier TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits (reset_at);

-- 2. RLS — RPC 통해서만 접근
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only on rate_limits"
  ON rate_limits FOR ALL
  USING (false)
  WITH CHECK (false);

-- 3. RPC: 윈도우 단위 카운트 + 한도 체크
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_max_requests INT,
  p_window_seconds INT
) RETURNS JSONB AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_reset_at TIMESTAMPTZ;
  v_existing_count INT;
  v_existing_reset TIMESTAMPTZ;
BEGIN
  v_reset_at := v_now + (p_window_seconds || ' seconds')::INTERVAL;

  -- 동일 identifier에 대한 동시 요청 직렬화
  SELECT count, reset_at INTO v_existing_count, v_existing_reset
  FROM rate_limits
  WHERE identifier = p_identifier
  FOR UPDATE;

  -- 기존 row 없거나 윈도우 만료 → 새 윈도우 시작
  IF v_existing_count IS NULL OR v_existing_reset <= v_now THEN
    INSERT INTO rate_limits (identifier, count, reset_at, updated_at)
    VALUES (p_identifier, 1, v_reset_at, v_now)
    ON CONFLICT (identifier) DO UPDATE SET
      count = 1,
      reset_at = v_reset_at,
      updated_at = v_now;

    RETURN jsonb_build_object(
      'success', true,
      'remaining', p_max_requests - 1,
      'reset_at', v_reset_at
    );
  END IF;

  -- 한도 초과
  IF v_existing_count >= p_max_requests THEN
    RETURN jsonb_build_object(
      'success', false,
      'remaining', 0,
      'reset_at', v_existing_reset
    );
  END IF;

  -- 카운트 증가
  UPDATE rate_limits
  SET count = count + 1, updated_at = v_now
  WHERE identifier = p_identifier;

  RETURN jsonb_build_object(
    'success', true,
    'remaining', p_max_requests - (v_existing_count + 1),
    'reset_at', v_existing_reset
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INT, INT) TO anon, authenticated;

-- 4. 만료된 row 정리 함수 (수동 실행 또는 cron)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS INT AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM rate_limits
  WHERE reset_at < NOW() - INTERVAL '1 hour';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
