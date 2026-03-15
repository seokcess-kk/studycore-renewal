-- =============================================
-- 009: Notification Logs Table
-- 알림 발송 이력 관리
-- =============================================

-- notification_logs 테이블 생성
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('sms', 'alimtalk')),
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  message TEXT NOT NULL,
  template_code TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at
  ON public.notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type
  ON public.notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status
  ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_by
  ON public.notification_logs(sent_by);

-- RLS 활성화
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 관리자만 조회 가능
CREATE POLICY "notification_logs_select_admin"
  ON public.notification_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS 정책: 서비스 롤에서 삽입 가능 (Edge Functions)
CREATE POLICY "notification_logs_insert_service"
  ON public.notification_logs
  FOR INSERT
  WITH CHECK (true);

-- 코멘트
COMMENT ON TABLE public.notification_logs IS '알림 발송 이력';
COMMENT ON COLUMN public.notification_logs.type IS 'sms 또는 alimtalk';
COMMENT ON COLUMN public.notification_logs.status IS 'pending, sent, failed';
COMMENT ON COLUMN public.notification_logs.metadata IS '추가 정보 (배치 ID 등)';
