"use client";

import { GuidePageLayout } from "@/components/guide/GuidePageLayout";

export default function ManualPage() {
  return (
    <GuidePageLayout
      type="manual"
      title="이용 매뉴얼"
      subtitle="독서실 이용에 필요한 정보를 안내합니다."
      label="Manual"
      emptyMessage="아직 등록된 매뉴얼이 없습니다."
    />
  );
}
