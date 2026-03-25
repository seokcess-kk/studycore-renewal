"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  GuideSectionForm,
  type GuideSectionFormValues,
} from "@/components/admin/GuideSectionForm";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import { getSectionDetail, updateSection } from "@/domains/guide/service";
import type { GuideSection } from "@/domains/guide/model";

export default function AdminGuideEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createBrowserClient();
  const { showToast } = useToast();

  const [section, setSection] = useState<GuideSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getSectionDetail(supabase, id);
      if (result.success && result.section) {
        setSection(result.section);
      } else {
        showToast("섹션을 찾을 수 없습니다.", "error");
        router.push("/admin/guide");
      }
      setIsLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const resolveCategory = (data: GuideSectionFormValues) =>
    data.category === "__custom__"
      ? data.customCategory?.trim() || "일반"
      : data.category || "일반";

  const handleSubmit = async (data: GuideSectionFormValues) => {
    const result = await updateSection(supabase, id, {
      title: data.title,
      content: data.content || data.title,
      category: resolveCategory(data),
      icon: data.icon,
      content_html: data.content_html || null,
      is_visible: data.is_visible,
      attachments: data.attachments || [],
    });

    if (result.success) {
      showToast("섹션이 수정되었습니다.", "success");
      router.push(`/admin/guide?type=${section?.type || "onboarding"}`);
    } else {
      showToast(result.error || "섹션 수정에 실패했습니다.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted" />
        <p className="mt-4 text-muted">로딩 중...</p>
      </div>
    );
  }

  if (!section) return null;

  const sectionType = section.type || "onboarding";

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
          섹션 수정
        </h1>
      </div>

      <GuideSectionForm
        mode="edit"
        section={section}
        sectionType={sectionType}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/admin/guide?type=${sectionType}`)}
      />
    </div>
  );
}
