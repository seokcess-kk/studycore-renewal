-- guide_sections.type CHECK 제약 확장: 'guidance_template' 추가
-- 안내 템플릿(상황별 안내 문서) 분류를 도입
-- 기존 RLS 정책(staff_read_guide, public_read_manual, admin_*)은 그대로 유지
-- public_read_manual은 type='manual'에만 매칭되므로 guidance_template은 비공개 유지(스태프만 조회)

ALTER TABLE public.guide_sections
DROP CONSTRAINT IF EXISTS guide_sections_type_check;

ALTER TABLE public.guide_sections
ADD CONSTRAINT guide_sections_type_check
CHECK (type IN ('onboarding', 'manual', 'guidance_template'));
