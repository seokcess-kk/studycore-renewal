-- =====================================================
-- 008_add_storage_buckets.sql
-- Storage 버킷 및 RLS 정책
-- =====================================================

-- =====================================================
-- 버킷 생성
-- =====================================================

-- question-images: 질문 첨부 이미지 (비공개)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-images',
  'question-images',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- blog-thumbnails: 블로그 썸네일 (공개)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-thumbnails',
  'blog-thumbnails',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- question-images RLS 정책
-- =====================================================

-- 활성 재원생: 자신의 폴더에 업로드 가능
CREATE POLICY "question_images_insert_student"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'question-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'student'
    AND status = 'active'
  )
);

-- 업로더 본인: 자신의 이미지 조회 가능
CREATE POLICY "question_images_select_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'question-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 멘토/관리자: 모든 이미지 조회 가능
CREATE POLICY "question_images_select_admin"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'question-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'mentor')
  )
);

-- 업로더 본인: 자신의 이미지 삭제 가능
CREATE POLICY "question_images_delete_own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'question-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 관리자: 모든 이미지 삭제 가능
CREATE POLICY "question_images_delete_admin"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'question-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- =====================================================
-- blog-thumbnails RLS 정책
-- =====================================================

-- 관리자만 업로드 가능
CREATE POLICY "blog_thumbnails_insert_admin"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-thumbnails'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- 공개 버킷이므로 별도 SELECT 정책 불필요 (public = true)

-- 관리자만 삭제 가능
CREATE POLICY "blog_thumbnails_delete_admin"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-thumbnails'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- 관리자만 수정 가능
CREATE POLICY "blog_thumbnails_update_admin"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-thumbnails'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
