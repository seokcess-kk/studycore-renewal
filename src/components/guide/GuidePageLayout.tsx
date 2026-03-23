"use client";

import { useState, useEffect, useMemo } from "react";
import { Nav, Footer, Skeleton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getVisibleSectionList } from "@/domains/guide/service";
import type { GuideSection, GuideSectionType } from "@/domains/guide/model";
import {
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Clock,
  UtensilsCrossed,
  Rocket,
  Users,
  Settings,
  HelpCircle,
  BookMarked,
  GraduationCap,
  Lightbulb,
  Shield,
  Bell,
  Calendar,
  MapPin,
  Phone,
} from "lucide-react";

// Lucide 아이콘 매핑
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FileText,
  Clock,
  UtensilsCrossed,
  Rocket,
  Users,
  Settings,
  HelpCircle,
  BookOpen,
  BookMarked,
  GraduationCap,
  Lightbulb,
  Shield,
  Bell,
  Calendar,
  MapPin,
  Phone,
};

function getIcon(name: string) {
  return ICON_MAP[name] || FileText;
}

interface GuidePageLayoutProps {
  type: GuideSectionType;
  title: string;
  subtitle: string;
  label: string;
  emptyMessage: string;
}

export function GuidePageLayout({
  type,
  title,
  subtitle,
  label,
  emptyMessage,
}: GuidePageLayoutProps) {
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  useEffect(() => {
    async function fetchSections() {
      const supabase = createClient();
      const result = await getVisibleSectionList(supabase, type);
      if (result.success) {
        setSections(result.sections);
        if (result.sections.length > 0) {
          setActiveId(result.sections[0].id);
        }
      }
      setIsLoading(false);
    }
    fetchSections();
  }, [type]);

  // 검색 필터링
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q)
    );
  }, [sections, searchQuery]);

  // 카테고리별 그룹핑
  const groupedSections = useMemo(() => {
    const groups: Record<string, GuideSection[]> = {};
    for (const section of filteredSections) {
      const cat = section.category || "일반";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(section);
    }
    return groups;
  }, [filteredSections]);

  const activeSection = sections.find((s) => s.id === activeId);
  const activeIndex = filteredSections.findIndex((s) => s.id === activeId);
  const prevSection = activeIndex > 0 ? filteredSections[activeIndex - 1] : null;
  const nextSection =
    activeIndex < filteredSections.length - 1
      ? filteredSections[activeIndex + 1]
      : null;

  const handleSelectSection = (id: string) => {
    setActiveId(id);
    setMobileTocOpen(false);
    // 모바일에서 콘텐츠 영역 상단으로 스크롤
    document.getElementById("guide-content")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        {/* 헤더 + 검색 */}
        <section className="bg-navy py-16 px-6 md:px-13">
          <div className="max-w-5xl mx-auto">
            <span className="font-mono text-label font-bold text-teal tracking-label uppercase block mb-4">
              {label}
            </span>
            <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-black text-white leading-tight">
              {title}
            </h1>
            <p className="mt-4 text-white/50 text-reading">{subtitle}</p>

            {/* 검색바 */}
            <div className="mt-8 relative max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색어를 입력하세요..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 text-white text-body placeholder:text-white/30 focus:outline-none focus:border-teal"
              />
            </div>
          </div>
        </section>

        {/* 메인 콘텐츠 */}
        <section className="px-6 md:px-13 py-12">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredSections.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen size={48} className="mx-auto text-rule mb-4" />
                <p className="text-muted">
                  {searchQuery ? "검색 결과가 없습니다." : emptyMessage}
                </p>
              </div>
            ) : (
              <>
                {/* 모바일 TOC 드롭다운 */}
                <div className="lg:hidden mb-6">
                  <button
                    onClick={() => setMobileTocOpen(!mobileTocOpen)}
                    className="w-full flex items-center justify-between p-4 border border-rule bg-white text-left"
                  >
                    <span className="text-body font-medium text-ink truncate">
                      {activeSection?.title || "섹션 선택"}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-muted transition-transform flex-shrink-0 ${
                        mobileTocOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {mobileTocOpen && (
                    <div className="border border-t-0 border-rule bg-white max-h-[60vh] overflow-y-auto">
                      {Object.entries(groupedSections).map(([category, items]) => (
                        <div key={category}>
                          <div className="px-4 py-2 bg-stone text-caption font-mono font-bold text-muted uppercase tracking-wider">
                            {category}
                          </div>
                          {items.map((section) => {
                            const Icon = getIcon(section.icon || "FileText");
                            return (
                              <button
                                key={section.id}
                                onClick={() => handleSelectSection(section.id)}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                                  activeId === section.id
                                    ? "bg-teal/5 text-teal border-l-2 border-teal"
                                    : "text-ink hover:bg-stone/50"
                                }`}
                              >
                                <Icon size={16} className="flex-shrink-0" />
                                <span className="text-body truncate">
                                  {section.title}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-8">
                  {/* 데스크탑 사이드바 TOC */}
                  <aside className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto border border-rule bg-white">
                      {Object.entries(groupedSections).map(([category, items]) => (
                        <div key={category}>
                          <div className="px-4 py-2.5 bg-stone text-caption font-mono font-bold text-muted uppercase tracking-wider border-b border-rule">
                            {category}
                          </div>
                          {items.map((section) => {
                            const Icon = getIcon(section.icon || "FileText");
                            return (
                              <button
                                key={section.id}
                                onClick={() => handleSelectSection(section.id)}
                                className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors border-b border-rule/50 ${
                                  activeId === section.id
                                    ? "bg-teal/5 text-teal border-l-2 border-l-teal"
                                    : "text-ink hover:bg-stone/50"
                                }`}
                              >
                                <Icon size={14} className="flex-shrink-0" />
                                <span className="text-secondary truncate">
                                  {section.title}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </aside>

                  {/* 콘텐츠 영역 */}
                  <div id="guide-content" className="flex-1 min-w-0">
                    {activeSection && (
                      <article className="border border-rule bg-white">
                        {/* 섹션 헤더 */}
                        <div className="p-6 md:p-8 border-b border-rule">
                          <span className="font-mono text-small text-teal font-bold">
                            {String(activeSection.order_index).padStart(2, "0")}
                          </span>
                          <h2 className="mt-2 font-serif text-[clamp(22px,3vw,28px)] font-bold text-ink leading-tight">
                            {activeSection.title}
                          </h2>
                        </div>

                        {/* 섹션 본문 */}
                        <div className="p-6 md:p-8">
                          {activeSection.content_html ? (
                            <div
                              className="prose prose-sm max-w-none prose-headings:font-serif prose-h2:text-xl prose-h2:font-bold prose-h3:text-lg prose-h3:font-bold prose-blockquote:border-l-2 prose-blockquote:border-teal prose-blockquote:pl-4 prose-blockquote:text-muted prose-a:text-teal prose-a:underline"
                              dangerouslySetInnerHTML={{
                                __html: activeSection.content_html,
                              }}
                            />
                          ) : (
                            <div className="text-body text-ink leading-relaxed whitespace-pre-wrap">
                              {activeSection.content}
                            </div>
                          )}
                        </div>

                        {/* 이전/다음 네비게이션 */}
                        <div className="p-6 md:p-8 border-t border-rule flex items-center justify-between gap-4">
                          {prevSection ? (
                            <button
                              onClick={() => handleSelectSection(prevSection.id)}
                              className="flex items-center gap-2 text-muted hover:text-teal transition-colors text-body"
                            >
                              <ChevronLeft size={16} />
                              <span className="truncate max-w-[200px]">
                                {prevSection.title}
                              </span>
                            </button>
                          ) : (
                            <div />
                          )}
                          {nextSection ? (
                            <button
                              onClick={() => handleSelectSection(nextSection.id)}
                              className="flex items-center gap-2 text-muted hover:text-teal transition-colors text-body ml-auto"
                            >
                              <span className="truncate max-w-[200px]">
                                {nextSection.title}
                              </span>
                              <ChevronRight size={16} />
                            </button>
                          ) : (
                            <div />
                          )}
                        </div>
                      </article>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
