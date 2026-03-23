"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES, CONTACT } from "@/lib/constants";

/* ── 애니메이션 variants ── */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.22, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 18 },
  },
};

const sloganStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.7 },
  },
};

const sloganLine = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
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

      {/* ─── 상단: 대표문구 + 슬로건 ─── */}
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
          className="flex items-center gap-4 mb-8 lg:mb-10"
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
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {/* 대표문구 상단: 학습관리의 첫 번째 완성형 시스템 */}
          <motion.p
            variants={fadeUp}
            className="font-serif text-[clamp(18px,3vw,28px)] font-medium text-white/60 tracking-[-0.02em] leading-[1.4] mb-2 md:mb-3"
          >
            학습관리의 첫 번째 완성형 시스템
          </motion.p>

          {/* 브랜드명: 스터디코어1.0 */}
          <motion.h1
            variants={fadeUp}
            className="font-serif text-[clamp(40px,7vw,96px)] font-black leading-[0.92] tracking-[-0.04em] text-white/90"
          >
            <span className="text-teal" style={{ textShadow: "0 0 40px rgba(87,173,177,0.15)" }}>
              스터디코어
            </span>
            <span
              className="text-transparent ml-2 md:ml-4"
              style={{ WebkitTextStroke: "2px rgba(255,255,255,0.18)" }}
            >
              1.0
            </span>
          </motion.h1>
        </motion.div>

        {/* 슬로건 3줄 */}
        <motion.ul
          variants={sloganStagger}
          initial="hidden"
          animate="show"
          className="mt-8 md:mt-12 space-y-2.5 md:space-y-3"
        >
          {[
            "학습은 의지가 아니라 구조입니다.",
            "성과는 루틴에서 완성됩니다.",
            "공부를 시스템으로 관리합니다.",
          ].map((text) => (
            <motion.li
              key={text}
              variants={sloganLine}
              className="flex items-center gap-3 md:gap-4"
            >
              <span className="block w-1.5 h-1.5 bg-teal/40 shrink-0" />
              <span className="text-[clamp(14px,1.8vw,18px)] text-white/65 font-light tracking-[-0.01em] leading-[1.6]">
                {text}
              </span>
            </motion.li>
          ))}
        </motion.ul>

        {/* 모바일 소개글 (데스크탑은 하단에 표시) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="lg:hidden mt-10 max-w-md"
        >
          <p className="text-[13px] text-white/60 font-light leading-[1.9]">
            공부는 의지만으로 완성되지 않습니다.
            <br />
            환경과 관리, 그리고 루틴이 함께 설계되어야 합니다.
          </p>
          <p className="text-[13px] text-white/60 font-light leading-[1.9] mt-4">
            스터디코어 1.0은{" "}
            <strong className="text-white/65 font-medium">
              대표원장이 직접 설계·운영하는
            </strong>{" "}
            관리형 독서실로 메디컬 재학 중인 최상위권 조교의 학습 관리와
            턴게이트 기반 출결 시스템, 몰입에 최적화된 공간을 통해 학습의 전
            과정을 체계적으로 관리합니다.
          </p>
        </motion.div>
      </div>

      {/* ─── 하단: 소개글 + CTA | 메타 ─── */}
      <div className="relative z-[2] border-t border-white/[0.06]">
        {/* 데스크탑: 2컬럼 */}
        <div className="hidden lg:grid lg:grid-cols-2">
          {/* 좌: 소개글 + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="p-14 lg:border-r border-white/[0.06]"
          >
            <p className="text-[15px] leading-[2] text-white/60 font-light mb-4">
              공부는 의지만으로 완성되지 않습니다.
              <br />
              환경과 관리, 그리고 루틴이 함께 설계되어야 합니다.
            </p>
            <p className="text-[15px] leading-[2] text-white/60 font-light mb-10">
              스터디코어 1.0은{" "}
              <strong className="text-white/75 font-medium">
                대표원장이 직접 설계·운영하는
              </strong>{" "}
              관리형 독서실로,
              <br />
              메디컬 재학 중인 최상위권 조교의 학습 관리와
              <br />
              턴게이트 기반 출결 시스템, 몰입에 최적화된 공간을 통해
              <br />
              학습의 전 과정을 체계적으로 관리합니다.
            </p>
            <Link
              href={ROUTES.CONSULT}
              className="cursor-pointer cta-fill cta-fill-teal inline-block px-13 py-4 text-navy-dark text-[14px] font-bold tracking-[0.04em] border-[1.5px] border-teal hover:text-teal transition-colors duration-300"
            >
              상담 신청하기
            </Link>
          </motion.div>

          {/* 우: 메타 정보 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.05 }}
            className="p-14 flex flex-col justify-center gap-4"
          >
            <MetaItem label="Location" value={CONTACT.address} />
            <MetaItem label="Contact" value="카카오톡 문의" href={CONTACT.kakaoChatChannel} />
            <MetaItem label="Type" value="관리형 독서실" />
          </motion.div>
        </div>

        {/* 모바일 CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="lg:hidden p-8"
        >
          <Link
            href={ROUTES.CONSULT}
            className="cursor-pointer cta-fill cta-fill-teal block w-full text-center px-6 py-4 text-navy-dark text-[14px] font-bold tracking-[0.04em] border-[1.5px] border-teal hover:text-teal transition-colors duration-300"
          >
            상담 신청하기
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function MetaItem({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="font-mono text-[9px] font-bold text-teal tracking-[0.2em] uppercase">
        {label}
      </span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/60 font-light hover:text-teal cursor-pointer transition-colors duration-200">
          {value}
        </a>
      ) : (
        <span className="text-[13px] text-white/60 font-light">{value}</span>
      )}
    </div>
  );
}
