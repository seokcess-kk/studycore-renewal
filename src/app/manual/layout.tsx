import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사용 매뉴얼",
  description:
    "스터디코어 1.0 홈페이지 사용법. 공지 확인, 질문방 이용, 도시락 신청 등 재원생 서비스 이용 방법을 안내합니다.",
  alternates: {
    canonical: "https://studycore.kr/manual",
  },
};

export default function ManualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
