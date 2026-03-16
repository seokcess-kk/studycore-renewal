"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { getActivePrograms } from "@/domains/program/service";
import type { Program } from "@/domains/program/model";

function getProgramStatus(program: Program): {
  label: string;
  color: string;
} {
  const now = new Date();
  if (program.end_date && new Date(program.end_date) < now) {
    return { label: "종료", color: "bg-muted text-white" };
  }
  return { label: "진행중", color: "bg-teal text-white" };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ProgramsSection() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient();
      const data = await getActivePrograms(supabase);
      setPrograms(data);
      setIsLoading(false);
    }
    load();
  }, []);

  // 데이터 없으면 섹션 비노출
  if (!isLoading && programs.length === 0) return null;
  if (isLoading) return null;

  return (
    <section className="bg-stone py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* 타이틀 */}
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono text-[13px] tracking-widest text-teal">
            PROGRAMS
          </p>
          <h2 className="font-serif text-3xl font-bold text-navy md:text-4xl">
            프로그램 안내
          </h2>
        </div>

        {/* 카드 그리드 */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const status = getProgramStatus(program);
            return (
              <div
                key={program.id}
                className="border border-rule bg-white overflow-hidden"
              >
                {/* 이미지 */}
                {program.image_url ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={program.image_url}
                      alt={program.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-stone">
                    <span className="text-sm text-muted">이미지 없음</span>
                  </div>
                )}

                {/* 콘텐츠 */}
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-navy">
                      {program.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {program.description && (
                    <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-ink">
                      {program.description}
                    </p>
                  )}

                  {(program.start_date || program.end_date) && (
                    <p className="font-mono text-xs text-muted">
                      {formatDate(program.start_date)}
                      {program.start_date && program.end_date && " — "}
                      {formatDate(program.end_date)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
