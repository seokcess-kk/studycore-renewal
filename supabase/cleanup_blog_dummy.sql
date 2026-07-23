-- =====================================================
-- 블로그 더미 데이터 정리 (프로덕션)
-- Supabase SQL Editor에서 실행
--
-- 배경: seed_blog_dummy.sql로 삽입한 UI 테스트용 더미 글(dummy-*)이
--       프로덕션에 is_published=true 상태로 색인되고 있어 정리한다.
--
-- 권장: 완전 삭제(DELETE). 되돌릴 필요가 있으면 seed_blog_dummy.sql로 재삽입 가능.
-- =====================================================

-- 1) 삭제 대상 미리보기 (먼저 실행해 확인)
SELECT slug, title, is_published, published_at
FROM public.blog_posts
WHERE slug LIKE 'dummy-%'
ORDER BY published_at DESC NULLS LAST;

-- 2) 완전 삭제
DELETE FROM public.blog_posts WHERE slug LIKE 'dummy-%';

-- (대안) 삭제 대신 비공개만 하려면 아래를 사용:
-- UPDATE public.blog_posts
-- SET is_published = false, published_at = NULL
-- WHERE slug LIKE 'dummy-%';
--
-- 사이트맵(sitemap.ts)은 is_published=true 만 노출하므로,
-- 삭제·비공개 어느 쪽이든 다음 재생성 시 dummy-* URL이 사이트맵에서 사라진다.
