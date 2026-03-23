"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ROUTES, CONTACT } from "@/lib/constants";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 Sentry 등으로 전송)
    console.error("Application Error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone px-6">
      <div className="text-center max-w-md">
        {/* 에러 아이콘 */}
        <div className="w-16 h-16 bg-navy/10 flex items-center justify-center mx-auto mb-6">
          <span className="font-mono text-2xl font-bold text-navy">!</span>
        </div>

        {/* 제목 */}
        <h1 className="font-serif text-2xl font-bold text-ink mb-4">
          문제가 발생했습니다
        </h1>

        {/* 설명 */}
        <p className="text-muted text-reading leading-relaxed mb-8">
          일시적인 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>

        {/* 에러 코드 (개발용) */}
        {process.env.NODE_ENV === "development" && error.digest && (
          <p className="font-mono text-small text-muted/60 mb-6">
            Error ID: {error.digest}
          </p>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center bg-navy text-white text-body font-bold px-6 py-3 hover:bg-navy-dark transition-colors"
          >
            다시 시도
          </button>
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center justify-center border border-rule text-ink text-body font-medium px-6 py-3 hover:border-navy transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>

        {/* 문의 안내 */}
        <p className="mt-8 text-secondary text-muted">
          문제가 계속되면{" "}
          <a
            href={CONTACT.kakaoChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal underline"
          >
            카카오 채널
          </a>
          로 문의해 주세요.
        </p>
      </div>
    </main>
  );
}
