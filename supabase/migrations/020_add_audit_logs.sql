-- 감사 로그 SQL
-- Supabase SQL Editor에서 실행하세요.

-- 1. audit_logs 테이블 생성
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 3. RLS 정책 (admin만 조회 가능)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 조회: admin 역할만
CREATE POLICY "Admin can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 삽입: 서비스 역할만 (RPC 함수 통해서만)
CREATE POLICY "Service role can insert"
  ON audit_logs FOR INSERT
  WITH CHECK (false);

-- 4. 감사 로그 기록 함수
CREATE OR REPLACE FUNCTION create_audit_log(
  p_actor_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_changes JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_actor_name TEXT;
  v_log_id UUID;
BEGIN
  -- 액터 이름 조회
  SELECT name INTO v_actor_name
  FROM profiles
  WHERE id = p_actor_id;

  -- 로그 삽입
  INSERT INTO audit_logs (
    actor_id,
    actor_name,
    action,
    resource_type,
    resource_id,
    changes,
    metadata
  )
  VALUES (
    p_actor_id,
    v_actor_name,
    p_action,
    p_resource_type,
    p_resource_id,
    p_changes,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 감사 로그 조회 함수 (페이지네이션)
CREATE OR REPLACE FUNCTION get_audit_logs(
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0,
  p_action TEXT DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  actor_id UUID,
  actor_name TEXT,
  action TEXT,
  resource_type TEXT,
  resource_id UUID,
  changes JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.actor_id,
    al.actor_name,
    al.action,
    al.resource_type,
    al.resource_id,
    al.changes,
    al.metadata,
    al.created_at
  FROM audit_logs al
  WHERE
    (p_action IS NULL OR al.action = p_action)
    AND (p_resource_type IS NULL OR al.resource_type = p_resource_type)
    AND (p_actor_id IS NULL OR al.actor_id = p_actor_id)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 액션 타입 상수 (참고용)
COMMENT ON TABLE audit_logs IS '
액션 타입:
- user.status_change: 사용자 상태 변경 (승인, 비활성화 등)
- user.role_change: 사용자 역할 변경
- user.create: 사용자 생성
- user.delete: 사용자 삭제
- notice.create: 공지 생성
- notice.update: 공지 수정
- notice.delete: 공지 삭제
- question.answer: 질문 답변
- blog.create: 블로그 작성
- blog.update: 블로그 수정
- blog.delete: 블로그 삭제
- settings.update: 설정 변경
';

-- 7. 오래된 로그 정리 (90일)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INT AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
