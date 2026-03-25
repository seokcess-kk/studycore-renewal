"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { getActiveSpaces } from "@/domains/space/service";
import type { Space } from "@/domains/space/model";

const AUTO_PLAY_MS = 4000;

export function SpaceSlider() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient();
      const data = await getActiveSpaces(supabase);
      setSpaces(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (spaces.length === 0) return;
      setCurrent((index + spaces.length) % spaces.length);
      setProgressKey((k) => k + 1);
    },
    [spaces.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // 자동 재생
  useEffect(() => {
    if (!isPaused && spaces.length > 1) {
      intervalRef.current = setInterval(next, AUTO_PLAY_MS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next, spaces.length]);

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

  // 로딩 중이거나 데이터 없으면 렌더링하지 않음
  if (isLoading) {
    return (
      <section id="space" className="bg-white section-lg">
        <div className="h-[70vh] min-h-[480px] max-h-[600px] bg-stone animate-pulse" />
      </section>
    );
  }

  if (spaces.length === 0) return null;

  return (
    <section id="space" className="bg-white section-lg">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        className="px-6 md:px-13 mb-12 flex flex-col md:flex-row md:items-baseline gap-5 border-b-[1.5px] border-ink pb-10"
      >
        <span className="font-mono text-label font-bold text-teal tracking-label uppercase">
          Space / 03
        </span>
        <h2 className="font-serif text-fluid-h1 font-black tracking-heading text-ink">
          공간 소개
        </h2>
        <div className="flex-1" />
        <p className="text-secondary text-muted font-light max-w-[220px] md:text-right leading-prose">
          애플타워 10층 쾌적한 학습공간
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
          transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsPaused(true)}
          onDragEnd={(e, info) => {
            handleDragEnd(e, info);
            setIsPaused(false);
          }}
        >
          {spaces.map((space, index) => (
            <div
              key={space.id}
              className="min-w-full h-[70vh] min-h-[480px] max-h-[600px] flex-shrink-0 relative overflow-hidden"
            >
              {/* 배경: 이미지 또는 그라디언트 폴백 */}
              {space.image_url ? (
                <motion.img
                  src={space.image_url}
                  alt={space.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  animate={{
                    scale: index === current ? 1.05 : 1,
                  }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              ) : (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-navy-dark to-[#1a4070]"
                  animate={{
                    scale: index === current ? 1.05 : 1,
                  }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              )}

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

              {/* 컨텐츠 — 현재 슬라이드만 텍스트 모션 */}
              <div className="absolute bottom-0 left-0 right-0 z-[3] p-8 md:p-13 pointer-events-none">
                <motion.div
                  initial={false}
                  animate={{ opacity: index === current ? 1 : 0, y: index === current ? 0 : 8 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="font-mono text-label font-bold text-teal tracking-label uppercase block mb-2.5">
                    {space.label}
                  </span>
                  <h3 className="font-serif text-fluid-h2 font-bold text-white mb-2 tracking-heading">
                    {space.title}
                  </h3>
                  <p className="text-body text-white/60 font-light leading-prose max-w-[440px]">
                    {space.description}
                  </p>
                </motion.div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center justify-between px-6 md:px-13 pt-7">
        {/* 프로그레스 바 */}
        <div className="flex gap-1.5 flex-1 max-w-[200px]">
          {spaces.map((_, index) => (
            <div
              key={index}
              className="relative h-[2px] flex-1 bg-rule/60 overflow-hidden cursor-pointer"
              onClick={() => goTo(index)}
            >
              {index === current && (
                <div
                  key={progressKey}
                  className="absolute inset-y-0 left-0 bg-navy"
                  style={{
                    animation: `progress-fill ${AUTO_PLAY_MS}ms linear forwards`,
                    animationPlayState: isPaused ? "paused" : "running",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* 카운터 */}
        <span className="font-mono text-small text-muted tracking-cta">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(spaces.length).padStart(2, "0")}
        </span>

        {/* 화살표 */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={prev}
            className="w-11 h-11 border-[1.5px] border-rule flex items-center justify-center text-ink hover:bg-navy hover:border-navy hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={next}
            className="w-11 h-11 border-[1.5px] border-rule flex items-center justify-center text-ink hover:bg-navy hover:border-navy hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
