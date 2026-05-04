"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav, Footer, Skeleton, SkeletonText, MetaAttachmentList, AttachmentModal } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getNoticeDetail, getNoticeAttachments } from "@/domains/notice/service";
import type { NoticeAttachment } from "@/domains/notice/model";
import {
  NOTICE_CATEGORY_LABELS,
  type NoticeWithAuthor,
  type NoticeCategoryType,
} from "@/domains/notice/model";
import { ROUTES } from "@/lib/constants";
import { ArrowLeft, Calendar, User, Eye, Lock } from "lucide-react";
import { Button } from "@/components/common/Button";
import { sanitizeHtml } from "@/lib/sanitize";

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
  const [needsLogin, setNeedsLogin] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
        // RLS로 차단된 경우 (비로그인 + members_only) 로그인 유도
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setNeedsLogin(true);
        } else {
          setError(result.error || "공지사항을 불러올 수 없습니다.");
        }
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

  if (needsLogin) {
    return (
      <>
        <Nav />
        <main className="page-body min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 bg-stone flex items-center justify-center mx-auto mb-6">
              <Lock size={24} className="text-muted" />
            </div>
            <h2 className="text-subhead font-bold text-ink mb-2">회원 전용 공지사항</h2>
            <p className="text-body text-muted mb-6">
              이 공지사항은 회원만 확인할 수 있습니다.<br />
              로그인 후 이용해 주세요.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => router.push(`${ROUTES.LOGIN}?redirect=/notices/${id}`)}
                className="cursor-pointer"
              >
                로그인
              </Button>
              <button
                onClick={() => router.push(ROUTES.NOTICES)}
                className="text-body text-muted hover:text-ink transition-colors cursor-pointer"
              >
                목록으로 돌아가기
              </button>
            </div>
          </div>
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
              className="text-teal underline cursor-pointer"
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
              className="inline-flex items-center gap-2 text-secondary text-on-dark-muted hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={14} />
              목록으로
            </Link>

            <div className="flex items-center gap-2 mb-4">
              <span
                className={`inline-block text-caption font-medium px-2 py-0.5 ${
                  notice.category === "urgent"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-white/10 text-on-dark-muted"
                }`}
              >
                {categoryLabel}
              </span>
            </div>

            <h1 className="font-serif text-[clamp(20px,3vw,28px)] font-bold text-white leading-tight">
              {notice.title}
            </h1>

            <div className="flex flex-wrap gap-4 mt-4 text-secondary text-on-dark-muted">
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
              className="prose prose-sm max-w-none text-reading leading-prose text-ink/80"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(notice.content) }}
            />
          </div>
        </section>

        {/* 첨부파일 */}
        {attachments.length > 0 && (
          <section className="px-6 md:px-13">
            <div className="max-w-3xl mx-auto border-t border-rule pt-6 pb-6">
              <h3 className="text-body font-medium text-muted mb-3">
                첨부파일 ({attachments.length})
              </h3>
              <MetaAttachmentList attachments={attachments} onSelect={setSelectedImage} />
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
      {selectedImage && (
        <AttachmentModal url={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </>
  );
}
