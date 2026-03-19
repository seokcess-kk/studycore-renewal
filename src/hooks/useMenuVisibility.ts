"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { getMenuVisibility } from "@/domains/settings/service";
import type { MenuVisibility } from "@/domains/settings/model";

const DEFAULT_VISIBILITY: MenuVisibility = {
  about: false,
  blog: false,
  reviews: false,
  system: true,
};

/** 메뉴 가시성 전역 store */
const useMenuVisibilityStore = create<{
  visibility: MenuVisibility;
  checked: boolean;
  setVisibility: (v: MenuVisibility) => void;
  markChecked: () => void;
}>((set) => ({
  visibility: DEFAULT_VISIBILITY,
  checked: false,
  setVisibility: (v) => set({ visibility: v, checked: true }),
  markChecked: () => set({ checked: true }),
}));

/**
 * 관리자 설정의 메뉴 가시성을 반환하는 훅
 * 한 번 조회 후 캐시
 */
export function useMenuVisibility(): MenuVisibility {
  const visibility = useMenuVisibilityStore((state) => state.visibility);
  const checked = useMenuVisibilityStore((state) => state.checked);
  const setVisibility = useMenuVisibilityStore((state) => state.setVisibility);
  const markChecked = useMenuVisibilityStore((state) => state.markChecked);

  useEffect(() => {
    if (checked) return;

    const supabase = createClient();
    getMenuVisibility(supabase)
      .then(setVisibility)
      .catch(() => {
        // 실패 시 기본값 유지, 무한 재시도 방지
        markChecked();
      });
  }, [checked, setVisibility, markChecked]);

  return visibility;
}
