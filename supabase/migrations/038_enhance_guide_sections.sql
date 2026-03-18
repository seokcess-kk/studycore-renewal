-- 가이드 섹션 확장: 카테고리, 아이콘, HTML 콘텐츠 지원
ALTER TABLE guide_sections ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '일반';
ALTER TABLE guide_sections ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'FileText';
ALTER TABLE guide_sections ADD COLUMN IF NOT EXISTS content_html TEXT;
