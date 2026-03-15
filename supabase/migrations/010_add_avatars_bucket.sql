-- =============================================
-- 010: Avatars Storage Bucket
-- 프로필 이미지 저장소
-- =============================================

-- avatars 버킷 생성 (비공개, 2MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- 공개 (프로필 이미지는 다른 사용자도 볼 수 있어야 함)
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS 정책: 본인 폴더에만 업로드 가능
CREATE POLICY "avatars_insert_own_folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS 정책: 공개 조회 (모든 사용자 프로필 이미지 조회 가능)
CREATE POLICY "avatars_select_public"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- RLS 정책: 본인 파일만 업데이트 가능
CREATE POLICY "avatars_update_own"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS 정책: 본인 파일만 삭제 가능
CREATE POLICY "avatars_delete_own"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 코멘트
COMMENT ON COLUMN storage.buckets.id IS 'avatars - 프로필 이미지';
