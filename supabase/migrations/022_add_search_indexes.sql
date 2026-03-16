-- 공개 페이지 통합 검색을 위한 full-text 인덱스
-- Supabase SQL Editor에서 실행하세요.

-- 공지 full-text 인덱스
ALTER TABLE notices ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(content, '')), 'B')
  ) STORED;
CREATE INDEX IF NOT EXISTS idx_notices_search ON notices USING gin(search_vector);

-- 블로그 full-text 인덱스
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(content, '')), 'B')
  ) STORED;
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING gin(search_vector);
