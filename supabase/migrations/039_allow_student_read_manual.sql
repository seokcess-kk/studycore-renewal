-- 학생(student)이 매뉴얼 타입 가이드 섹션을 조회할 수 있도록 RLS 정책 추가
-- 기존 staff_read_guide 정책은 스태프 전용이므로 별도 정책 생성

CREATE POLICY "student_read_manual" ON guide_sections
  FOR SELECT USING (
    type = 'manual'
    AND is_visible = true
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'student'
      AND status = 'active'
    )
  );
