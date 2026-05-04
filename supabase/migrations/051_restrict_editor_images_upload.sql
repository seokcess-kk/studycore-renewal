-- editor-images Storage 버킷 업로드 권한을 스태프(admin/mentor/assistant)로 제한
-- 기존: 모든 인증 사용자 업로드 가능 → 학생도 임의 업로드 가능했던 위험 차단
-- 읽기는 public 그대로 유지(공지·가이드 본문에 외부에서 접근).

DROP POLICY IF EXISTS "Authenticated users can upload editor images" ON storage.objects;

CREATE POLICY "Staff can upload editor images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'editor-images'
    AND is_staff()
  );

CREATE POLICY "Staff can update editor images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'editor-images' AND is_staff());

CREATE POLICY "Staff can delete editor images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'editor-images' AND is_staff());
