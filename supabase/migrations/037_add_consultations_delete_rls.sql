-- consultations: admin/mentor가 삭제 가능하도록 정책 추가
CREATE POLICY "Admin and mentor can delete consultations"
  ON public.consultations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mentor')
    )
  );
