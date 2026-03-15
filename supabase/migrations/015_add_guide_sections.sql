-- ================================================
-- 015_add_guide_sections.sql
-- 조교 온보딩 가이드 섹션 테이블
-- ================================================

-- 1. 테이블 생성
CREATE TABLE guide_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX idx_guide_sections_order ON guide_sections(order_index);
CREATE INDEX idx_guide_sections_visible ON guide_sections(is_visible);

-- 3. RLS 활성화
ALTER TABLE guide_sections ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 관리자/조교/멘토 조회
CREATE POLICY "staff_read_guide" ON guide_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'assistant', 'mentor')
    )
  );

-- 5. RLS 정책: 관리자만 INSERT
CREATE POLICY "admin_insert_guide" ON guide_sections
  FOR INSERT WITH CHECK (is_admin());

-- 6. RLS 정책: 관리자만 UPDATE
CREATE POLICY "admin_update_guide" ON guide_sections
  FOR UPDATE USING (is_admin());

-- 7. RLS 정책: 관리자만 DELETE
CREATE POLICY "admin_delete_guide" ON guide_sections
  FOR DELETE USING (is_admin());

-- 8. updated_at 트리거
CREATE TRIGGER update_guide_sections_updated_at
  BEFORE UPDATE ON guide_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 9. 초기 데이터 (선택적)
INSERT INTO guide_sections (title, content, order_index) VALUES
  ('근무 시간 및 일정', '조교 근무 시간은 평일 14:00~22:00, 주말 09:00~18:00입니다. 근무 일정은 매주 금요일에 다음 주 일정이 공지됩니다.', 1),
  ('학생 관리 가이드', '학생들의 출결 관리, 질문 응대, 자습 환경 유지가 주요 업무입니다. 문제 발생 시 즉시 관리자에게 보고해 주세요.', 2),
  ('비상 연락망', '긴급 상황 발생 시 원장님(010-4408-3790)에게 즉시 연락해 주세요. 화재, 의료 응급 상황 시 119에 먼저 신고 후 원장님께 보고합니다.', 3);
