"use client";

import { GuidePageLayout } from "@/components/guide/GuidePageLayout";

export default function GuidePage() {
  return (
    <GuidePageLayout
      type="onboarding"
      title="조교 온보딩 가이드"
      subtitle="업무에 필요한 정보를 확인하세요."
      label="Onboarding Guide"
      emptyMessage="아직 등록된 가이드가 없습니다."
    />
  );
}
