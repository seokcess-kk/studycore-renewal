"use client";

import { useState, useEffect } from "react";
import { Nav, Footer, Skeleton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getVisibleSectionList } from "@/domains/guide/service";
import type { GuideSection } from "@/domains/guide/model";
import { ChevronDown, BookOpen } from "lucide-react";

export default function ManualPage() {
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSections() {
      const supabase = createClient();
      const result = await getVisibleSectionList(supabase, "manual");
      if (result.success) {
        setSections(result.sections);
        if (result.sections.length > 0) {
          setExpandedIds([result.sections[0].id]);
        }
      }
      setIsLoading(false);
    }
    fetchSections();
  }, []);

  const toggleSection = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        <section className="bg-navy py-16 px-6 md:px-13">
          <div className="max-w-3xl mx-auto">
            <span className="font-mono text-[10px] font-bold text-teal tracking-[0.28em] uppercase block mb-4">
              Manual
            </span>
            <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-black text-white leading-tight">
              이용 매뉴얼
            </h1>
            <p className="mt-4 text-white/50 text-[15px]">
              독서실 이용에 필요한 정보를 안내합니다.
            </p>
          </div>
        </section>

        <section className="px-6 md:px-13 py-12">
          <div className="max-w-3xl mx-auto space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-rule bg-white p-5">
                  <Skeleton className="h-5 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : sections.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen size={48} className="mx-auto text-rule mb-4" />
                <p className="text-muted">
                  아직 등록된 매뉴얼이 없습니다.
                </p>
              </div>
            ) : (
              sections.map((section) => {
                const isExpanded = expandedIds.includes(section.id);
                return (
                  <div key={section.id} className="border border-rule bg-white">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-stone/50 transition-colors"
                    >
                      <span className="font-mono text-[12px] text-teal font-bold">
                        {String(section.order_index).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-[16px] font-medium text-ink">
                        {section.title}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-muted transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-rule">
                        <div className="pt-4 text-[14px] text-ink leading-relaxed whitespace-pre-wrap">
                          {section.content}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
