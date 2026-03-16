-- 팝업 테이블
CREATE TABLE IF NOT EXISTS popups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  content TEXT,
  link_url TEXT,
  link_text TEXT DEFAULT '자세히 보기',
  notice_id UUID REFERENCES notices(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE popups ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 (활성 + 기간 내)
CREATE POLICY "popups_public_read" ON popups
  FOR SELECT
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

-- 어드민 전체 접근
CREATE POLICY "popups_admin_all" ON popups
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );

-- 인덱스
CREATE INDEX idx_popups_active_dates ON popups (is_active, start_date, end_date);
CREATE INDEX idx_popups_notice_id ON popups (notice_id);
