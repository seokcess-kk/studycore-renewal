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
    <section className="min-h-screen bg-navy-dark relative overflow-hidden">
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

      {/* 컨텐츠 그리드 */}
      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* 좌측: 헤드라인 */}
        <div className="flex flex-col justify-end p-8 md:p-14 lg:border-r lg:border-white/[0.06] relative">
          {/* 좌측 상단 장식 마크 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute top-8 left-8 md:top-14 md:left-14 hidden lg:flex items-center gap-3"
          >
            <span className="block w-2 h-2 border border-teal/30" />
            <span className="block w-1 h-1 bg-teal/20" />
          </motion.div>

          {/* 서브 라벨 — teal 라인 장식 추가 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-4 mb-10 lg:mb-20"
          >
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="block w-10 h-[1.5px] bg-teal origin-left"
            />
            <span className="font-mono text-[10px] font-bold text-teal tracking-[0.28em] uppercase">
              Managed Study Hall · 광주 광산구
            </span>
          </motion.div>

          <motion.h1
            variants={headlineVariants}
            initial="hidden"
            animate="show"
            className="font-serif text-[clamp(60px,10vw,140px)] font-black leading-[0.88] tracking-[-0.04em] text-white/90"
          >
            <motion.span
              variants={lineVariants}
              style={{ display: "block" }}
            >
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
        </div>

        {/* 우측: 설명 + 메타 */}
        <div className="hidden lg:flex flex-col justify-between p-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="pt-10"
          >
            <p className="text-[15px] leading-[2] text-white/40 font-light mb-12">
              공부는 의지만으로 되지 않습니다. 좋은 환경이 있어야 합니다.
              <br />
              <br />
              스터디코어 1.0은{" "}
              <strong className="text-white/75 font-medium">
                원장님이 직접 설계하고 운영하는
              </strong>{" "}
              관리형 독서실로, 교시제와 수학 멘토 질문방으로 학습의 모든 과정을
              구조로 뒷받침합니다.
            </p>

            <Link
              href={ROUTES.CONSULT}
              className="cta-fill cta-fill-teal inline-block px-13 py-4 text-navy-dark text-[13.5px] font-bold tracking-[0.04em] border-[1.5px] border-teal hover:text-teal transition-colors duration-300"
            >
              입소 상담 신청하기
            </Link>
          </motion.div>

          {/* 메타 정보 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col gap-4 pt-12 border-t border-white/[0.07]"
          >
            <MetaItem label="Location" value={CONTACT.address} />
            <MetaItem label="Contact" value={CONTACT.phone} />
            <MetaItem label="Type" value="관리형 독서실" />
          </motion.div>
        </div>
      </div>

      {/* 모바일: 서브카피 + 하단 CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="lg:hidden absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-navy-dark via-navy-dark/80 to-transparent"
      >
        <p className="text-[13px] text-white/40 font-light leading-[1.7] mb-5">
          원장님이 직접 운영하는 관리형 독서실 —
          <br />
          교시제와 수학 멘토 질문방으로 학습을 구조화합니다.
        </p>
        <Link
          href={ROUTES.CONSULT}
          className="cta-fill cta-fill-teal block w-full text-center px-6 py-4 text-navy-dark text-[14px] font-bold tracking-[0.04em] border-[1.5px] border-teal hover:text-teal transition-colors duration-300"
        >
          입소 상담 신청하기
        </Link>
      </motion.div>
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
