import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "수강 후기",
  description:
    "스터디코어 1.0 재원생 및 학부모 후기. 관리형 독서실 실제 이용 경험과 성적 변화를 확인하세요.",
  alternates: {
    canonical: "https://studycore.kr/reviews",
  },
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
