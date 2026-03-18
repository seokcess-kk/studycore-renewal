"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";

/** 활성 도시락 기간 존재 여부 전역 store */
const useMealPeriodStore = create<{
  hasActivePeriod: boolean;
  checked: boolean;
  setHasActivePeriod: (v: boolean) => void;
}>((set) => ({
  hasActivePeriod: false,
  checked: false,
  setHasActivePeriod: (v) => set({ hasActivePeriod: v, checked: true }),
}));

/**
 * 활성 도시락 기간이 존재하는지 반환하는 훅
 * 재원생(student)만 체크, 한 번 확인 후 캐시
 */
export function useActiveMealPeriod(): boolean {
  const isStaff = useUserStore((state) => state.isStaff);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isLoading = useUserStore((state) => state.isLoading);
  const hasActivePeriod = useMealPeriodStore((state) => state.hasActivePeriod);
  const checked = useMealPeriodStore((state) => state.checked);
  const setHasActivePeriod = useMealPeriodStore(
    (state) => state.setHasActivePeriod
  );

  useEffect(() => {
    if (isLoading || !isAuthenticated || isStaff || checked) return;

    const supabase = createClient();
    const today = new Date()
      .toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

    supabase
      .from("lunch_periods")
      .select("id")
      .eq("is_active", true)
      .lte("apply_start_date", today)
      .gte("apply_end_date", today)
      .limit(1)
      .then(({ data }) => {
        setHasActivePeriod(!!(data && data.length > 0));
      });
  }, [isLoading, isAuthenticated, isStaff, checked, setHasActivePeriod]);

  return hasActivePeriod;
}
