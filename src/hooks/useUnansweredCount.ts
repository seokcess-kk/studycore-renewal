"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import { fetchUnansweredCount } from "@/domains/question/service";

/**
 * 미답변 질문 수를 폴링하는 훅 (admin/mentor 전용)
 * 마운트 시 즉시 조회 + 60초 간격 폴링
 */
export function useUnansweredCount() {
  const [count, setCount] = useState(0);
  const canAccessAdmin = useUserStore((state) => state.canAccessAdmin);
  const isLoading = useUserStore((state) => state.isLoading);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading || !canAccessAdmin) {
      setCount(0);
      return;
    }

    const supabase = createClient();

    const fetch = async () => {
      const result = await fetchUnansweredCount(supabase);
      setCount(result);
    };

    fetch();
    intervalRef.current = setInterval(fetch, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [canAccessAdmin, isLoading]);

  return count;
}
