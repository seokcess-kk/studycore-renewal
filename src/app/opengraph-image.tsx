import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "스터디코어 1.0 — 광주 광산구 관리형 학습공간";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0A1F35",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* 로고 텍스트 */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: "-2px",
            marginBottom: 8,
            display: "flex",
            alignItems: "baseline",
            gap: 16,
          }}
        >
          <span>STUDY CORE</span>
          <span style={{ color: "#57ADB1", fontSize: 64 }}>1.0</span>
        </div>

        {/* 구분선 */}
        <div
          style={{
            width: 120,
            height: 3,
            backgroundColor: "#57ADB1",
            marginTop: 16,
            marginBottom: 24,
          }}
        />

        {/* 슬로건 */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 400,
            opacity: 0.9,
            marginBottom: 12,
          }}
        >
          구조가 성적을 만든다
        </div>

        {/* 부가 설명 */}
        <div
          style={{
            fontSize: 22,
            opacity: 0.5,
            marginBottom: 8,
          }}
        >
          광주 광산구 관리형 학습공간
        </div>

        {/* 키워드 */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 20,
            fontSize: 18,
            color: "#57ADB1",
            opacity: 0.7,
          }}
        >
          <span>교시제 시스템</span>
          <span>·</span>
          <span>수학 멘토 질문방</span>
          <span>·</span>
          <span>원장 직접 관리</span>
        </div>

        {/* 하단 URL */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            fontSize: 16,
            opacity: 0.3,
          }}
        >
          studycore.kr
        </div>
      </div>
    ),
    { ...size }
  );
}
