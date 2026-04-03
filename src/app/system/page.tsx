import { Metadata } from "next";
import { Nav, Footer } from "@/components/common";
import { SystemPageContent } from "@/components/system/SystemPageContent";

export const metadata: Metadata = {
  title: "운영 시스템",
  description:
    "스터디코어 1.0 운영 시스템 — 교시제 기반 6대 핵심 시스템으로 학습 시간 통제, 집중 환경 유지, 체계적 운영 관리를 수행합니다.",
};

export default function SystemPage() {
  return (
    <>
      <Nav />
      <main className="page-body">
        <SystemPageContent />
      </main>
      <Footer />
    </>
  );
}
