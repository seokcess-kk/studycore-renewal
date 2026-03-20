-- 공지사항 순서 변경을 위한 order_index 컬럼 추가
-- 기존 데이터는 created_at 기준으로 순번 부여 (최신이 낮은 번호)

ALTER TABLE notices ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 기존 데이터에 순번 부여 (is_pinned DESC, created_at DESC 순)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY is_pinned DESC, created_at DESC) AS rn
  FROM notices
)
UPDATE notices SET order_index = numbered.rn
FROM numbered WHERE notices.id = numbered.id;

CREATE INDEX IF NOT EXISTS idx_notices_order ON notices(is_pinned DESC, order_index ASC);
