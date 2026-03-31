-- ============================================
-- notices: visibility 컬럼 추가 (전체 공개 / 회원 공개)
-- ============================================

-- 1. 컬럼 추가 (기존 게시글은 모두 members_only)
ALTER TABLE public.notices
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'members_only';

-- 2. 기존 SELECT 정책 교체
-- 기존: "Active users can read published notices" (authenticated만)
DROP POLICY IF EXISTS "Active users can read published notices" ON public.notices;

-- 비로그인 포함 전체: 전체 공개 + 발행된 공지만
CREATE POLICY "Anyone can read public published notices"
  ON public.notices FOR SELECT
  TO anon, authenticated
  USING (is_published = TRUE AND visibility = 'public');

-- 로그인 사용자: 발행된 모든 공지 (회원 공개 포함)
CREATE POLICY "Authenticated users can read all published notices"
  ON public.notices FOR SELECT
  TO authenticated
  USING (is_published = TRUE);

-- 기존 "Staff can read all notices" 정책은 유지 (임시저장 포함 전체 조회)
-- 기존 "Admin and mentor can manage notices" 정책은 유지 (CRUD)

-- 3. 조회수 증가 RPC (SECURITY DEFINER로 RLS 우회 — 비로그인 조회수도 카운트)
CREATE OR REPLACE FUNCTION public.increment_notice_view_count(notice_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notices SET view_count = view_count + 1 WHERE id = notice_id;
END;
$$;

-- anon, authenticated 모두 호출 가능
GRANT EXECUTE ON FUNCTION public.increment_notice_view_count(UUID) TO anon, authenticated;

-- 4. notice_attachments SELECT 정책도 anon 허용으로 업데이트
DROP POLICY IF EXISTS "Users can read notice attachments" ON public.notice_attachments;

CREATE POLICY "Anyone can read published notice attachments"
  ON public.notice_attachments FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.notices
      WHERE id = notice_id
      AND is_published = TRUE
    )
  );
