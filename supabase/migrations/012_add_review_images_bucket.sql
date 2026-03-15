-- =====================================================
-- 012: 리뷰 이미지 스토리지 버킷
-- =====================================================

-- 1. review-images 버킷 생성 (공개)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-images',
  'review-images',
  true,
  3145728,  -- 3MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS 정책

-- 공개 읽기 (모든 사용자)
CREATE POLICY "Review images are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-images');

-- 본인 폴더 업로드 (인증된 사용자)
CREATE POLICY "Users can upload review images to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 본인 폴더 수정 (인증된 사용자)
CREATE POLICY "Users can update own review images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 본인 폴더 삭제 (인증된 사용자)
CREATE POLICY "Users can delete own review images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
