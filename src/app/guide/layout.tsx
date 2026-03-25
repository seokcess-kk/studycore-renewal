import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용 안내",
  description:
    "스터디코어 1.0 이용 안내. 교시제 시간표, 생활 규정, 벌점 제도, 등록 절차를 확인하세요.",
  alternates: {
    canonical: "https://studycore.kr/guide",
  },
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
