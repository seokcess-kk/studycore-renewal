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
        <main className="page-body">
          <section className="bg-navy py-12 px-6 md:px-13">
            <div className="max-w-3xl mx-auto">
              <Skeleton className="h-4 w-20 mb-4 bg-white/20" />
              <Skeleton className="h-10 w-3/4 mb-4 bg-white/20" />
              <Skeleton className="h-4 w-48 bg-white/20" />
            </div>
          </section>
          <section className="py-12 px-6 md:px-13">
            <div className="max-w-3xl mx-auto">
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
        <main className="page-body min-h-screen flex items-center justify-center">
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
      <main className="page-body">
        {/* 헤더 */}
        <section className="bg-navy py-12 px-6 md:px-13">
          <div className="max-w-3xl mx-auto">
            <Link
              href={ROUTES.NOTICES}
              className="inline-flex items-center gap-2 text-secondary text-white/60 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={14} />
              목록으로
            </Link>

            <div className="flex items-center gap-2 mb-4">
              <span
                className={`inline-block text-caption font-medium px-2 py-0.5 ${
                  notice.category === "urgent"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {categoryLabel}
              </span>
            </div>

            <h1 className="font-serif text-[clamp(20px,3vw,28px)] font-bold text-white leading-tight">
              {notice.title}
            </h1>

            <div className="flex flex-wrap gap-4 mt-4 text-secondary text-white/70">
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
          <div className="max-w-3xl mx-auto">
            <div
              className="prose prose-sm max-w-none text-reading leading-relaxed text-ink/80"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
          </div>
        </section>

        {/* 첨부파일 */}
        {attachments.length > 0 && (
          <section className="px-6 md:px-13">
            <div className="max-w-3xl mx-auto border-t border-rule pt-6 pb-6">
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
          <div className="max-w-3xl mx-auto border-t border-rule pt-8">
            <Link
              href={ROUTES.NOTICES}
              className="inline-flex items-center gap-2 px-6 py-3 border border-rule text-body font-medium text-ink hover:border-navy transition-colors"
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
