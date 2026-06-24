"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import { LandingForm } from "@/components/admin/LandingForm";
import { createLanding } from "@/domains/landing/service";
import type { CreateLandingInput } from "@/domains/landing/model";

export default function AdminLandingNewPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const handleCreate = async (data: CreateLandingInput) => {
    const result = await createLanding(supabase, data);
    if (result.success) {
      toast({ variant: "success", description: "랜딩페이지가 등록되었습니다." });
      router.push("/admin/landings");
    } else {
      toast({ variant: "error", description: result.error || "등록 실패" });
    }
  };

  return <LandingForm onSubmit={handleCreate} />;
}
