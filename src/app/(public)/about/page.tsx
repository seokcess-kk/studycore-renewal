import { Nav, Footer } from "@/components/common";
import {
  IntroSection,
  FacilitySection,
  TeamSection,
  LocationSection,
} from "@/components/about";

export const metadata = {
  title: "학원 소개 | 스터디코어",
  description:
    "스터디코어는 학생 개개인의 성장을 위한 관리형 독서실입니다. 학원 소개, 시설 안내, 강사진 소개, 오시는 길을 확인하세요.",
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
