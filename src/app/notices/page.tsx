"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Nav, Footer, Skeleton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getNoticeList } from "@/domains/notice/service";
import {
  NOTICE_CATEGORY_LABELS,
  type NoticeWithAuthor,
  type NoticeCategoryType,
} from "@/domains/notice/model";
import { ROUTES } from "@/lib/constants";
import { Pin, ChevronRight, Eye } from "lucide-react";

export default function NoticesPage() {
  const [notices, setNotices] = useState<NoticeWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState<string | undefined>();
  const pageSize = 10;

  useEffect(() => {
    async function fetchNotices() {
      setIsLoading(true);
      const supabase = createClient();
      const result = await getNoticeList(supabase, {
        category,
        page,
        pageSize,
      });

      if (result.success) {
        setNotices(result.notices);
        setTotal(result.total);
      }
      setIsLoading(false);
    }

    fetchNotices();
  }, [page, category]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <Nav />
      <main className="page-body">
        {/* 헤더 */}
        <section className="bg-navy section-sm px-6 md:px-13">
          <div className="max-w-4xl mx-auto">
            <span className="font-mono text-label font-bold text-teal tracking-label uppercase block mb-4">
              Notices / 공지사항
            </span>
            <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-black text-white leading-tight">
              공지사항
            </h1>
            <p className="mt-4 text-white/70 text-reading">
              스터디코어 1.0의 중요한 소식과 안내사항입니다.
            </p>
          </div>
        </section>

        {/* 카테고리 필터 */}
        <section className="border-b border-rule">
          <div className="px-6 md:px-13 py-4 flex gap-2 overflow-x-auto">
            <FilterButton
              active={!category}
              onClick={() => {
                setCategory(undefined);
                setPage(1);
              }}
            >
              전체
            </FilterButton>
            {Object.entries(NOTICE_CATEGORY_LABELS).map(([value, label]) => (
              <FilterButton
                key={value}
                active={category === value}
                onClick={() => {
                  setCategory(value);
                  setPage(1);
                }}
              >
                {label}
              </FilterButton>
            ))}
          </div>
        </section>

        {/* 공지사항 목록 */}
        <section className="px-6 md:px-13 py-8">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-5 border border-rule bg-white">
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted">등록된 공지사항이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {notices.map((notice) => (
                  <NoticeItem key={notice.id} notice={notice} />
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 text-body font-medium border transition-colors ${
                      page === i + 1
                        ? "bg-navy border-navy text-white"
                        : "border-rule text-ink hover:border-navy"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-secondary font-medium border whitespace-nowrap transition-colors ${
        active
          ? "bg-navy border-navy text-white"
          : "bg-white border-rule text-ink hover:border-navy"
      }`}
    >
      {children}
    </button>
  );
}

function NoticeItem({ notice }: { notice: NoticeWithAuthor }) {
  const categoryLabel =
    NOTICE_CATEGORY_LABELS[notice.category as NoticeCategoryType];

  return (
    <Link
      href={`${ROUTES.NOTICES}/${notice.id}`}
      className="group flex items-center gap-4 p-5 border-b border-rule hover:bg-stone/50 transition-colors"
    >
      {/* 고정 아이콘 */}
      {notice.is_pinned && (
        <div className="flex-shrink-0 w-8 h-8 bg-teal/10 flex items-center justify-center">
          <Pin size={14} className="text-teal" />
        </div>
      )}

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-caption font-medium px-2 py-0.5 ${
              notice.category === "urgent"
                ? "bg-red-100 text-red-600"
                : "bg-stone text-muted"
            }`}
          >
            {categoryLabel}
          </span>
        </div>
        <h3 className="text-reading font-medium text-ink truncate group-hover:text-navy transition-colors">
          {notice.title}
        </h3>
        <p className="text-secondary text-muted mt-1">
          {new Date(notice.created_at).toLocaleDateString("ko-KR")} ·{" "}
          {notice.author?.name || "관리자"}
          {(notice.view_count ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 ml-2">
              <Eye size={11} />
              {notice.view_count}
            </span>
          )}
        </p>
      </div>

      {/* 화살표 */}
      <ChevronRight
        size={18}
        className="flex-shrink-0 text-rule group-hover:text-navy transition-colors"
      />
    </Link>
  );
}
