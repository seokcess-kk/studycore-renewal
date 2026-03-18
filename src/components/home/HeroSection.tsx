"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES, CONTACT } from "@/lib/constants";

const headlineVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.25 },
  },
};

const lineVariants = {
  hidden: { opacity: 0, y: 28, skewY: 2 },
  show: {
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 18 },
  },
};

export function HeroSection() {
  return (
    <section className="min-h-screen bg-navy-dark relative overflow-hidden flex flex-col">
      {/* 격자 배경 */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(87,173,177,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(87,173,177,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />

      {/* 워터마크 */}
      <div className="absolute right-[-40px] bottom-[-60px] font-mono text-[40vw] font-bold text-teal/[0.03] leading-none z-[1] pointer-events-none select-none">
        10
      </div>

      {/* 상단: 헤드라인 영역 (시선 최우선) */}
      <div className="relative z-[2] flex-1 flex flex-col justify-center p-8 md:p-14">
        {/* 장식 마크 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute top-8 left-8 md:top-14 md:left-14 hidden lg:flex items-center gap-3"
        >
          <span className="block w-2 h-2 border border-teal/30" />
          <span className="block w-1 h-1 bg-teal/20" />
        </motion.div>

        {/* 서브 라벨 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-4 mb-8 lg:mb-12"
        >
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="block w-10 h-[1.5px] bg-teal origin-left"
          />
          <span className="font-mono text-[10px] font-bold text-teal tracking-[0.28em] uppercase">
            Managed Study Hall
          </span>
        </motion.div>

        {/* 메인 헤드라인 */}
        <motion.h1
          variants={headlineVariants}
          initial="hidden"
          animate="show"
          className="font-serif text-[clamp(60px,10vw,140px)] font-black leading-[0.88] tracking-[-0.04em] text-white/90"
        >
          <motion.span variants={lineVariants} style={{ display: "block" }}>
            집중이
          </motion.span>
          <motion.span
            variants={lineVariants}
            className="text-teal"
            style={{
              display: "block",
              textShadow: "0 0 40px rgba(87,173,177,0.15)",
            }}
          >
            성적을
          </motion.span>
          <motion.span
            variants={lineVariants}
            className="text-transparent"
            style={{
              display: "block",
              WebkitTextStroke: "2px rgba(255,255,255,0.18)",
            }}
          >
            바꾼다
          </motion.span>
        </motion.h1>

        {/* 모바일 서브카피 (데스크탑은 하단 영역에 표시) */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:hidden mt-8 text-[13px] text-white/40 font-light leading-[1.7] max-w-sm"
        >
          원장님이 직접 운영하는 관리형 독서실 —
          <br />
          교시제와 수학 멘토 질문방으로 학습을 구조화합니다.
        </motion.p>
      </div>

      {/* 하단: 설명 + CTA | 메타 */}
      <div className="relative z-[2] border-t border-white/[0.06]">
        {/* 데스크탑: 2컬럼 */}
        <div className="hidden lg:grid lg:grid-cols-2">
          {/* 좌: 설명 + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="p-14 lg:border-r border-white/[0.06]"
          >
            <p className="text-[15px] leading-[2] text-white/40 font-light mb-10">
              공부는 의지만으로 되지 않습니다. 좋은 환경이 있어야 합니다.
              <br />
              <br />
              스터디코어 1.0은{" "}
              <strong className="text-white/75 font-medium">
                원장님이 직접 설계하고 운영하는
              </strong>{" "}
              관리형 독서실로<br />교시제와 수학 멘토 질문방으로 학습의 모든 과정을
              구조로 뒷받침합니다.
            </p>
            <Link
              href={ROUTES.CONSULT}
              className="cta-fill cta-fill-teal inline-block px-13 py-4 text-navy-dark text-[13.5px] font-bold tracking-[0.04em] border-[1.5px] border-teal hover:text-teal transition-colors duration-300"
            >
              상담 신청하기
            </Link>
          </motion.div>

          {/* 우: 메타 정보 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="p-14 flex flex-col justify-center gap-4"
          >
            <MetaItem label="Location" value={CONTACT.address} />
            <MetaItem label="Contact" value={CONTACT.phone} />
            <MetaItem label="Type" value="관리형 독서실" />
          </motion.div>
        </div>

        {/* 모바일 CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:hidden p-8"
        >
          <Link
            href={ROUTES.CONSULT}
            className="cta-fill cta-fill-teal block w-full text-center px-6 py-4 text-navy-dark text-[14px] font-bold tracking-[0.04em] border-[1.5px] border-teal hover:text-teal transition-colors duration-300"
          >
            입소 상담 신청하기
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="font-mono text-[9px] font-bold text-teal tracking-[0.2em] uppercase">
        {label}
      </span>
      <span className="text-[13px] text-white/45 font-light">{value}</span>
    </div>
  );
}
