"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES, CONTACT } from "@/lib/constants";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-navy py-28 px-6 md:px-13 relative overflow-hidden">
      {/* 격자 배경 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(87,173,177,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(87,173,177,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* 좌측: 타이틀 + 연락처 */}
        <div className="lg:pr-24 lg:border-r lg:border-white/[0.08]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
          >
            <div className="font-mono text-[10px] font-bold text-teal tracking-[0.28em] uppercase flex items-center gap-3 mb-8">
              <span className="w-8 h-0.5 bg-teal" />
              Contact / 05
            </div>
            <h2 className="font-serif text-[clamp(44px,7vw,96px)] font-black text-white leading-[0.92] tracking-[-0.04em] mb-13">
              상담
              <br />
              신청
            </h2>

            {/* 연락처 정보 */}
            <div className="flex flex-col">
              <ContactRow label="Location">
                광주 광산구 임방울대로 330
                <br />
                애플타워 10층
              </ContactRow>
              <ContactRow label="Phone">{CONTACT.phone}</ContactRow>
              <ContactRow label="Kakao">@스터디코어 1.0</ContactRow>
              <ContactRow label="Email">{CONTACT.email}</ContactRow>
            </div>
          </motion.div>
        </div>

        {/* 우측: CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.1 }}
          className="lg:pl-24 mt-16 lg:mt-0"
        >
          <span className="text-[13px] text-white/30 font-light block mb-10 leading-[1.7]">
            문의 내용을 남겨주세요 — 원장님이 직접 연락드립니다
          </span>

          <p className="text-white/60 text-[15px] leading-[1.8] mb-8">
            입소 상담, 시설 견학, 프로그램 문의 등<br />
            무엇이든 편하게 문의해 주세요.
            <br />
            <br />
            <strong className="text-white font-medium">
              원장님이 직접 확인하고 연락드립니다.
            </strong>
          </p>

          <Link
            href={ROUTES.CONSULT}
            className="group inline-flex items-center gap-3 mt-10 px-15 py-[18px] bg-teal text-navy text-[14px] font-bold tracking-[0.05em] border-[1.5px] border-teal hover:bg-transparent hover:text-teal transition-all duration-200"
          >
            신청하기
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function ContactRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-baseline py-4 border-b border-white/[0.07]">
      <span className="font-mono text-[10px] text-teal tracking-[0.18em] uppercase">
        {label}
      </span>
      <span className="text-[14px] text-white/60 text-right leading-[1.7]">
        {children}
      </span>
    </div>
  );
}
