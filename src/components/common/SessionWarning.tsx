"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import { Button } from "./Button";
import { SESSION } from "@/lib/constants";
import { logger } from "@/lib/logger";

export function SessionWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  // 세션 만료 시간 확인
  const checkSession = useCallback(async () => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.expires_at) {
        setShowWarning(false);
        return;
      }

      const expiresAt = session.expires_at * 1000; // 초 → 밀리초
      const now = Date.now();
      const remaining = expiresAt - now;

      if (remaining <= SESSION.WARNING_BEFORE_EXPIRY && remaining > 0) {
        setShowWarning(true);
        setTimeLeft(Math.floor(remaining / 1000 / 60)); // 분 단위
      } else {
        setShowWarning(false);
        setTimeLeft(null);
      }
    } catch (error) {
      logger.debug("세션 체크 실패", { context: "SessionWarning.checkSession", data: error });
    }
  }, [isAuthenticated]);

  // 세션 연장
  const handleExtendSession = async () => {
    setIsRefreshing(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.refreshSession();

      if (!error) {
        setShowWarning(false);
        setTimeLeft(null);
      }
    } catch (error) {
      logger.debug("세션 연장 실패", { context: "SessionWarning.handleExtendSession", data: error });
    } finally {
      setIsRefreshing(false);
    }
  };

  // 주기적 체크
  useEffect(() => {
    if (!isAuthenticated) return;

    // 초기 체크
    checkSession();

    // 1분마다 체크
    const interval = setInterval(checkSession, SESSION.CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkSession]);

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[400] max-w-sm border border-rule bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-ink">세션 만료 예정</h4>
          <p className="text-xs text-muted mt-1">
            {timeLeft !== null
              ? `약 ${timeLeft}분 후 자동 로그아웃됩니다.`
              : "곧 자동 로그아웃됩니다."}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleExtendSession}
              disabled={isRefreshing}
            >
              {isRefreshing ? "연장 중..." : "세션 연장"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWarning(false)}
            >
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
