-- 비로그인 포함 모든 사용자가 매뉴얼(type='manual') 가이드 섹션을 조회할 수 있도록 RLS 정책 추가
-- 기존 staff_read_guide(스태프 전체 조회), student_read_manual(재원생 매뉴얼 조회) 정책은 그대로 유지
-- 본 정책은 anon/authenticated 모두에 대해 가시성(is_visible=true) + 매뉴얼 타입만 공개

CREATE POLICY "public_read_manual" ON guide_sections
  FOR SELECT USING (
    type = 'manual'
    AND is_visible = true
  );
