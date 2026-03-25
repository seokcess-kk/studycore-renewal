"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Pin, Image as ImageIcon } from "lucide-react";
import { QuestionStatusBadge } from "@/components/admin/StatusBadge";
import { createBrowserClient } from "@/lib/supabase/client";
import { getQuestionList } from "@/domains/question/service";
import type { QuestionWithAuthor } from "@/domains/question/model";
import { formatDistanceToNow } from "@/lib/utils";

type FilterStatus = "all" | "pending" | "answered";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    async function fetchQuestions() {
      setIsLoading(true);
      const supabase = createBrowserClient();
      const result = await getQuestionList(supabase, {
        status: filterStatus === "all" ? undefined : filterStatus,
      });

      if (result.success) {
        setQuestions(result.questions);
      }
      setIsLoading(false);
    }

    fetchQuestions();
  }, [filterStatus]);

  const pendingCount = questions.filter((q) => q.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* 상단 */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <p className="text-muted">
          총 {questions.length}개
          {pendingCount > 0 && (
            <span className="ml-2 text-orange-600">
              (미답변 {pendingCount}개)
            </span>
          )}
        </p>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
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
                  {formatDistanceToNow(question.created_at)}
                </span>
              </div>
              <h3 className="mb-1 font-medium text-ink line-clamp-1">{question.title}</h3>
              <p className="line-clamp-2 text-body text-muted">
                {question.content}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
