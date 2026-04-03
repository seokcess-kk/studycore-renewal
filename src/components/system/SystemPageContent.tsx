"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  Smartphone,
  Eye,
  Building2,
  Users,
  Phone,
} from "lucide-react";
import { ROUTES, CONTACT } from "@/lib/constants";

/* ── 애니메이션 ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 18 },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

/* ── 6대 시스템 데이터 ── */
const SYSTEMS = [
  {
    id: "schedule",
    number: "01",
    icon: Clock,
    title: "교시제 운영 시스템",
    subtitle: "시간 구조 설계",
    description:
      "하루 일과를 교시 단위로 운영하여 정해진 시간에 학습을 시작하고, 정해진 시간에만 이동이 허용됩니다.",
  },
  {
    id: "attendance",
    number: "02",
    icon: ShieldCheck,
    title: "출결·통제 시스템",
    subtitle: "학습 시간 통제",
    description:
      "턴게이트 기반 입출입 관리와 실시간 출결 기록으로 학습 시간 이탈을 방지합니다.",
  },
  {
    id: "life",
    number: "03",
    icon: Smartphone,
    title: "생활 관리 시스템",
    subtitle: "학습 행동 통제",
    description:
      "휴대폰 수거, 자습실 정숙, 지정석 사용으로 집중을 방해하는 행동 요소를 차단합니다.",
  },
  {
    id: "focus",
    number: "04",
    icon: Eye,
    title: "집중 유지 시스템",
    subtitle: "집중 상태 유지",
    description:
      "관리자 순찰, 방화벽 시스템, 백색소음으로 집중이 흐트러질 틈을 차단합니다.",
  },
  {
    id: "environment",
    number: "05",
    icon: Building2,
    title: "학습 환경 설계 시스템",
    subtitle: "집중 환경 설계",
    description:
      "인체공학적 데스크, 조명 설계, 냉난방·공기질 관리로 장시간 집중이 가능한 환경을 조성합니다.",
  },
  {
    id: "operation",
    number: "06",
    icon: Users,
    title: "운영 관리 시스템",
    subtitle: "운영진 기반 관리",
    description:
      "대표원장과 최상위권 출신 관리자가 직접 학습 환경을 상시 점검하고 개선합니다.",
  },
] as const;

const TIMETABLE = [
  { period: "1교시", time: "17:30 – 18:40", duration: "70분" },
  { period: "2교시", time: "19:00 – 20:20", duration: "80분" },
  { period: "3교시", time: "20:40 – 22:00", duration: "80분" },
  { period: "4교시", time: "22:20 – 23:50", duration: "90분" },
];

const LIFE_RULES = [
  {
    number: "01",
    title: "휴대폰 수거",
    description:
      "교시 시작 전 휴대폰을 별도 보관하며 학습 시간 중 외부 자극을 원천 차단합니다.",
  },
  {
    number: "02",
    title: "자습실 정숙",
    description:
      "자습실 내 대화, 통화, 음식 섭취를 제한하여 모든 좌석에서 동일한 집중 환경을 유지합니다.",
  },
  {
    number: "03",
    title: "지정석 사용",
    description:
      "지정된 좌석에서만 학습이 가능하며 환경 변수를 최소화해 학습 흐름을 유지합니다.",
  },
];

/* ══════════════════════════════════════════
   메인 컴포넌트
   ══════════════════════════════════════════ */
export function SystemPageContent() {
  return (
    <>
      <HeroSection />
      <div className="h-[2px] bg-teal" />
      <DiagramSection />
      <div className="h-[2px] bg-teal" />
      <ScheduleSection />
      <AttendanceSection />
      <LifeManagementSection />
      <FocusSection />
      <EnvironmentSection />
      <OperationSection />
      <div className="h-[2px] bg-teal/50" />
      <ClosingSection />
      <div className="h-[2px] bg-teal" />
      <CTASection />
    </>
  );
}

/* ══════════════════════════════════════════
   SECTION 1 — Hero
   ══════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="bg-navy-dark section-lg px-6 md:px-13 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-[1] bg-grid-teal" />

      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="relative z-[2] max-w-4xl mx-auto"
      >
        <motion.span
          variants={fadeUp}
          className="font-mono text-label font-bold text-teal tracking-label uppercase block mb-6"
        >
          System / 운영 시스템
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="font-serif text-fluid-h1 font-black text-on-dark leading-heading tracking-heading mb-6"
        >
          공부는 의지가 아니라
          <br />
          구조에서 결정됩니다
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-reading text-on-dark-muted leading-prose max-w-2xl"
        >
          스터디코어는 교시제 기반 운영 시스템을 통해
          <br className="hidden md:block" />
          학습 시간을 통제하고, 집중이 유지되는 환경을 만듭니다.
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════
   6대 핵심 시스템 다이어그램
   ══════════════════════════════════════════ */
function DiagramSection() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="bg-white section-lg px-6 md:px-13">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
        className="max-w-5xl mx-auto"
      >
        {/* 헤더 */}
        <motion.div variants={fadeUp} className="text-center mb-16">
          <span className="font-mono text-label font-bold text-teal tracking-label uppercase block mb-4">
            6 Core Systems
          </span>
          <h2 className="font-serif text-fluid-h2 font-black text-ink leading-heading tracking-heading">
            6대 핵심 시스템
          </h2>
        </motion.div>

        {/* 데스크탑: 허브 다이어그램 */}
        <motion.div
          variants={fadeUp}
          className="hidden lg:block relative mx-auto"
          style={{ maxWidth: 720, aspectRatio: "1 / 0.85" }}
        >
          {/* SVG 연결선 */}
          <svg
            viewBox="0 0 720 612"
            fill="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {[
              [360, 62],
              [620, 190],
              [620, 422],
              [360, 550],
              [100, 422],
              [100, 190],
            ].map(([x, y], i) => (
              <line
                key={i}
                x1={360}
                y1={306}
                x2={x}
                y2={y}
                stroke="var(--color-teal)"
                strokeWidth={1}
                strokeOpacity={0.15}
                strokeDasharray="4 4"
              />
            ))}
          </svg>

          {/* 중앙 노드 */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-navy-dark flex flex-col items-center justify-center text-center z-10"
            style={{ borderRadius: "50%" }}
          >
            <span className="font-mono text-label font-bold text-teal tracking-label">
              STUDYCORE
            </span>
            <span className="font-serif text-subhead font-black text-white leading-heading mt-1">
              관리형
              <br />
              학습공간
            </span>
          </div>

          {/* 주변 6개 노드 */}
          {SYSTEMS.map((sys, i) => {
            const positions = [
              { left: "50%", top: "0%", tx: "-50%", ty: "0%" },
              { left: "86%", top: "22%", tx: "-50%", ty: "-50%" },
              { left: "86%", top: "62%", tx: "-50%", ty: "-50%" },
              { left: "50%", top: "84%", tx: "-50%", ty: "-50%" },
              { left: "14%", top: "62%", tx: "-50%", ty: "-50%" },
              { left: "14%", top: "22%", tx: "-50%", ty: "-50%" },
            ];
            const pos = positions[i];
            const Icon = sys.icon;
            const isActive = activeId === sys.id;

            return (
              <div
                key={sys.id}
                className="absolute z-10"
                style={{
                  left: pos.left,
                  top: pos.top,
                  transform: `translate(${pos.tx}, ${pos.ty})`,
                }}
              >
                <motion.div
                  onHoverStart={() => setActiveId(sys.id)}
                  onHoverEnd={() => setActiveId(null)}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer flex flex-col items-center text-center w-36"
                >
                  <div
                    className={`w-14 h-14 flex items-center justify-center border-[1.5px] transition-colors duration-200 ${
                      isActive
                        ? "border-teal bg-teal/10"
                        : "border-rule bg-white"
                    }`}
                    style={{ borderRadius: "50%" }}
                  >
                    <Icon
                      size={22}
                      className={`transition-colors duration-200 ${
                        isActive ? "text-teal" : "text-navy"
                      }`}
                    />
                  </div>
                  <span className="font-bold text-body text-ink mt-2.5 leading-ui">
                    {sys.title}
                  </span>
                  <span className="text-caption text-muted mt-0.5">
                    {sys.subtitle}
                  </span>

                  {/* 호버 툴팁 */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 w-52 bg-navy-dark p-3 text-left z-20"
                      >
                        <p className="text-small text-white/80 leading-prose">
                          {sys.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* 모바일: 2열 그리드 */}
        <motion.div
          variants={stagger}
          className="lg:hidden grid grid-cols-2 gap-4"
        >
          {/* 중앙 노드 — 전체 너비 */}
          <motion.div
            variants={fadeUp}
            className="col-span-2 bg-navy-dark p-6 flex flex-col items-center text-center"
          >
            <span className="font-mono text-label font-bold text-teal tracking-label">
              STUDYCORE
            </span>
            <span className="font-serif text-fluid-h3 font-black text-white leading-heading mt-1">
              관리형 학습공간
            </span>
            <span className="text-small text-white/50 mt-1">
              학습 관리의 완성형 시스템
            </span>
          </motion.div>

          {SYSTEMS.map((sys) => {
            const Icon = sys.icon;
            return (
              <MobileDiagramCard key={sys.id} system={sys} Icon={Icon} />
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}

function MobileDiagramCard({
  system,
  Icon,
}: {
  system: (typeof SYSTEMS)[number];
  Icon: (typeof SYSTEMS)[number]["icon"];
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.button
      variants={fadeUp}
      type="button"
      onClick={() => setOpen(!open)}
      className="cursor-pointer border border-rule p-4 flex flex-col items-center text-center transition-colors duration-200 hover:border-teal/40"
    >
      <div
        className="w-10 h-10 flex items-center justify-center border border-rule mb-2"
        style={{ borderRadius: "50%" }}
      >
        <Icon size={18} className="text-navy" />
      </div>
      <span className="font-bold text-small text-ink leading-ui">
        {system.title}
      </span>
      <span className="text-caption text-muted mt-0.5">{system.subtitle}</span>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-small text-muted leading-prose mt-2 overflow-hidden"
          >
            {system.description}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ══════════════════════════════════════════
   공통: 섹션 번호 헤더
   ══════════════════════════════════════════ */
function SectionNumber({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-baseline gap-4 mb-8">
      <span className="font-mono text-fluid-h1 font-bold leading-none text-navy/10">
        {number}
      </span>
      <h2 className="font-serif text-fluid-h2 font-bold leading-heading tracking-heading text-ink">
        {title}
      </h2>
    </div>
  );
}

function SectionConclusion({ text }: { text: string }) {
  return (
    <div className="mt-10 pt-6 border-t border-rule flex items-center gap-3">
      <span className="block w-6 h-[2px] bg-teal flex-shrink-0" />
      <span className="font-mono text-secondary font-bold tracking-cta text-teal">
        {text}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════
   SECTION 2 — 01 교시제 시스템
   ══════════════════════════════════════════ */
function ScheduleSection() {
  return (
    <section className="bg-stone section-md px-6 md:px-13">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={fadeUp}>
          <SectionNumber number="01" title="교시제 시스템" />
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="space-y-5 text-reading text-ink/70 leading-prose mb-10"
        >
          <p>
            하루 일과는 <strong className="text-ink">교시 단위</strong>로
            운영됩니다.
            <br />
            정해진 시간에 학습을 시작하고, 정해진 시간에만 이동이 허용됩니다.
          </p>
          <p>
            정해진 시간 동안 오직 학습에만 집중하도록 설계되어
            <br />
            학습 몰입도를 안정적으로 유지합니다.
          </p>
        </motion.div>

        {/* 강조 문구 */}
        <motion.p
          variants={fadeUp}
          className="font-serif text-fluid-h3 font-bold text-ink leading-heading tracking-heading mb-8"
        >
          집중이 유지되는 시간 구조로 설계되었습니다
        </motion.p>

        {/* 시간표 */}
        <motion.div variants={fadeUp} className="bg-white p-6 md:p-8 border border-rule">
          <h3 className="font-mono text-label font-bold text-teal tracking-label uppercase mb-6">
            학기 중 평일 학습 시간표
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIMETABLE.map((item) => (
              <div
                key={item.period}
                className="border-l-2 border-teal pl-4 py-2"
              >
                <span className="font-mono text-caption font-bold text-teal tracking-label block">
                  {item.period}
                </span>
                <span className="text-body font-medium text-ink block mt-1">
                  {item.time}
                </span>
                <span className="text-caption text-muted">{item.duration}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-1 text-small text-muted leading-prose">
            <p>
              ※ 각 교시는 학습 흐름과 집중도를 고려하여 다르게 설계되었습니다.
            </p>
            <p>
              ※ 실제 운영은 개인별 일정에 따라 일부 조정될 수 있습니다.
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <SectionConclusion text="학습 리듬을 무너뜨리지 않는 구조" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════
   SECTION 3 — 02 출결·통제 시스템
   ══════════════════════════════════════════ */
function AttendanceSection() {
  return (
    <section className="bg-white section-md px-6 md:px-13">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={fadeUp}>
          <SectionNumber number="02" title="출결·통제 시스템" />
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="font-serif text-fluid-h3 font-bold text-ink leading-heading tracking-heading mb-8"
        >
          학습 시간은 관리되어야 합니다
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="space-y-5 text-reading text-ink/70 leading-prose"
        >
          <p>
            턴게이트 기반 입출입 시스템을 통해
            <br />
            입실·퇴실·외출이 <strong className="text-ink">실시간으로 기록</strong>
            되며
            <br />
            보호자에게 즉시 전달됩니다.
          </p>
          <p>
            관리자 상주 하에 학습 시간 이탈을 방지하고
            <br />
            학습 상태가 투명하게 관리됩니다.
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <SectionConclusion text="학습 시간을 통제하는 시스템" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════
   SECTION 4 — 03 생활 관리 시스템
   ══════════════════════════════════════════ */
function LifeManagementSection() {
  return (
    <section className="bg-stone section-md px-6 md:px-13">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={fadeUp}>
          <SectionNumber number="03" title="생활 관리 시스템" />
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="font-serif text-fluid-h3 font-bold text-ink leading-heading tracking-heading mb-10"
        >
          학습 집중을 방해하는 행동 요소를 차단합니다
        </motion.p>

        {/* 카드 3개 */}
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {LIFE_RULES.map((rule) => (
            <motion.div
              key={rule.number}
              variants={fadeUp}
              className="bg-white border border-rule p-6 group hover:border-teal/40 transition-colors duration-200"
            >
              <span className="font-mono text-label font-bold text-teal/60 tracking-label block mb-3">
                {rule.number}
              </span>
              <h3 className="font-bold text-subhead text-ink mb-2 leading-ui">
                {rule.title}
              </h3>
              <p className="text-body text-ink/60 leading-prose">
                {rule.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-reading text-ink/70 leading-prose"
        >
          관리자 상시 관리 체계를 통해
          <br />
          학습 집중 상태가 흐트러지지 않도록 지속적으로 관리됩니다.
        </motion.p>

        <motion.div variants={fadeUp}>
          <SectionConclusion text="학습 행동을 통제하는 관리 시스템" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════
   SECTION 5 — 04 집중 유지 시스템
   ══════════════════════════════════════════ */
function FocusSection() {
  return (
    <section className="bg-white section-md px-6 md:px-13">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={fadeUp}>
          <SectionNumber number="04" title="집중 유지 시스템" />
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="font-serif text-fluid-h3 font-bold text-ink leading-heading tracking-heading mb-8"
        >
          집중이 흐트러질 틈을 차단합니다
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="space-y-5 text-reading text-ink/70 leading-prose"
        >
          <p>
            교시 중{" "}
            <strong className="text-ink">관리자 상시 순찰</strong>을 통해
            <br />
            졸음, 이탈 등 집중 저하 요소를 즉시 관리하며
          </p>
          <p>
            태블릿 이용 시{" "}
            <strong className="text-ink">방화벽 시스템</strong>을 적용하여
            <br />
            학습에 방해되는 사이트 접근을 제한합니다.
          </p>
          <p>
            또한{" "}
            <strong className="text-ink">백색소음 시스템</strong>을 통해
            <br />
            자습실 전체 공간에 균일한 환경을 조성하여
            <br />
            집중이 유지될 수 있도록 설계했습니다.
          </p>
          <p>
            관리자 중심의 지속적인 모니터링을 통해
            <br />
            집중이 유지되는 상태를 안정적으로 유지합니다.
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <SectionConclusion text="집중 상태를 유지하는 관리 시스템" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════
   SECTION 6 — 05 학습 환경 설계 시스템
   ══════════════════════════════════════════ */
function EnvironmentSection() {
  return (
    <section className="bg-stone section-md px-6 md:px-13">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={fadeUp}>
          <SectionNumber number="05" title="학습 환경 설계 시스템" />
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="font-serif text-fluid-h3 font-bold text-ink leading-heading tracking-heading mb-8"
        >
          장시간 집중이 가능한 환경을 설계했습니다
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="space-y-5 text-reading text-ink/70 leading-prose"
        >
          <p>
            <strong className="text-ink">인체공학적 데스크</strong>와{" "}
            <strong className="text-ink">조명 설계</strong>를 통해
            <br />
            장시간 학습에도 피로도를 최소화하며,
          </p>
          <p>
            <strong className="text-ink">냉난방 시스템</strong>과{" "}
            <strong className="text-ink">공기질 관리</strong>로
            <br />
            항상 쾌적한 학습 환경을 유지합니다.
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <SectionConclusion text="환경 자체가 집중을 유지하도록 설계된 구조입니다" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════
   SECTION 7 — 06 운영 관리 시스템
   ══════════════════════════════════════════ */
function OperationSection() {
  return (
    <section className="bg-white section-md px-6 md:px-13">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={fadeUp}>
          <SectionNumber number="06" title="운영 관리 시스템" />
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="font-serif text-fluid-h3 font-bold text-ink leading-heading tracking-heading mb-8"
        >
          관리 시스템은 사람이 만듭니다
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="space-y-5 text-reading text-ink/70 leading-prose"
        >
          <p>
            관리자 중심의 지속적인 모니터링을 통해
            <br />
            집중이 유지되는 상태를 안정적으로 유지합니다.
          </p>
          <p>
            <strong className="text-ink">대표원장</strong>을 포함한 운영진이
            직접 관리 체계를 유지하며
            <br />
            관리자(메디컬 재학생, 최상위권 출신)와 함께
            <br />
            학습 환경을 상시 점검하고 개선합니다.
          </p>
          <p>
            운영 인력 간 정기적인 협의를 통해
            <br />
            현장 중심의 관리 시스템이 지속적으로 유지됩니다.
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <SectionConclusion text="관리의 수준이 학습 환경을 결정합니다" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════
   SECTION 8 — 마무리 메시지
   ══════════════════════════════════════════ */
function ClosingSection() {
  return (
    <section className="bg-navy-dark section-lg px-6 md:px-13 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-[1] bg-grid-teal" />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
        className="relative z-[2] max-w-3xl mx-auto text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="font-serif text-fluid-h1 font-black text-on-dark leading-heading tracking-heading mb-10"
        >
          스터디코어는 가르치지 않습니다
        </motion.h2>

        <motion.div
          variants={fadeUp}
          className="space-y-6 text-reading text-on-dark-muted leading-prose"
        >
          <p>
            대신
            <br />
            <strong className="text-white/75 font-medium">
              공부가 지속될 수 있는 환경을 만듭니다
            </strong>
          </p>
          <p>
            그리고
            <br />
            <strong className="text-white/75 font-medium">
              그 환경을 끝까지 유지합니다
            </strong>
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════
   SECTION 9 — CTA
   ══════════════════════════════════════════ */
function CTASection() {
  return (
    <section className="bg-navy section-lg px-6 md:px-13 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-grid-teal-lg" />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
        className="relative z-[2] max-w-3xl mx-auto text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="font-serif text-fluid-h2 font-black text-white leading-heading tracking-heading mb-10"
        >
          지금, 공부 환경을 바꾸세요
        </motion.h2>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href={ROUTES.CONSULT}
            className="cta-fill cta-fill-teal group inline-flex items-center justify-center gap-3 px-10 py-4 text-navy text-body font-bold tracking-cta border-[1.5px] border-teal hover:text-teal transition-colors duration-300 cursor-pointer"
          >
            상담 문의하기
            <ArrowRight
              size={15}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </Link>

          <a
            href={`tel:${CONTACT.phone.replace(/-/g, "")}`}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-white/60 text-body font-medium tracking-cta border-[1.5px] border-white/[0.12] hover:border-white/30 hover:text-white transition-all duration-300 cursor-pointer"
          >
            <Phone size={14} />
            방문 예약하기
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
