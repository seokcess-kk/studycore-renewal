-- ============================================
-- guide_sections에 첨부파일 JSONB 컬럼 추가
-- + guide-attachments Storage 버킷 생성
--
-- attachments 형식:
-- [{ "id": "uuid", "name": "파일명.pdf", "type": "pdf", "size": 123456, "url": "https://..." }]
-- ============================================

-- 1. JSONB 컬럼 추가
ALTER TABLE public.guide_sections
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 2. Storage 버킷 생성 (공개 — 가이드/매뉴얼 문서)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guide-attachments',
  'guide-attachments',
  true,
  20971520, -- 20MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'text/plain'
  ]
) ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS 정책

-- admin/mentor만 업로드 가능
CREATE POLICY "guide_attachments_insert_staff"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'guide-attachments'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'mentor')
  )
);

-- 공개 버킷이므로 별도 SELECT 정책 불필요 (public = true)

-- admin/mentor만 삭제 가능
CREATE POLICY "guide_attachments_delete_staff"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'guide-attachments'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'mentor')
  )
);

-- admin/mentor만 수정 가능
CREATE POLICY "guide_attachments_update_staff"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'guide-attachments'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'mentor')
  )
);
