-- =====================================================
-- 블로그 더미 데이터 (UI 테스트용)
-- Supabase SQL Editor에서 실행
--
-- 실행 전: admin/mentor 계정의 profiles.id를 아래 변수에 설정
-- 실행 후: DELETE FROM blog_posts WHERE slug LIKE 'dummy-%'; 로 정리
-- =====================================================

DO $$
DECLARE
  v_author_id UUID;
BEGIN
  -- 관리자 계정 자동 탐색 (admin 또는 mentor 중 첫 번째)
  SELECT id INTO v_author_id
  FROM public.profiles
  WHERE role IN ('admin', 'mentor')
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_author_id IS NULL THEN
    RAISE EXCEPTION '관리자/멘토 계정이 없습니다. 먼저 스태프 계정을 생성하세요.';
  END IF;

  -- 기존 더미 데이터 정리
  DELETE FROM public.blog_posts WHERE slug LIKE 'dummy-%';

  -- 1. Featured용 (최신, 썸네일 + 긴 요약)
  INSERT INTO public.blog_posts (title, slug, content, excerpt, thumbnail_url, tags, is_published, author_id, published_at)
  VALUES (
    '2026학년도 수시 전략 가이드: 달라진 핵심 포인트 총정리',
    'dummy-2026-susi-strategy',
    E'## 2026학년도 수시, 무엇이 달라졌나\n\n올해 수시 전형은 크게 세 가지가 변경되었습니다.\n\n### 1. 학생부 교과 전형 확대\n\n주요 대학들이 학생부 교과 전형 비율을 높였습니다. 이는 내신 관리의 중요성이 더 커졌음을 의미합니다.\n\n### 2. 논술 전형 변화\n\n일부 대학에서 논술 전형을 폐지하고, 대신 면접 전형을 강화하는 추세입니다.\n\n### 3. 비교과 활동 반영 축소\n\n자율활동, 봉사활동 등의 반영 비율이 줄어들고, 교과 성적과 세부능력특기사항의 비중이 높아졌습니다.\n\n## 스터디코어 추천 전략\n\n1. **내신 관리를 최우선으로** — 교과 전형 확대에 대비\n2. **세특 준비는 1학기부터** — 미루면 늦습니다\n3. **면접 대비 조기 시작** — 논술 축소, 면접 강화 트렌드\n\n> 구조적 학습 관리가 입시의 승패를 가릅니다.\n\n자세한 상담은 스터디코어에서 받아보세요.',
    '올해 수시 전형의 핵심 변경사항 3가지와 스터디코어가 추천하는 대비 전략을 정리했습니다. 내신 관리, 세특, 면접 준비의 골든타임을 놓치지 마세요.',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&h=675&fit=crop',
    ARRAY['입시정보', '수시'],
    true,
    v_author_id,
    NOW() - INTERVAL '1 day'
  );

  -- 2. Side 카드용
  INSERT INTO public.blog_posts (title, slug, content, excerpt, thumbnail_url, tags, is_published, author_id, published_at)
  VALUES (
    '시간표 없이 공부하면 망하는 이유',
    'dummy-why-timetable-matters',
    E'## 자기주도학습의 첫걸음은 시간표\n\n"자기주도학습을 한다"고 하면서 시간표 없이 공부하는 학생들이 많습니다. 하지만 이것은 자기주도학습이 아니라 "느낌 공부"입니다.\n\n### 느낌 공부의 함정\n\n- 하고 싶은 과목만 한다\n- 어려운 부분을 회피한다\n- 실제 공부 시간이 체감보다 훨씬 적다\n\n### 교시제의 힘\n\n스터디코어의 교시제 시스템은 학생이 스스로 시간표를 구성하되, 멘토가 균형을 잡아주는 구조입니다.\n\n시간표가 있으면:\n1. 과목 편식을 방지합니다\n2. 집중-휴식 사이클이 생깁니다\n3. 학습량을 객관적으로 측정할 수 있습니다',
    '자기주도학습의 첫걸음은 시간표입니다. 교시제가 왜 효과적인지 알아보세요.',
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop',
    ARRAY['학습팁', '자기주도학습'],
    true,
    v_author_id,
    NOW() - INTERVAL '3 days'
  );

  INSERT INTO public.blog_posts (title, slug, content, excerpt, thumbnail_url, tags, is_published, author_id, published_at)
  VALUES (
    '스터디코어 3월 신규 프로그램 안내',
    'dummy-march-new-program',
    E'## 3월 새로운 프로그램을 소개합니다\n\n안녕하세요, 스터디코어입니다.\n\n3월부터 새롭게 시작되는 프로그램을 안내드립니다.\n\n### 1. 주말 수학 클리닉\n\n매주 토요일 오전 10시~12시, 한 주간 풀지 못한 수학 문제를 멘토와 함께 해결합니다.\n\n### 2. 월간 학습 리포트\n\n매월 말 학부모님께 학생의 학습 현황 리포트를 발송합니다.\n\n### 3. 독서실 이용 시간 확대\n\n평일 야간 자습 시간이 23시까지로 연장됩니다.\n\n자세한 내용은 상담을 통해 안내받으실 수 있습니다.',
    '주말 수학 클리닉, 월간 학습 리포트, 야간 자습 연장 등 3월 신규 프로그램을 안내합니다.',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop',
    ARRAY['소식', '프로그램'],
    true,
    v_author_id,
    NOW() - INTERVAL '5 days'
  );

  -- 3. Compact 그리드용 (4~10번째)
  INSERT INTO public.blog_posts (title, slug, content, excerpt, thumbnail_url, tags, is_published, author_id, published_at)
  VALUES (
    '내신 1등급을 만드는 학습 루틴',
    'dummy-grade-1-routine',
    E'## 상위 1%의 비밀은 루틴\n\n내신 1등급 학생들의 공통점은 타고난 머리가 아니라 반복 가능한 루틴입니다.\n\n### 아침 루틴\n- 전날 복습 노트 10분 읽기\n- 오늘의 학습 목표 3가지 적기\n\n### 저녁 루틴\n- 오답노트 정리\n- 내일 시간표 확인',
    '내신 1등급 학생들의 공통 루틴을 분석했습니다.',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=375&fit=crop',
    ARRAY['학습팁'],
    true,
    v_author_id,
    NOW() - INTERVAL '7 days'
  );

  INSERT INTO public.blog_posts (title, slug, content, excerpt, thumbnail_url, tags, is_published, author_id, published_at)
  VALUES (
    '겨울방학 학습 플래너 활용법',
    'dummy-winter-planner',
    E'## 겨울방학, 플래너가 답이다\n\n긴 방학은 플래너 없이는 흘러갑니다. 효과적인 플래너 활용법을 소개합니다.\n\n1. 주간 목표를 먼저 세운다\n2. 일일 계획은 전날 저녁에\n3. 달성률을 매일 기록한다',
    '겨울방학을 알차게 보내는 플래너 활용 팁.',
    NULL,
    ARRAY['학습팁', '방학'],
    true,
    v_author_id,
    NOW() - INTERVAL '10 days'
  );

  INSERT INTO public.blog_posts (title, slug, content, excerpt, thumbnail_url, tags, is_published, author_id, published_at)
  VALUES (
    '수학 오답노트, 이렇게 쓰세요',
    'dummy-math-wrong-note',
    E'## 오답노트의 기술\n\n단순히 틀린 문제를 옮겨 적는 것은 오답노트가 아닙니다.\n\n### 효과적인 오답노트 작성법\n\n1. **왜 틀렸는지** 한 줄로 적기\n2. **어떤 개념이 부족했는지** 교과서 페이지 기록\n3. **3일 후 다시 풀어보기** 표시',
    '오답노트를 제대로 쓰는 3단계 방법.',
    'https://images.unsplash.com/photo-1596496050827-8299e0220de1?w=600&h=375&fit=crop',
    ARRAY['학습팁', '수학'],
    true,
    v_author_id,
    NOW() - INTERVAL '12 days'
  );

  INSERT INTO public.blog_posts (title, slug, content, excerpt, thumbnail_url, tags, is_published, author_id, published_at)
  VALUES (
    '광주 광산구 학원가 지도: 스터디코어 주변 편의시설',
    'dummy-around-studycore',
    E'## 스터디코어 주변 안내\n\n스터디코어는 광주 광산구 임방울대로 330 애플타워 10층에 위치해 있습니다.\n\n### 편의시설\n- 1층 편의점 (GS25)\n- 도보 3분 거리 카페\n- 건물 내 무료 주차장\n\n### 교통\n- 버스: 임방울대로 정류장 하차\n- 자가용: 건물 내 주차 가능',
    '스터디코어 주변 편의시설과 교통 안내.',
    NULL,
    ARRAY['소식'],
    true,
    v_author_id,
    NOW() - INTERVAL '15 days'
  );

  INSERT INTO public.blog_posts (title, slug, content, excerpt, thumbnail_url, tags, is_published, author_id, published_at)
  VALUES (
    '정시 vs 수시, 우리 아이에게 맞는 전형은?',
    'dummy-jeongsi-vs-susi',
    E'## 전형 선택의 기준\n\n정시와 수시, 어떤 전형이 유리한지는 학생마다 다릅니다.\n\n### 수시가 유리한 학생\n- 내신이 안정적 (1~3등급)\n- 비교과 활동 경험 풍부\n- 면접에 강한 편\n\n### 정시가 유리한 학생\n- 모의고사 성적이 내신보다 높음\n- 시험 당일 집중력이 좋음\n- 특정 과목에서 강점\n\n스터디코어에서는 학생별 맞춤 전형 분석을 제공합니다.',
    '정시와 수시, 학생 유형별 유리한 전형을 분석합니다.',
    'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&h=375&fit=crop',
    ARRAY['입시정보'],
    true,
    v_author_id,
    NOW() - INTERVAL '18 days'
  );

  INSERT INTO public.blog_posts (title, slug, content, excerpt, thumbnail_url, tags, is_published, author_id, published_at)
  VALUES (
    '멘토가 알려주는 국어 비문학 독해법',
    'dummy-korean-reading-tips',
    E'## 비문학, 구조를 읽어라\n\n비문학 지문은 내용을 이해하려 하면 안 됩니다. 구조를 파악해야 합니다.\n\n### 3단계 독해법\n\n1. **첫 문장에서 주제 파악** — 첫 문단 첫 문장이 핵심\n2. **문단별 키워드 1개** — 옆에 메모\n3. **그러나/하지만 뒤가 핵심** — 역접 접속사 표시\n\n이 방법으로 연습하면 비문학 풀이 시간이 절반으로 줄어듭니다.',
    '비문학 지문을 빠르고 정확하게 읽는 3단계 독해법.',
    NULL,
    ARRAY['학습팁', '국어'],
    true,
    v_author_id,
    NOW() - INTERVAL '20 days'
  );

  INSERT INTO public.blog_posts (title, slug, content, excerpt, thumbnail_url, tags, is_published, author_id, published_at)
  VALUES (
    '스터디코어 재원생 후기: "구조가 있으니까 공부가 됩니다"',
    'dummy-student-review',
    E'## 재원생 인터뷰\n\n> "처음에는 교시제가 답답했는데, 한 달 지나니까 이게 없으면 불안해요."\n> — 고2 김○○ 학생\n\n### Q. 스터디코어 입소 전과 후, 가장 달라진 점은?\n\n"시간을 쓰는 방식이 완전히 바뀌었어요. 예전에는 하루에 국어만 5시간 하고 수학은 안 한 적도 있었는데, 지금은 교시제 덕분에 균형 있게 공부해요."\n\n### Q. 멘토 질문방은 어떤가요?\n\n"모르는 문제를 사진 찍어 올리면 멘토 선생님이 바로 설명해주세요. 학원 안 다녀도 될 정도예요."',
    '재원생이 직접 말하는 스터디코어 경험담.',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=375&fit=crop',
    ARRAY['후기'],
    true,
    v_author_id,
    NOW() - INTERVAL '22 days'
  );

  RAISE NOTICE '블로그 더미 데이터 10개 생성 완료 (author_id: %)', v_author_id;
END $$;
