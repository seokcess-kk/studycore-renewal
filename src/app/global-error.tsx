"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F4F2EE",
            padding: "24px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            {/* 에러 아이콘 */}
            <div
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "rgba(16, 48, 80, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#103050",
                }}
              >
                !
              </span>
            </div>

            {/* 제목 */}
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#111111",
                marginBottom: "16px",
              }}
            >
              심각한 오류가 발생했습니다
            </h1>

            {/* 설명 */}
            <p
              style={{
                color: "#888888",
                fontSize: "15px",
                lineHeight: "1.6",
                marginBottom: "32px",
              }}
            >
              페이지를 불러오는 중 문제가 발생했습니다.
              <br />
              아래 버튼을 눌러 다시 시도해 주세요.
            </p>

            {/* 버튼 */}
            <button
              onClick={reset}
              style={{
                backgroundColor: "#103050",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: "bold",
                padding: "12px 24px",
                border: "none",
                cursor: "pointer",
              }}
            >
              다시 시도
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
