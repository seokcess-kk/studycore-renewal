"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "2025", label: "개원 연도", suffix: "" },
  { value: "10", label: "애플타워", suffix: "층 전층" },
  { value: "1:1", label: "원장 직접 관리", suffix: "" },
  { value: "365", label: "연중 운영", suffix: "일" },
];

export function TrustStrip() {
  return (
    <section className="bg-navy border-t border-white/[0.06]">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, i) => {
            const isOdd = i % 2 === 0;
            return (
            <div
              key={stat.label}
              className={`py-10 md:py-12 flex flex-col items-center text-center ${
                isOdd ? "border-r border-white/[0.06]" : ""
              } ${i < 2 ? "" : "border-t border-white/[0.06] lg:border-t-0"} ${
                i === 2 ? "lg:border-r lg:border-white/[0.06]" : ""
              }`}
            >
              <span className="font-mono text-[clamp(28px,4vw,40px)] font-bold text-white leading-none tracking-tight">
                {stat.value}
                {stat.suffix && (
                  <span className="text-teal text-[clamp(14px,2vw,18px)] font-medium ml-0.5">
                    {stat.suffix}
                  </span>
                )}
              </span>
              <span className="font-mono text-[10px] text-white/40 tracking-[0.18em] uppercase mt-3">
                {stat.label}
              </span>
            </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
