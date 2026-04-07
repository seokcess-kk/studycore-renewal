import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "블로그",
  description:
    "스터디코어 1.0 블로그. 자기주도학습 노하우, 관리형 학습공간 운영 이야기, 학습 팁을 공유합니다.",
  alternates: {
    canonical: "https://studycore.kr/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
