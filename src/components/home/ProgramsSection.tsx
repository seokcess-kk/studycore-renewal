"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { getActivePrograms } from "@/domains/program/service";
import type { Program } from "@/domains/program/model";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

function getProgramStatus(program: Program): {
  label: string;
  color: string;
  isActive: boolean;
} {
  const now = new Date();
  if (program.end_date && new Date(program.end_date) < now) {
    return { label: "종료", color: "bg-white/10 text-white/50", isActive: false };
  }
  return { label: "모집중", color: "bg-teal text-white", isActive: true };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parseDescription(description: string): string[] {
  return description
    .split(/[.,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function ProgramsSection() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient();
      const data = await getActivePrograms(supabase);
      setPrograms(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, programs]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-card]")?.clientWidth || 400;
    el.scrollBy({
      left: direction === "left" ? -cardWidth - 24 : cardWidth + 24,
      behavior: "smooth",
    });
  };

  if (!isLoading && programs.length === 0) return null;
  if (isLoading) return null;

  // 진행중 프로그램 분리
  const activePrograms = programs.filter(
    (p) => !p.end_date || new Date(p.end_date) >= new Date()
  );
  const pastPrograms = programs.filter(
    (p) => p.end_date && new Date(p.end_date) < new Date()
  );

  return (
    <section className="bg-navy-dark py-28 relative overflow-hidden">
      {/* 격자 배경 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(87,173,177,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(87,173,177,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative z-[2] section-container">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="mb-0 flex flex-col md:flex-row md:items-baseline gap-5 border-b border-white/[0.08] pb-10"
        >
          <span className="font-mono text-[10px] font-bold text-teal tracking-[0.28em] uppercase whitespace-nowrap">
            Programs / 01.5
          </span>
          <h2 className="font-serif text-[clamp(32px,5vw,52px)] font-black tracking-[-0.03em] text-white leading-none">
            프로그램 안내
          </h2>
          <div className="flex-1" />
          <p className="text-[13px] text-white/40 font-light max-w-[260px] md:text-right leading-[1.8]">
            스터디코어에서 운영하는 프로그램을 확인하세요.
          </p>
        </motion.div>

        {/* 진행중 프로그램 — 강조 카드 */}
        {activePrograms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            className="mt-12"
          >
            {activePrograms.map((program) => {
              const bullets = parseDescription(program.description || "");
              return (
                <div
                  key={program.id}
                  className="border border-white/[0.08] bg-white/[0.03] p-8 md:p-12 mb-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                    {/* 좌측: 정보 */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="bg-teal px-2.5 py-1 text-[11px] font-bold text-white tracking-wider">
                          모집중
                        </span>
                        {program.start_date && (
                          <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/40">
                            <Calendar size={12} />
                            {formatDate(program.start_date)}~
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-[clamp(24px,3vw,36px)] font-black text-white tracking-[-0.02em] mb-6 leading-tight">
                        {program.title}
                      </h3>

                      {/* 혜택 불릿 */}
                      {bullets.length > 0 && (
                        <div className="space-y-3 mb-8">
                          {bullets.map((bullet, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3"
                            >
                              <span className="mt-1.5 w-1.5 h-1.5 bg-teal flex-shrink-0" />
                              <span className="text-[14px] text-white/60 leading-relaxed">
                                {bullet}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CTA */}
                      <Link
                        href={ROUTES.CONSULT}
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-teal text-navy-dark text-[14px] font-bold tracking-[0.04em] border-[1.5px] border-teal hover:bg-transparent hover:text-teal transition-all duration-200"
                      >
                        상담 신청하기
                        <ArrowRight
                          size={16}
                          className="group-hover:translate-x-1 transition-transform duration-200"
                        />
                      </Link>
                    </div>

                    {/* 우측: 이미지 또는 장식 */}
                    <div className="hidden lg:block">
                      {program.image_url ? (
                        <div className="aspect-[3/4] overflow-hidden border border-white/[0.06]">
                          <img
                            src={program.image_url}
                            alt={program.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[3/4] border border-white/[0.06] flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0" style={{
                            backgroundImage: `
                              linear-gradient(rgba(87,173,177,0.06) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(87,173,177,0.06) 1px, transparent 1px)
                            `,
                            backgroundSize: "40px 40px",
                          }} />
                          <div className="relative text-center">
                            <p className="font-mono text-[80px] font-bold text-teal/[0.08] leading-none">
                              SC
                            </p>
                            <p className="font-mono text-[10px] text-white/20 tracking-[0.3em] uppercase mt-2">
                              Studycore 1.0
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* 지난 프로그램 — 가로 슬라이드 */}
        {pastPrograms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-mono text-[11px] font-bold text-white/30 tracking-[0.2em] uppercase">
                지난 프로그램
              </h3>
              {/* 슬라이드 컨트롤 */}
              {pastPrograms.length > 2 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => scroll("left")}
                    disabled={!canScrollLeft}
                    className="w-9 h-9 border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => scroll("right")}
                    disabled={!canScrollRight}
                    className="w-9 h-9 border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {pastPrograms.map((program) => (
                <div
                  key={program.id}
                  data-card
                  className="flex-shrink-0 w-[320px] sm:w-[360px] border border-white/[0.06] bg-white/[0.02] p-5 group hover:bg-white/[0.04] transition-colors"
                  style={{ scrollSnapAlign: "start" }}
                >
                  {/* 이미지 */}
                  {program.image_url && (
                    <div className="aspect-[16/9] overflow-hidden mb-4 border border-white/[0.06]">
                      <img
                        src={program.image_url}
                        alt={program.title}
                        className="h-full w-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/50">
                      종료
                    </span>
                    <span className="font-mono text-[10px] text-white/30">
                      {formatDate(program.start_date)}
                      {program.end_date && ` — ${formatDate(program.end_date)}`}
                    </span>
                  </div>

                  <h4 className="font-serif text-[16px] font-bold text-white/60 group-hover:text-white/80 transition-colors leading-snug">
                    {program.title}
                  </h4>

                  {program.description && (
                    <p className="mt-2 text-[13px] text-white/30 leading-relaxed line-clamp-2">
                      {program.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
