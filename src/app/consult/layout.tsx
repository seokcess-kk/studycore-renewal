import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "무료 상담 신청",
  description:
    "스터디코어 1.0 무료 상담 신청. 광주 광산구 관리형 독서실 등록 상담, 시설 견학, 프로그램 안내를 받아보세요.",
  alternates: {
    canonical: "https://studycore.kr/consult",
  },
};

export default function ConsultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
