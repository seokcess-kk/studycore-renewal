"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import { LandingForm } from "@/components/admin/LandingForm";
import { getLandingDetail, updateLanding } from "@/domains/landing/service";
import type { CreateLandingInput, Landing } from "@/domains/landing/model";

export default function AdminLandingEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const [landing, setLanding] = useState<Landing | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getLandingDetail(supabase, id);
      if (result.success && result.landing) {
        setLanding(result.landing);
      } else {
        toast({ variant: "error", description: "랜딩페이지를 찾을 수 없습니다." });
        router.push("/admin/landings");
      }
      setIsLoadingData(false);
    }
    load();
  }, [supabase, id, router, toast]);

  const handleUpdate = async (data: CreateLandingInput) => {
    const result = await updateLanding(supabase, id, data);
    if (result.success) {
      toast({ variant: "success", description: "랜딩페이지가 수정되었습니다." });
      router.push("/admin/landings");
    } else {
      toast({ variant: "error", description: result.error || "수정 실패" });
    }
  };

  if (isLoadingData) {
    return <div className="py-12 text-center text-muted">로딩 중...</div>;
  }
  if (!landing) return null;

  return (
    <LandingForm
      defaultValues={{
        slug: landing.slug,
        name: landing.name,
        html_content: landing.html_content,
        is_active: landing.is_active,
      }}
      onSubmit={handleUpdate}
    />
  );
}
