-- 에디터 인라인 이미지용 Storage 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('editor-images', 'editor-images', true, 10485760) -- 10MB
ON CONFLICT (id) DO NOTHING;

-- 공개 읽기 허용
CREATE POLICY "Public read editor images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'editor-images');

-- 인증된 사용자 업로드 허용
CREATE POLICY "Authenticated users can upload editor images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'editor-images'
    AND auth.role() = 'authenticated'
  );
