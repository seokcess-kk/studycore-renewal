"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { QuestionStatusBadge } from "@/components/admin/StatusBadge";
import { createBrowserClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "@/lib/utils";

interface QuestionWithAuthor {
  id: string;
  title: string;
  content: string;
  status: "pending" | "answered";
  created_at: string;
  author: {
    name: string;
    school: string | null;
    grade: number | null;
  } | null;
}

type FilterStatus = "all" | "pending" | "answered";

export default function AdminQuestionsPage() {
  const supabase = createBrowserClient();
  const [questions, setQuestions] = useState<QuestionWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    async function fetchQuestions() {
      try {
        let query = supabase
          .from("questions")
          .select(
            `
            id,
            title,
            content,
            status,
            created_at,
            author:profiles!author_id (
              name,
              school,
              grade
            )
          `
          )
          .order("created_at", { ascending: false });

        if (filterStatus !== "all") {
          query = query.eq("status", filterStatus);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Supabase returns joined relations as arrays, extract first element
        const mapped = (data || []).map((q) => {
          const author = q.author as unknown as { name: string; school: string | null; grade: number | null } | null;
          return {
            ...q,
            author,
          };
        });
        setQuestions(mapped);
      } catch (error) {
        console.error("질문 목록 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestions();
  }, [supabase, filterStatus]);

  const pendingCount = questions.filter((q) => q.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* 상단 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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
            className="h-10 border border-rule bg-white px-3 text-sm focus:border-navy focus:outline-none"
          >
            <option value="all">모든 상태</option>
            <option value="pending">미답변</option>
            <option value="answered">답변 완료</option>
          </select>
        </div>
      </div>

      {/* 질문 목록 */}
      <div className="space-y-4">
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
              className="block border border-rule bg-white p-6 transition-colors hover:bg-stone/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <QuestionStatusBadge status={question.status} size="sm" />
                    <span className="text-sm text-muted">
                      {question.author?.name || "알 수 없음"}
                      {question.author?.school && (
                        <> · {question.author.school}</>
                      )}
                      {question.author?.grade && (
                        <> {question.author.grade}학년</>
                      )}
                    </span>
                  </div>
                  <h3 className="mb-2 font-medium text-ink">{question.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted">
                    {question.content}
                  </p>
                </div>
                <span className="ml-4 text-sm text-muted">
                  {formatDistanceToNow(question.created_at)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
