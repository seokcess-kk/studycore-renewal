-- ============================================
-- notices: mentor도 공지 관리 가능하도록 수정
-- 기존: is_admin() (admin만)
-- 변경: admin + mentor
-- ============================================
DROP POLICY IF EXISTS "Admin can manage notices" ON public.notices;

CREATE POLICY "Admin and mentor can manage notices"
  ON public.notices FOR ALL
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

-- ============================================
-- consultations: 비로그인(anon) 사용자도 INSERT 가능하도록 명시
-- 기존: WITH CHECK (TRUE) — role 미지정
-- 변경: anon + authenticated 모두 INSERT 가능
-- ============================================
DROP POLICY IF EXISTS "Anyone can create consultation" ON public.consultations;

CREATE POLICY "Anyone can create consultation"
  ON public.consultations FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- ============================================
-- consultations: mentor도 상담 수정 가능
-- ============================================
DROP POLICY IF EXISTS "Admin can update consultations" ON public.consultations;

CREATE POLICY "Admin and mentor can update consultations"
  ON public.consultations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );

-- ============================================
-- consultations: mentor도 조회 가능 (기존 is_staff 유지하되 명시적으로)
-- ============================================
DROP POLICY IF EXISTS "Staff can read consultations" ON public.consultations;

CREATE POLICY "Staff can read consultations"
  ON public.consultations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor', 'assistant')
    )
  );

-- ============================================
-- consultations: school, grade 컬럼 추가
-- ============================================
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS school TEXT,
  ADD COLUMN IF NOT EXISTS grade TEXT;

-- ============================================
-- notice_attachments: mentor도 관리 가능하도록 수정
-- ============================================
DROP POLICY IF EXISTS "Admin can manage attachments" ON public.notice_attachments;

CREATE POLICY "Admin and mentor can manage attachments"
  ON public.notice_attachments FOR ALL
  TO authenticated
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

-- ============================================
-- Storage: notice-attachments 버킷 생성
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('notice-attachments', 'notice-attachments', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- notice-attachments 버킷 정책
CREATE POLICY "notice_attachments_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'notice-attachments');

CREATE POLICY "notice_attachments_staff_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'notice-attachments'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );

CREATE POLICY "notice_attachments_staff_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'notice-attachments'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );

-- ============================================
-- Storage: popups, programs 버킷 생성
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('popups', 'popups', true, 5242880)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('programs', 'programs', true, 5242880)
ON CONFLICT (id) DO NOTHING;

-- popups 버킷 정책
CREATE POLICY "popups_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'popups');

CREATE POLICY "popups_staff_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'popups'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );

CREATE POLICY "popups_staff_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'popups'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );

-- programs 버킷 정책
CREATE POLICY "programs_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'programs');

CREATE POLICY "programs_staff_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'programs'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );

CREATE POLICY "programs_staff_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'programs'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );
