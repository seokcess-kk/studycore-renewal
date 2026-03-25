-- 공간 소개 테이블
CREATE TABLE IF NOT EXISTS spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 (활성만)
CREATE POLICY "spaces_public_read" ON spaces
  FOR SELECT
  USING (is_active = true);

-- 어드민 전체 접근
CREATE POLICY "spaces_admin_all" ON spaces
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
CREATE INDEX idx_spaces_active_sort ON spaces (is_active, sort_order);

-- 기존 하드코딩 데이터 시드
INSERT INTO spaces (label, title, description, sort_order) VALUES
  ('Main Hall', '메인 자습실', '개인 칸막이 책상과 최적화된 조명으로 설계된 넓고 조용한 자습 공간입니다. 교시 시작과 함께 집중 모드가 시작됩니다.', 0),
  ('Lounge', '휴게 공간', '쉬는 시간에 완전히 긴장을 풀고 돌아올 수 있는 별도 공간입니다. 자습실과 분리되어 집중과 휴식의 경계가 명확합니다.', 1),
  ('Facility', '편의 시설', '정수기, 개인 사물함, 충전 시설을 기본 제공합니다. 공부 외의 불편함이 없도록 필요한 것들은 이미 갖춰져 있습니다.', 2),
  ('Location', '애플타워 10층', '광주광역시 광산구 임방울대로 330, 애플타워 10층. 버스·지하철 모두 접근이 편리하며, 건물 내 주차도 가능합니다.', 3);

-- Storage 버킷 (space-images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('space-images', 'space-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage 정책: 어드민만 업로드/수정/삭제
CREATE POLICY "space_images_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'space-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );

CREATE POLICY "space_images_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'space-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );

CREATE POLICY "space_images_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'space-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );
