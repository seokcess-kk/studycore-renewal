"use client";

import { Fragment } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";

const features = [
  {
    number: "01",
    keyword: "시스템",
    title: "교시제 운영 시스템",
    description:
      "하루 일과는 교시 단위로 운영됩니다.<br />정해진 시간에 학습을 시작하고, 정해진 시간에만 이동이 허용됩니다.<br />집중이 유지되는 시간 구조로 설계되어<br /><strong>학습 몰입도를 안정적으로 유지합니다.</strong>",
    tags: [
      { label: "핵심 시스템", primary: true },
      { label: "시간 구조 설계", primary: false },
    ],
  },
  {
    number: "02",
    keyword: "통제",
    title: "출결·통제 시스템",
    description:
      "턴게이트 기반 입출입 시스템을 통해<br />입실·퇴실·외출이 실시간으로 기록되며 보호자에게 즉시 전달됩니다.<br />관리자 상주 하에 학습 시간 이탈을 방지하고<br /><strong>학습 상태가 투명하게 관리됩니다.</strong>",
    tags: [
      { label: "턴게이트", primary: true },
      { label: "실시간 기록", primary: false },
    ],
  },
  {
    number: "03",
    keyword: "관리",
    title: "생활 관리 시스템",
    description:
      "교시 시작 전 휴대폰을 별도 보관하고<br />자습실 내 대화·통화·음식 섭취를 제한하며<br />지정된 좌석에서만 학습이 가능합니다.<br /><strong>학습 집중을 방해하는 행동 요소를 원천 차단합니다.</strong>",
    tags: [
      { label: "휴대폰 수거", primary: false },
      { label: "자습실 정숙", primary: false },
      { label: "지정석", primary: false },
    ],
  },
  {
    number: "04",
    keyword: "집중",
    title: "집중 유지 시스템",
    description:
      "교시 중 관리자 상시 순찰을 통해 졸음·이탈 등을 즉시 관리하며<br />태블릿 방화벽으로 학습 방해 사이트 접근을 제한합니다.<br />백색소음 시스템으로 균일한 환경을 조성하여<br /><strong>집중이 흐트러질 틈을 차단합니다.</strong>",
    tags: [
      { label: "상시 순찰", primary: false },
      { label: "방화벽", primary: false },
      { label: "백색소음", primary: false },
    ],
  },
  {
    number: "05",
    keyword: "환경",
    title: "학습 환경 설계 시스템",
    description:
      "인체공학적 데스크와 조명 설계를 통해<br />장시간 학습에도 피로도를 최소화하며<br />냉난방 시스템과 공기질 관리로<br /><strong>항상 쾌적한 학습 환경을 유지합니다.</strong>",
    tags: [
      { label: "공간 설계", primary: false },
      { label: "쾌적 환경", primary: false },
    ],
  },
  {
    number: "06",
    keyword: "운영",
    title: "운영 관리 시스템",
    description:
      "대표원장을 포함한 운영진이 직접 관리 체계를 유지하며<br />관리자(메디컬 재학생, 최상위권 출신)와 함께<br />학습 환경을 상시 점검하고 개선합니다.<br /><strong>관리의 수준이 학습 환경을 결정합니다.</strong>",
    tags: [
      { label: "대표원장", primary: true },
      { label: "운영진 관리", primary: false },
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
    <section id="features" className="bg-stone section-lg">
      <div className="section-container">
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
          <span className="font-mono text-label font-bold text-teal tracking-label uppercase whitespace-nowrap">
            Why Studycore / 01
          </span>
          <h2 className="font-serif text-fluid-h1 font-black tracking-heading text-ink leading-none">
            6가지 차별점
          </h2>
          <div className="flex-1" />
          <p className="text-secondary text-muted font-light max-w-[240px] md:text-right leading-prose">
            스터디코어에서 경험할 수 있는 것들입니다.
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
          {features.map((feature, index) => (
            <Fragment key={feature.number}>
              <FeatureRow feature={feature} />
              {/* 3행 뒤 시각적 브레이크 — 반복 피로 완화 */}
              {index === 2 && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { duration: 0.6 } },
                  }}
                  className="py-12 md:py-16 px-6 md:px-16 border-b border-ink/[0.06] flex items-center gap-6 md:gap-10"
                >
                  <span className="block w-10 h-[1.5px] bg-teal flex-shrink-0" />
                  <p className="font-serif text-fluid-h3 font-bold text-ink/60 leading-ui tracking-heading">
                    &ldquo;공부를 <em className="text-teal not-italic">구조</em>로
                    뒷받침하면, 의지만으로 안 되던 것도 됩니다.&rdquo;
                  </p>
                </motion.div>
              )}
            </Fragment>
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
          <p className="text-body text-ink/70 font-light leading-prose">
            직접 경험해 보세요 — 무료 상담으로 시작할 수 있습니다.
          </p>
          <Link
            href={ROUTES.CONSULT}
            className="cta-fill cta-fill-navy group inline-flex items-center gap-2.5 px-8 py-3.5 text-white text-secondary font-bold tracking-cta border-[1.5px] border-navy hover:text-navy transition-colors duration-300 flex-shrink-0"
          >
            상담 신청하기
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </Link>
        </motion.div>
      </div>
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
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
  };

  return (
    <motion.div
      variants={itemVariants}
      className="group grid grid-cols-[100px_1fr] md:grid-cols-[160px_1fr] border-b border-ink/[0.06] hover:border-ink/[0.15] relative transition-[border-color] duration-300 ease-out"
    >
      {/* 호버 배경 & 좌측 엑센트 보더 — scaleY 애니메이션 */}
      <div className="absolute left-[-24px] right-[-24px] top-0 bottom-0 bg-transparent group-hover:bg-teal/[0.04] transition-[background-color] duration-300 pointer-events-none" />
      <div className="absolute left-[-24px] top-0 bottom-0 w-[3px] bg-teal origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out pointer-events-none" />

      {/* 좌측: 번호 + 키워드 */}
      <div className="py-11 flex flex-col gap-2 border-r border-rule relative">
        <span className="font-mono text-[clamp(48px,6vw,72px)] font-bold text-navy/[0.07] group-hover:text-teal/20 leading-none transition-[color,transform] duration-300 ease-out group-hover:scale-110 origin-left">
          {feature.number}
        </span>
        <span className="font-mono text-label font-bold text-teal tracking-label uppercase opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-[opacity,transform] duration-300 ease-out">
          {feature.keyword}
        </span>
      </div>

      {/* 우측: 제목 + 설명 + 태그 */}
      <div className="py-11 pl-6 md:pl-12 relative">
        <h3 className="font-serif text-fluid-h3 font-black tracking-heading text-ink group-hover:text-teal mb-3.5 leading-tight transition-colors duration-300 ease-out">
          {feature.title}
        </h3>
        <p
          className="text-body leading-prose text-ink/70 font-light max-w-[640px] mb-4 [&_strong]:text-navy [&_strong]:font-bold"
          dangerouslySetInnerHTML={{ __html: feature.description }}
        />
        <div className="flex gap-1.5 flex-wrap">
          {feature.tags.map((tag) => (
            <span
              key={tag.label}
              className={`text-caption font-medium px-2.5 py-0.5 border ${tag.primary
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
