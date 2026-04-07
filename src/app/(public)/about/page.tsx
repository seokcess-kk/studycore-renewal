import type { Metadata } from "next";
import { Nav, Footer } from "@/components/common";
import {
  IntroSection,
  FacilitySection,
  TeamSection,
  LocationSection,
} from "@/components/about";

export const metadata: Metadata = {
  title: "학원 소개",
  description:
    "스터디코어 1.0 학원 소개. 광주 광산구 관리형 학습공간 — 시설 안내, 멘토 소개, 교시제 운영 방식, 오시는 길을 확인하세요.",
  alternates: {
    canonical: "https://studycore.kr/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <IntroSection />
        <FacilitySection />
        <TeamSection />
        <LocationSection />
      </main>
      <Footer />
    </>
  );
}
