"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    label: "Main Hall",
    title: "메인 자습실",
    description:
      "개인 칸막이 책상과 최적화된 조명으로 설계된 넓고 조용한 자습 공간입니다. 교시 시작과 함께 집중 모드가 시작됩니다.",
  },
  {
    label: "Lounge",
    title: "휴게 공간",
    description:
      "쉬는 시간에 완전히 긴장을 풀고 돌아올 수 있는 별도 공간입니다. 자습실과 분리되어 집중과 휴식의 경계가 명확합니다.",
  },
  {
    label: "Facility",
    title: "편의 시설",
    description:
      "정수기, 개인 사물함, 충전 시설을 기본 제공합니다. 공부 외의 불편함이 없도록 필요한 것들은 이미 갖춰져 있습니다.",
  },
  {
    label: "Location",
    title: "애플타워 10층",
    description:
      "광주광역시 광산구 임방울대로 330, 애플타워 10층. 버스·지하철 모두 접근이 편리하며, 건물 내 주차도 가능합니다.",
  },
];

export function SpaceSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // 자동 재생
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(next, 4000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next]);

  // Framer Motion Drag 핸들러
  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      next();
    } else if (info.offset.x > swipeThreshold) {
      prev();
    }
  };

  return (
    <section id="space" className="bg-white py-28">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        className="px-6 md:px-13 mb-12 flex flex-col md:flex-row md:items-baseline gap-5"
      >
        <span className="font-mono text-[10px] font-bold text-teal tracking-[0.28em] uppercase">
          Space / 03
        </span>
        <h2 className="font-serif text-[clamp(32px,5vw,56px)] font-black tracking-[-0.03em]">
          공간 소개
        </h2>
        <div className="flex-1" />
        <p className="text-[13px] text-muted font-light max-w-[220px] md:text-right leading-[1.7]">
          촬영 후 실제 사진으로 교체 예정입니다.
        </p>
      </motion.div>

      {/* 슬라이더 */}
      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className="flex"
          animate={{ x: `-${current * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsPaused(true)}
          onDragEnd={(e, info) => {
            handleDragEnd(e, info);
            setIsPaused(false);
          }}
        >
          {slides.map((slide) => (
            <div
              key={slide.label}
              className="min-w-full h-[540px] flex-shrink-0 relative overflow-hidden"
            >
              {/* 배경 (플레이스홀더) */}
              <div className="absolute inset-0 bg-gradient-to-br from-navy-dark to-[#1a4070]" />

              {/* 격자 */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(87,173,177,0.06) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(87,173,177,0.06) 1px, transparent 1px)
                  `,
                  backgroundSize: "60px 60px",
                }}
              />

              {/* 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/[0.88] via-transparent to-transparent z-[2]" />

              {/* 컨텐츠 */}
              <div className="absolute bottom-0 left-0 right-0 z-[3] p-8 md:p-13 pointer-events-none">
                <span className="font-mono text-[10px] font-bold text-teal tracking-[0.24em] uppercase block mb-2.5">
                  {slide.label}
                </span>
                <h3 className="font-serif text-[28px] font-bold text-white mb-2 tracking-[-0.02em]">
                  {slide.title}
                </h3>
                <p className="text-[13.5px] text-white/50 font-light leading-[1.7] max-w-[440px]">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center justify-between px-6 md:px-13 pt-7">
        {/* 도트 */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`h-1.5 transition-all duration-200 ${
                index === current
                  ? "w-6 bg-navy"
                  : "w-1.5 bg-rule hover:bg-muted"
              }`}
            />
          ))}
        </div>

        {/* 카운터 */}
        <span className="font-mono text-[12px] text-muted tracking-[0.1em]">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </span>

        {/* 화살표 */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={prev}
            className="w-11 h-11 border-[1.5px] border-rule flex items-center justify-center text-ink hover:bg-navy hover:border-navy hover:text-white transition-colors duration-200"
          >
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={next}
            className="w-11 h-11 border-[1.5px] border-rule flex items-center justify-center text-ink hover:bg-navy hover:border-navy hover:text-white transition-colors duration-200"
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
