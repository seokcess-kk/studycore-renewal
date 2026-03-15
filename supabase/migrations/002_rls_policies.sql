-- ============================================
-- STUDYCORE 1.0 - RLS 정책
-- ============================================

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_registrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 헬퍼 함수
-- ============================================

-- 현재 사용자의 역할 가져오기
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 현재 사용자의 상태 가져오기
CREATE OR REPLACE FUNCTION get_user_status()
RETURNS TEXT AS $$
  SELECT status FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 관리자 여부 확인
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER;

-- 스태프 여부 확인 (admin, mentor, assistant)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('admin', 'mentor', 'assistant');
$$ LANGUAGE sql SECURITY DEFINER;

-- 활성 사용자 여부 확인
CREATE OR REPLACE FUNCTION is_active_user()
RETURNS BOOLEAN AS $$
  SELECT get_user_status() = 'active';
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- profiles 정책
-- ============================================

-- 본인 프로필 읽기
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 스태프는 모든 프로필 읽기 가능
CREATE POLICY "Staff can read all profiles"
  ON public.profiles FOR SELECT
  USING (is_staff());

-- 본인 프로필 수정
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())  -- 역할 변경 불가
    AND status = (SELECT status FROM public.profiles WHERE id = auth.uid())  -- 상태 변경 불가
  );

-- 관리자는 모든 프로필 수정 가능
CREATE POLICY "Admin can update all profiles"
  ON public.profiles FOR UPDATE
  USING (is_admin());

-- 새 프로필 생성 (회원가입 시)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- consultations 정책
-- ============================================

-- 누구나 상담 신청 가능 (익명 포함)
CREATE POLICY "Anyone can create consultation"
  ON public.consultations FOR INSERT
  WITH CHECK (TRUE);

-- 스태프만 상담 목록 조회 가능
CREATE POLICY "Staff can read consultations"
  ON public.consultations FOR SELECT
  USING (is_staff());

-- 관리자만 상담 수정 가능
CREATE POLICY "Admin can update consultations"
  ON public.consultations FOR UPDATE
  USING (is_admin());

-- ============================================
-- notices 정책
-- ============================================

-- 활성 사용자만 공지사항 읽기 가능
CREATE POLICY "Active users can read published notices"
  ON public.notices FOR SELECT
  USING (
    is_published = TRUE
    AND (is_staff() OR is_active_user())
  );

-- 스태프는 모든 공지사항 읽기 가능
CREATE POLICY "Staff can read all notices"
  ON public.notices FOR SELECT
  USING (is_staff());

-- 관리자만 공지사항 생성/수정/삭제 가능
CREATE POLICY "Admin can manage notices"
  ON public.notices FOR ALL
  USING (is_admin());

-- ============================================
-- notice_attachments 정책
-- ============================================

-- 공지사항 읽을 수 있으면 첨부파일도 읽기 가능
CREATE POLICY "Users can read notice attachments"
  ON public.notice_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notices
      WHERE id = notice_id
      AND (is_published = TRUE OR is_staff())
    )
  );

-- 관리자만 첨부파일 관리 가능
CREATE POLICY "Admin can manage notice attachments"
  ON public.notice_attachments FOR ALL
  USING (is_admin());

-- ============================================
-- questions 정책
-- ============================================

-- 본인 질문 읽기 가능
CREATE POLICY "Users can read own questions"
  ON public.questions FOR SELECT
  USING (auth.uid() = author_id);

-- 스태프(멘토)는 모든 질문 읽기 가능
CREATE POLICY "Staff can read all questions"
  ON public.questions FOR SELECT
  USING (is_staff());

-- 활성 사용자만 질문 생성 가능
CREATE POLICY "Active users can create questions"
  ON public.questions FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND is_active_user()
  );

-- 본인 질문 수정 가능 (답변 전만)
CREATE POLICY "Users can update own pending questions"
  ON public.questions FOR UPDATE
  USING (
    auth.uid() = author_id
    AND status = 'pending'
  );

-- 스태프는 질문 상태 변경 가능
CREATE POLICY "Staff can update question status"
  ON public.questions FOR UPDATE
  USING (is_staff());

-- ============================================
-- question_answers 정책
-- ============================================

-- 질문 작성자와 스태프만 답변 읽기 가능
CREATE POLICY "Users can read answers to own questions"
  ON public.question_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.questions
      WHERE id = question_id
      AND (author_id = auth.uid() OR is_staff())
    )
  );

-- 멘토와 관리자만 답변 작성 가능
CREATE POLICY "Mentors can create answers"
  ON public.question_answers FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND get_user_role() IN ('mentor', 'admin')
  );

-- 본인 답변 수정 가능
CREATE POLICY "Authors can update own answers"
  ON public.question_answers FOR UPDATE
  USING (auth.uid() = author_id);

-- ============================================
-- counselings 정책
-- ============================================

-- 본인 상담 기록 읽기 가능
CREATE POLICY "Students can read own counselings"
  ON public.counselings FOR SELECT
  USING (auth.uid() = student_id);

-- 스태프는 모든 상담 기록 읽기 가능
CREATE POLICY "Staff can read all counselings"
  ON public.counselings FOR SELECT
  USING (is_staff());

-- 스태프만 상담 기록 작성 가능
CREATE POLICY "Staff can create counselings"
  ON public.counselings FOR INSERT
  WITH CHECK (is_staff() AND auth.uid() = counselor_id);

-- ============================================
-- user_registrations 정책
-- ============================================

-- 본인 이력 읽기 가능
CREATE POLICY "Users can read own registration history"
  ON public.user_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- 관리자는 모든 이력 읽기 가능
CREATE POLICY "Admin can read all registration history"
  ON public.user_registrations FOR SELECT
  USING (is_admin());
