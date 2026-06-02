"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Pin, Image as ImageIcon } from "lucide-react";
import { QuestionStatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { createBrowserClient } from "@/lib/supabase/client";
import { getQuestionList } from "@/domains/question/service";
import type { QuestionWithAuthor } from "@/domains/question/model";
import { formatDateTime } from "@/lib/utils";

type FilterStatus = "all" | "pending" | "answered";
const PAGE_SIZE = 10;

function AdminQuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = ((): FilterStatus => {
    const s = searchParams.get("status");
    return s === "pending" || s === "answered" ? s : "all";
  })();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [questions, setQuestions] = useState<QuestionWithAuthor[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const updateQuery = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === "") sp.delete(key);
      else sp.set(key, value);
    }
    const qs = sp.toString();
    router.push(qs ? `/admin/questions?${qs}` : "/admin/questions");
  };

  const handleStatusChange = (s: FilterStatus) => {
    updateQuery({ status: s === "all" ? undefined : s, page: undefined });
  };

  const handlePageChange = (p: number) => {
    updateQuery({ page: p === 1 ? undefined : String(p) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true);
      const supabase = createBrowserClient();
      const result = await getQuestionList(supabase, {
        status: status === "all" ? undefined : status,
        page,
        pageSize: PAGE_SIZE,
      });
      if (result.success) {
        setQuestions(result.questions);
        const fetchedTotal = result.total ?? result.questions.length;
        setTotal(fetchedTotal);
        setTotalPages(Math.max(1, Math.ceil(fetchedTotal / PAGE_SIZE)));
      }
      setIsLoading(false);
    }
    fetchQuestions();
  }, [status, page]);

  return (
    <div className="space-y-6">
      {/* 상단 */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <p className="text-muted">총 {total}개</p>

        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as FilterStatus)}
          className="h-9 md:h-10 border border-rule bg-white px-3 text-body focus:border-navy focus:outline-none cursor-pointer"
        >
          <option value="all">모든 상태</option>
          <option value="pending">미답변</option>
          <option value="answered">답변 완료</option>
        </select>
      </div>

      {/* 질문 목록 */}
      <div className="space-y-3 md:space-y-4">
        {isLoading ? (
          <div className="border border-rule bg-white py-12 text-center">
            <p className="text-muted">로딩 중...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="border border-rule bg-white py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted" />
            <p className="mt-4 text-muted">질문이 없습니다.</p>
          </div>
        ) : (
          questions.map((question) => (
            <Link
              key={question.id}
              href={`/admin/questions/${question.id}`}
              className="block border border-rule bg-white p-4 md:p-6 transition-colors hover:bg-stone/50"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 md:gap-3">
                <QuestionStatusBadge status={question.status} size="sm" />
                {question.is_pinned && (
                  <span className="flex items-center gap-1 text-caption text-teal font-medium">
                    <Pin size={12} />
                    고정
                  </span>
                )}
                {((question.attachments && question.attachments.length > 0) ||
                  (question.image_urls && question.image_urls.length > 0)) && (
                  <span className="flex items-center gap-1 text-caption text-muted">
                    <ImageIcon size={12} />
                    {(question.attachments || question.image_urls)!.length}
                  </span>
                )}
                <span className="text-body text-muted">
                  {question.author?.name || "알 수 없음"}
                </span>
                <span className="text-body text-muted ml-auto">
                  {formatDateTime(question.created_at)}
                </span>
              </div>
              <h3 className="mb-1 font-medium text-ink line-clamp-1">{question.title}</h3>
              <p className="line-clamp-2 text-body text-muted">{question.content}</p>
            </Link>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default function AdminQuestionsPage() {
  return (
    <Suspense>
      <AdminQuestionsContent />
    </Suspense>
  );
}
