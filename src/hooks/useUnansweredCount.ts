"use client";

import { useEffect, useRef } from "react";
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import { fetchUnansweredCount } from "@/domains/question/service";

/** 미답변 질문 수 전역 store (폴링 인스턴스 1개 보장) */
const useCountStore = create<{
  count: number;
  setCount: (n: number) => void;
}>((set) => ({
  count: 0,
  setCount: (n) => set({ count: n }),
}));

let pollingStarted = false;

/**
 * 미답변 질문 수를 반환하는 훅 (admin/mentor 전용)
 * 전역 store + 단일 폴링으로 중복 API 호출 방지
 */
export function useUnansweredCount() {
  const canAccessAdmin = useUserStore((state) => state.canAccessAdmin);
  const isLoading = useUserStore((state) => state.isLoading);
  const count = useCountStore((state) => state.count);
  const setCount = useCountStore((state) => state.setCount);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading || !canAccessAdmin) {
      return;
    }

    // 이미 다른 인스턴스에서 폴링 중이면 스킵
    if (pollingStarted) return;
    pollingStarted = true;

    const supabase = createClient();

    const doFetch = async () => {
      const result = await fetchUnansweredCount(supabase);
      setCount(result);
    };

    doFetch();
    intervalRef.current = setInterval(doFetch, 60_000);

    return () => {
      pollingStarted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [canAccessAdmin, isLoading, setCount]);

  return canAccessAdmin ? count : 0;
}
