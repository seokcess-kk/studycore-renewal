"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  GuideSectionForm,
  type GuideSectionFormValues,
} from "@/components/admin/GuideSectionForm";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import { createSection } from "@/domains/guide/service";
import type { GuideSectionType } from "@/domains/guide/model";

export default function AdminGuideNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();
  const { showToast } = useToast();

  const sectionType = (searchParams.get("type") || "onboarding") as GuideSectionType;

  const resolveCategory = (data: GuideSectionFormValues) =>
    data.category === "__custom__"
      ? data.customCategory?.trim() || "일반"
      : data.category || "일반";

  const handleSubmit = async (data: GuideSectionFormValues) => {
    if (!data.title?.trim()) {
      showToast("제목을 입력해주세요.", "error");
      return;
    }
    if (!data.content?.trim() && !data.content_html) {
      showToast("내용을 입력해주세요.", "error");
      return;
    }

    const result = await createSection(supabase, {
      title: data.title,
      content: data.content || data.title,
      type: sectionType,
      category: resolveCategory(data),
      icon: data.icon,
      content_html: data.content_html || null,
      attachments: data.attachments || [],
    });

    if (result.success) {
      showToast("섹션이 추가되었습니다.", "success");
      router.push(`/admin/guide?type=${sectionType}`);
    } else {
      showToast(result.error || "섹션 추가에 실패했습니다.", "error");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/guide?type=${sectionType}`}
          className="text-muted hover:text-ink transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-serif text-fluid-h2 font-bold text-ink">
          {sectionType === "onboarding" ? "조교 온보딩" : "재원생 매뉴얼"} — 새 섹션
        </h1>
      </div>

      <GuideSectionForm
        mode="add"
        sectionType={sectionType}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/admin/guide?type=${sectionType}`)}
      />
    </div>
  );
}
