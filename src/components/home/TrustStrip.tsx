"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

interface Stat {
  value: string;
  numericValue: number | null;
  label: string;
  suffix: string;
}

const stats: Stat[] = [
  { value: "2026", numericValue: 2026, label: "개원 연도", suffix: "" },
  { value: "10", numericValue: 10, label: "애플타워", suffix: "층 전층" },
  { value: "1:1", numericValue: null, label: "원장 직접 관리", suffix: "" },
  { value: "365", numericValue: 365, label: "연중 운영", suffix: "일" },
];

function CountUpValue({ stat, inView }: { stat: Stat; inView: boolean }) {
  const [displayValue, setDisplayValue] = useState(
    stat.numericValue !== null ? "0" : stat.value
  );
  const [showSuffix, setShowSuffix] = useState(false);
  const [showValue, setShowValue] = useState(stat.numericValue !== null ? false : false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    // 숫자가 아닌 경우 (1:1) — fade-in만
    if (stat.numericValue === null) {
      setShowValue(true); // eslint-disable-line react-hooks/set-state-in-effect -- 애니메이션 시작 트리거
      return;
    }

    setShowValue(true); // eslint-disable-line react-hooks/set-state-in-effect -- 애니메이션 시작 트리거

    const target = stat.numericValue;
    // 2025처럼 큰 수는 시작점을 높게 잡아서 자연스럽게
    const startFrom = target > 100 ? Math.floor(target * 0.85) : 0;
    const duration = target > 100 ? 1.6 : 1.0;

    const controls = animate(startFrom, target, {
      duration,
      ease: [0.16, 1, 0.3, 1], // ease-out-expo 느낌
      onUpdate(latest) {
        setDisplayValue(String(Math.round(latest)));
      },
      onComplete() {
        setDisplayValue(String(target));
        // suffix fade-in (0.2s 딜레이)
        if (stat.suffix) {
          setTimeout(() => setShowSuffix(true), 200);
        }
      },
    });

    return () => controls.stop();
  }, [inView, stat]);

  // suffix가 없는 항목은 바로 표시
  useEffect(() => {
    if (hasAnimated.current && !stat.suffix && stat.numericValue !== null) {
      setShowSuffix(true); // eslint-disable-line react-hooks/set-state-in-effect -- 애니메이션 완료 후 표시
    }
  }, [displayValue, stat.suffix, stat.numericValue]);

  return (
    <span className="font-mono text-[clamp(28px,4vw,40px)] font-bold text-white leading-none tracking-tight">
      {stat.numericValue !== null ? (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={showValue ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {displayValue}
        </motion.span>
      ) : (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={showValue ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {stat.value}
        </motion.span>
      )}
      {stat.suffix && (
        <motion.span
          className="text-teal text-[clamp(14px,2vw,18px)] font-medium ml-0.5"
          initial={{ opacity: 0, x: -4 }}
          animate={showSuffix ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {stat.suffix}
        </motion.span>
      )}
    </span>
  );
}

export function TrustStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section className="bg-navy border-t border-white/[0.06]">
      <div className="section-container">
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const isOdd = i % 2 === 0;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`py-10 md:py-12 flex flex-col items-center text-center ${
                  isOdd ? "border-r border-white/[0.06]" : ""
                } ${i < 2 ? "" : "border-t border-white/[0.06] lg:border-t-0"} ${
                  i === 2 ? "lg:border-r lg:border-white/[0.06]" : ""
                }`}
              >
                <CountUpValue stat={stat} inView={inView} />
                <motion.span
                  className="font-mono text-label text-white/60 tracking-label uppercase mt-3"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.1 + 0.3 }}
                >
                  {stat.label}
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
