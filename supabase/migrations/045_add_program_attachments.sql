-- =====================================================
-- 045_add_program_attachments.sql
-- 프로그램 첨부파일 테이블 + Storage 버킷
-- =====================================================

-- 프로그램 첨부파일 테이블
CREATE TABLE IF NOT EXISTS program_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_attachments_program_id
  ON program_attachments(program_id);

-- RLS 활성화
ALTER TABLE program_attachments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기
CREATE POLICY "program_attachments_select_public"
ON program_attachments FOR SELECT
USING (true);

-- admin/mentor CRUD
CREATE POLICY "program_attachments_insert_staff"
ON program_attachments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'mentor')
  )
);

CREATE POLICY "program_attachments_delete_staff"
ON program_attachments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'mentor')
  )
);

-- Storage 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('program-attachments', 'program-attachments', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: 공개 읽기
CREATE POLICY "program_attachments_storage_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'program-attachments');

-- Storage RLS: admin/mentor 업로드
CREATE POLICY "program_attachments_storage_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'program-attachments'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'mentor')
  )
);

-- Storage RLS: admin/mentor 삭제
CREATE POLICY "program_attachments_storage_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'program-attachments'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'mentor')
  )
);
