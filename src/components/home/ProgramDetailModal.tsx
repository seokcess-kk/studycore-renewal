"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import type { Program } from "@/domains/program/model";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ProgramDetailModalProps {
  program: Program | null;
  onClose: () => void;
}

export function ProgramDetailModal({
  program,
  onClose,
}: ProgramDetailModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && program) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [program, onClose]);

  // 스크롤 방지
  useEffect(() => {
    if (program) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [program]);

  const isActive =
    program && (!program.end_date || new Date(program.end_date) >= new Date());

  return (
    <AnimatePresence>
      {program && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto bg-white border border-rule"
          >
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 w-8 h-8 flex items-center justify-center bg-white/80 border border-rule text-muted hover:text-ink transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* 이미지 */}
            {program.image_url ? (
              <div className="aspect-[16/9] overflow-hidden border-b border-rule">
                <img
                  src={program.image_url}
                  alt={program.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[3/1] bg-stone border-b border-rule flex items-center justify-center relative overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(16,48,80,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(16,48,80,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px",
                  }}
                />
                <div className="relative text-center">
                  <p className="font-mono text-[48px] font-bold text-navy/[0.06] leading-none">
                    SC
                  </p>
                  <p className="font-mono text-[9px] text-muted/40 tracking-[0.3em] uppercase mt-1">
                    Studycore 1.0
                  </p>
                </div>
              </div>
            )}

            {/* 콘텐츠 */}
            <div className="p-6 md:p-8">
              {/* 상태 + 날짜 */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-2.5 py-1 text-[11px] font-bold tracking-wider ${
                    isActive
                      ? "bg-teal text-white"
                      : "bg-stone text-muted border border-rule"
                  }`}
                >
                  {isActive ? "모집중" : "종료"}
                </span>
                {(program.start_date || program.end_date) && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
                    <Calendar size={12} />
                    {formatDate(program.start_date)}
                    {program.end_date && ` — ${formatDate(program.end_date)}`}
                  </span>
                )}
              </div>

              {/* 제목 */}
              <h2 className="font-serif text-[clamp(22px,3vw,28px)] font-black text-ink tracking-[-0.02em] leading-tight mb-6">
                {program.title}
              </h2>

              {/* 설명 */}
              {program.description && (
                <div className="border-t border-rule pt-6 mb-8">
                  <p className="text-[14px] text-ink/70 leading-[1.9] whitespace-pre-line">
                    {program.description}
                  </p>
                </div>
              )}

              {/* CTA — 진행중 프로그램만 */}
              {isActive && (
                <Link
                  href={ROUTES.CONSULT}
                  onClick={onClose}
                  className="cta-fill cta-fill-navy group inline-flex items-center gap-3 px-8 py-4 text-white text-[14px] font-bold tracking-[0.04em] border-[1.5px] border-navy hover:text-navy transition-colors duration-300 cursor-pointer"
                >
                  상담 신청하기
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
