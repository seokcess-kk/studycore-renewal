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
    title: "교시제 관리 시스템",
    description:
      "하루가 교시 단위로 운영됩니다.<br />시작 종이 울리면 자리에 앉고, 쉬는 시간에만 이동이 허용됩니다.<br />스스로 집중력을 만들려 애쓰지 않아도 되고<br /><strong>앉아있는 시간 자체가 실력으로 쌓입니다.</strong>",
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
      "재원생 전용 질문방에 모르는 문제를 사진이나 텍스트로 올리면<br />국희재 수학학원 멘토가 직접 풀이를 설명합니다.<br />그날 모른 것을 그날 해결하니<br /><strong>오개념이 쌓이지 않고 다음 날 더 단단하게 시작할 수 있습니다.</strong>",
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
      "출결 관리, 교시 중 휴대폰 수거, 상시 순찰로<br />집중을 방해하는 모든 요소를 차단합니다.<br />규정이 일관되게 지켜지기 때문에<br /><strong>학생 스스로도 공부 외의 것에 신경 쓸 이유가 없어집니다.</strong>",
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
      "대치동 기반의 검증된 학습 자료를 제공합니다.<br />내신과 수능 대비 콘텐츠를 체계적으로 활용할 수 있어<br /><strong>무엇을 공부해야 할지 헤매는 시간 없이 바로 집중할 수 있습니다.</strong>",
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
      "애플타워 10층 100평대 공간 활용<br />인체공학 칸막이 책상, 냉난방 완비,<br />자습실과 분리된 별도 휴게 공간을 갖추고 있어<br /><strong>공부 외의 불편함 없이 오직 학습에만 에너지를 쏟을 수 있습니다.</strong>",
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
      "원장님이 모든 학생의 이름과 상황을 직접 파악합니다.<br />대형 체인과 달리 관리의 책임이 한 사람에게 있어<br /><strong>학부모님도 누가 관리하는지 명확히 알고 안심할 수 있습니다.</strong>",
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
                    "공부를 <em className="text-teal not-italic">구조</em>로
                    뒷받침하면, 의지만으로 안 되던 것도 됩니다."
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
          <p className="text-body text-[#555] font-light leading-prose">
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
          className="text-body leading-prose text-[#555] font-light max-w-[640px] mb-4 [&_strong]:text-navy [&_strong]:font-bold"
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
