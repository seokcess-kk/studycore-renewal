"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";

const features = [
  {
    number: "01",
    keyword: "시스템",
    title: "교시제 관리 시스템",
    description:
      "하루가 교시 단위로 운영됩니다. 시작 종이 울리면 자리에 앉고, 쉬는 시간에만 이동이 허용됩니다. 스스로 집중력을 만들려 애쓰지 않아도 되고, <strong>앉아있는 시간 자체가 실력으로 쌓입니다.</strong>",
    tags: [
      { label: "핵심 시스템", primary: true },
      { label: "매일 운영", primary: false },
    ],
  },
  {
    number: "02",
    keyword: "멘토링",
    title: "수학 전문 질문방",
    description:
      "재원생 전용 질문방에 모르는 문제를 사진이나 텍스트로 올리면 국희재 수학학원 멘토가 직접 풀이를 설명합니다. 그날 모른 것을 그날 해결하니, <strong>오개념이 쌓이지 않고 다음 날 더 단단하게 시작할 수 있습니다.</strong>",
    tags: [
      { label: "재원생 전용", primary: true },
      { label: "수학 멘토", primary: false },
    ],
  },
  {
    number: "03",
    keyword: "생활 관리",
    title: "생활·출결 관리",
    description:
      "출결 관리, 교시 중 휴대폰 수거, 상시 순찰로 집중을 방해하는 모든 요소를 차단합니다. 규정이 일관되게 지켜지기 때문에 <strong>학생 스스로도 공부 외의 것에 신경 쓸 이유가 없어집니다.</strong>",
    tags: [
      { label: "출결 관리", primary: false },
      { label: "휴대폰 수거", primary: false },
      { label: "상시 순찰", primary: false },
    ],
  },
  {
    number: "04",
    keyword: "콘텐츠",
    title: "검증된 학습 자료",
    description:
      "대치동 기반의 검증된 학습 자료를 제공합니다. 내신과 수능 대비 콘텐츠를 체계적으로 활용할 수 있어, <strong>무엇을 공부해야 할지 헤매는 시간 없이 바로 집중할 수 있습니다.</strong>",
    tags: [
      { label: "내신·수능", primary: true },
      { label: "대치동 자료", primary: false },
    ],
  },
  {
    number: "05",
    keyword: "환경",
    title: "쾌적한 학습 환경",
    description:
      "애플타워 10층 전층을 사용합니다. 인체공학 칸막이 책상, 냉난방 완비, 자습실과 분리된 별도 휴게 공간을 갖추고 있어 <strong>공부 외의 불편함 없이 오직 학습에만 에너지를 쏟을 수 있습니다.</strong>",
    tags: [
      { label: "전층 운영", primary: false },
      { label: "공간 최적화", primary: false },
    ],
  },
  {
    number: "06",
    keyword: "원장 직영",
    title: "원장 직접 1:1 맞춤 관리",
    description:
      "원장님이 모든 학생의 이름과 상황을 직접 파악합니다. 대형 체인과 달리 관리의 책임이 한 사람에게 있어, <strong>학부모님도 누가 관리하는지 명확히 알고 안심할 수 있습니다.</strong>",
    tags: [
      { label: "원장 직영", primary: true },
      { label: "직접 관리", primary: false },
    ],
  },
];

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <section id="features" className="bg-stone py-28 section-container">
      {/* 헤더 */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="mb-0 flex flex-col md:flex-row md:items-baseline gap-5 border-b-[1.5px] border-ink pb-10"
      >
        <span className="font-mono text-[10px] font-bold text-teal tracking-[0.28em] uppercase whitespace-nowrap">
          Why Studycore / 02
        </span>
        <h2 className="font-serif text-[clamp(32px,5vw,60px)] font-black tracking-[-0.03em] text-ink leading-none">
          6가지 차별점
        </h2>
        <div className="flex-1" />
        <p className="text-[13px] text-muted font-light max-w-[240px] md:text-right leading-[1.8]">
          스터디코어에서만 경험할 수 있는 것들입니다.
        </p>
      </motion.div>

      {/* 특징 행들 */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col"
      >
        {features.map((feature) => (
          <FeatureRow key={feature.number} feature={feature} />
        ))}
      </motion.div>

      {/* 인라인 CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t-[1.5px] border-ink pt-10"
      >
        <p className="text-[14px] text-[#555] font-light leading-[1.8]">
          직접 경험해 보세요 — 무료 상담으로 시작할 수 있습니다.
        </p>
        <Link
          href={ROUTES.CONSULT}
          className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-navy text-white text-[13px] font-bold tracking-[0.04em] border-[1.5px] border-navy hover:bg-transparent hover:text-navy transition-all duration-200 flex-shrink-0"
        >
          상담 신청하기
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform duration-200"
          />
        </Link>
      </motion.div>
    </section>
  );
}

function FeatureRow({
  feature,
}: {
  feature: (typeof features)[0];
}) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  return (
    <motion.div
      variants={itemVariants}
      className="group grid grid-cols-[100px_1fr] md:grid-cols-[160px_1fr] border-b border-rule relative"
    >
      {/* 호버 배경 & 좌측 엑센트 보더 */}
      <div className="absolute left-[-24px] right-[-24px] top-0 bottom-0 bg-transparent group-hover:bg-teal/[0.04] border-l-[3px] border-transparent group-hover:border-teal transition-all duration-300 pointer-events-none" />

      {/* 좌측: 번호 + 키워드 */}
      <div className="py-11 flex flex-col gap-2 border-r border-rule relative">
        <span className="font-mono text-[clamp(48px,6vw,72px)] font-bold text-navy/[0.07] group-hover:text-teal/20 leading-none transition-colors duration-300">
          {feature.number}
        </span>
        <span className="font-mono text-[9px] font-bold text-teal tracking-[0.22em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-250">
          {feature.keyword}
        </span>
      </div>

      {/* 우측: 제목 + 설명 + 태그 */}
      <div className="py-11 pl-6 md:pl-12 relative">
        <h3 className="font-serif text-[clamp(18px,2vw,24px)] font-black tracking-[-0.02em] text-ink mb-3.5 leading-tight">
          {feature.title}
        </h3>
        <p
          className="text-[13.5px] leading-[2] text-[#555] font-light max-w-[640px] mb-4 [&_strong]:text-navy [&_strong]:font-bold"
          dangerouslySetInnerHTML={{ __html: feature.description }}
        />
        <div className="flex gap-1.5 flex-wrap">
          {feature.tags.map((tag) => (
            <span
              key={tag.label}
              className={`text-[10.5px] font-medium px-2.5 py-0.5 border ${
                tag.primary
                  ? "border-teal text-teal bg-teal/[0.06]"
                  : "border-rule text-muted"
              }`}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
