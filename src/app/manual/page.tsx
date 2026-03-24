"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import { GuidePageLayout } from "@/components/guide/GuidePageLayout";
import type { GuideSectionType } from "@/domains/guide/model";

const TAB_CONFIG = {
  manual: {
    type: "manual" as const,
    title: "이용 매뉴얼",
    subtitle: "독서실 이용에 필요한 정보를 안내합니다.",
    label: "Manual",
    emptyMessage: "아직 등록된 매뉴얼이 없습니다.",
  },
  onboarding: {
    type: "onboarding" as const,
    title: "조교 온보딩 가이드",
    subtitle: "업무에 필요한 정보를 확인하세요.",
    label: "Onboarding Guide",
    emptyMessage: "아직 등록된 가이드가 없습니다.",
  },
};

function ManualContent() {
  const isStaff = useUserStore((state) => state.isStaff);
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab: GuideSectionType =
    isStaff && searchParams.get("tab") === "onboarding"
      ? "onboarding"
      : "manual";

  const config = TAB_CONFIG[activeTab];

  const handleTabChange = (value: GuideSectionType) => {
    if (value === "onboarding") {
      router.replace("/manual?tab=onboarding", { scroll: false });
    } else {
      router.replace("/manual", { scroll: false });
    }
  };

  return (
    <GuidePageLayout
      key={activeTab}
      {...config}
      tabs={
        isStaff
          ? {
              items: [
                { value: "manual", label: "이용 매뉴얼" },
                { value: "onboarding", label: "온보딩 가이드" },
              ],
              active: activeTab,
              onChange: handleTabChange,
            }
          : undefined
      }
    />
  );
}

export default function ManualPage() {
  return (
    <Suspense>
      <ManualContent />
    </Suspense>
  );
}
