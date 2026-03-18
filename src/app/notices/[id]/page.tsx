"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav, Footer, Skeleton, SkeletonText } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getNoticeDetail, getNoticeAttachments } from "@/domains/notice/service";
import type { NoticeAttachment } from "@/domains/notice/model";
import {
  NOTICE_CATEGORY_LABELS,
  type NoticeWithAuthor,
  type NoticeCategoryType,
} from "@/domains/notice/model";
import { ROUTES } from "@/lib/constants";
import { ArrowLeft, Calendar, User, Eye, FileText, Download } from "lucide-react";

export default function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [notice, setNotice] = useState<NoticeWithAuthor | null>(null);
  const [attachments, setAttachments] = useState<NoticeAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchNotice() {
      setIsLoading(true);
      const supabase = createClient();
      const result = await getNoticeDetail(supabase, id);

      if (result.success && result.notice) {
        setNotice(result.notice as NoticeWithAuthor);
        const atts = await getNoticeAttachments(supabase, id);
        setAttachments(atts);
      } else {
        setError(result.error || "공지사항을 불러올 수 없습니다.");
      }
      setIsLoading(false);
    }

    fetchNotice();
  }, [id]);

  if (isLoading) {
    return (
      <>
        <Nav />
        <main className="pt-24 pb-20">
          <section className="bg-stone py-12 px-6 md:px-13 border-b border-rule">
            <div className="max-w-3xl">
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-4 w-48" />
            </div>
          </section>
          <section className="py-12 px-6 md:px-13">
            <div className="max-w-3xl">
              <SkeletonText lines={10} />
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !notice) {
    return (
      <>
        <Nav />
        <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted mb-4">{error || "공지사항을 찾을 수 없습니다."}</p>
            <button
              onClick={() => router.push(ROUTES.NOTICES)}
              className="text-teal underline"
            >
              목록으로 돌아가기
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const categoryLabel =
    NOTICE_CATEGORY_LABELS[notice.category as NoticeCategoryType];

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        {/* 헤더 */}
        <section className="bg-stone py-12 px-6 md:px-13 border-b border-rule">
          <div className="max-w-3xl">
            <Link
              href={ROUTES.NOTICES}
              className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-ink mb-6"
            >
              <ArrowLeft size={14} />
              목록으로
            </Link>

            <span
              className={`inline-block text-[11px] font-medium px-2 py-0.5 mb-4 ${
                notice.category === "urgent"
                  ? "bg-red-100 text-red-600"
                  : "bg-white text-muted border border-rule"
              }`}
            >
              {categoryLabel}
            </span>

            <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink leading-tight">
              {notice.title}
            </h1>

            <div className="flex flex-wrap gap-4 mt-6 text-[13px] text-muted">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {notice.author?.name || "관리자"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(notice.created_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                조회 {notice.view_count}
              </span>
            </div>
          </div>
        </section>

        {/* 본문 */}
        <section className="py-12 px-6 md:px-13">
          <div className="max-w-3xl">
            <div
              className="prose prose-sm max-w-none text-[15px] leading-relaxed text-ink/80"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
          </div>
        </section>

        {/* 첨부파일 */}
        {attachments.length > 0 && (
          <section className="px-6 md:px-13">
            <div className="max-w-3xl border-t border-rule pt-6 pb-6">
              <h3 className="text-sm font-medium text-muted mb-3">
                첨부파일 ({attachments.length})
              </h3>
              <div className="space-y-2">
                {attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border border-rule px-4 py-2.5 hover:border-navy transition-colors group"
                  >
                    <FileText className="h-4 w-4 text-muted group-hover:text-navy" />
                    <span className="flex-1 truncate text-sm text-ink">
                      {att.file_name}
                    </span>
                    {att.file_size && (
                      <span className="text-xs text-muted">
                        {att.file_size > 1024 * 1024
                          ? `${(att.file_size / 1024 / 1024).toFixed(1)}MB`
                          : `${(att.file_size / 1024).toFixed(0)}KB`}
                      </span>
                    )}
                    <Download className="h-4 w-4 text-muted group-hover:text-teal" />
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 하단 네비게이션 */}
        <section className="px-6 md:px-13">
          <div className="max-w-3xl border-t border-rule pt-8">
            <Link
              href={ROUTES.NOTICES}
              className="inline-flex items-center gap-2 px-6 py-3 border border-rule text-[14px] font-medium text-ink hover:border-navy transition-colors"
            >
              <ArrowLeft size={14} />
              목록으로 돌아가기
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
