-- 프로그램 테이블
CREATE TABLE IF NOT EXISTS programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 (활성만)
CREATE POLICY "programs_public_read" ON programs
  FOR SELECT
  USING (is_active = true);

-- 어드민 전체 접근
CREATE POLICY "programs_admin_all" ON programs
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
CREATE INDEX idx_programs_active_sort ON programs (is_active, sort_order);
