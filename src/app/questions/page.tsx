"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Nav, Footer, Button, Skeleton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getPublicQuestionList, getMyQuestions, getQuestionList } from "@/domains/question/service";
import { type QuestionWithAuthor } from "@/domains/question/model";
import { useUserStore } from "@/stores/useUserStore";
import { ROUTES } from "@/lib/constants";
import { Plus, MessageCircle, Clock, CheckCircle, Globe, Lock, User } from "lucide-react";
import { StaffQuestionCard } from "@/components/questions/StaffQuestionCard";
import { ElapsedBadge } from "@/components/questions/ElapsedBadge";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isActive, isAuthenticated, isStaff } = useUserStore();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "answered">(
    isStaff ? "pending" : "all"
  );
  const [viewMode, setViewMode] = useState<"public" | "mine" | "all">(
    isStaff ? "all" : "public"
  );

  const fetchQuestions = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    const supabase = createClient();

    const result =
      viewMode === "all"
        ? await getQuestionList(supabase, {
            status: statusFilter === "all" ? undefined : statusFilter,
          })
        : viewMode === "mine"
        ? await getMyQuestions(supabase)
        : await getPublicQuestionList(supabase);

    if (result.success) {
      setQuestions(result.questions);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, viewMode, statusFilter]);

  const filteredQuestions =
    viewMode === "all"
      ? questions // 이미 서버에서 필터됨
      : questions.filter((q) => {
          if (statusFilter === "all") return true;
          return q.status === statusFilter;
        });

  const pendingCount = questions.filter((q) => q.status === "pending").length;

  // 비활성 사용자 안내 (스태프 제외)
  if (!isStaff && !isActive && isAuthenticated) {
    return (
      <>
        <Nav />
        <main className="pt-24 pb-20 min-h-screen bg-stone">
          <div className="max-w-md mx-auto px-6 py-16 text-center">
            <div className="w-16 h-16 bg-navy/10 flex items-center justify-center mx-auto mb-6">
              <Clock size={32} className="text-navy" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-ink mb-4">
              승인 대기 중
            </h1>
            <p className="text-muted text-[15px] leading-relaxed">
              질문방은 관리자 승인 후 이용 가능합니다.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        {isStaff ? (
          /* ========== 스태프 컴팩트 헤더 ========== */
          <section className="bg-navy py-6 px-6 md:px-13">
            <div className="max-w-4xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="font-serif text-xl font-bold text-white">
                  질문 관리
                </h1>
                {pendingCount > 0 && (
                  <span className="bg-teal text-white text-[12px] font-bold px-2.5 py-1">
                    미답변 {pendingCount}
                  </span>
                )}
              </div>
            </div>

            {/* 필터 — 헤더 내 통합 */}
            <div className="max-w-4xl mt-4 flex gap-2">
              <StaffFilterButton
                active={statusFilter === "pending"}
                onClick={() => setStatusFilter("pending")}
                count={pendingCount}
              >
                미답변
              </StaffFilterButton>
              <StaffFilterButton
                active={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
              >
                전체
              </StaffFilterButton>
              <StaffFilterButton
                active={statusFilter === "answered"}
                onClick={() => setStatusFilter("answered")}
              >
                답변 완료
              </StaffFilterButton>
            </div>
          </section>
        ) : (
          /* ========== 재원생 Hero 헤더 ========== */
          <>
            <section className="bg-navy py-16 px-6 md:px-13">
              <div className="max-w-4xl flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <span className="font-mono text-[10px] font-bold text-teal tracking-[0.28em] uppercase block mb-4">
                    Questions / 수학 질문방
                  </span>
                  <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-black text-white leading-tight">
                    수학 질문방
                  </h1>
                  <p className="mt-4 text-white/50 text-[15px]">
                    모르는 문제를 올리면 멘토가 직접 풀이해 드립니다.
                  </p>
                </div>
                <Link href={`${ROUTES.QUESTIONS}/new`}>
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Plus size={16} />
                    질문하기
                  </Button>
                </Link>
              </div>
            </section>

            {/* 탭 */}
            <section className="border-b border-rule">
              <div className="px-6 md:px-13 flex">
                <TabButton
                  active={viewMode === "public"}
                  onClick={() => setViewMode("public")}
                >
                  <Globe size={16} />
                  전체 공개
                </TabButton>
                <TabButton
                  active={viewMode === "mine"}
                  onClick={() => setViewMode("mine")}
                >
                  <User size={16} />
                  내 질문
                </TabButton>
              </div>
            </section>

            {/* 상태 필터 */}
            <section className="bg-stone border-b border-rule">
              <div className="px-6 md:px-13 py-3 flex gap-2">
                <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                  전체
                </FilterButton>
                <FilterButton active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")}>
                  답변 대기
                </FilterButton>
                <FilterButton active={statusFilter === "answered"} onClick={() => setStatusFilter("answered")}>
                  답변 완료
                </FilterButton>
              </div>
            </section>
          </>
        )}

        {/* 질문 목록 */}
        <section className="px-6 md:px-13 py-8">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-5 border border-rule bg-white">
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle size={48} className="mx-auto text-rule mb-4" />
                <p className="text-muted mb-6">
                  {statusFilter === "pending"
                    ? "미답변 질문이 없습니다."
                    : statusFilter === "answered"
                    ? "답변 완료된 질문이 없습니다."
                    : "질문이 없습니다."}
                </p>
              </div>
            ) : isStaff ? (
              /* 스태프: 인라인 아코디언 카드 */
              <div className="space-y-3">
                {filteredQuestions.map((question) => (
                  <StaffQuestionCard
                    key={question.id}
                    question={question}
                    onUpdated={fetchQuestions}
                  />
                ))}
              </div>
            ) : (
              /* 재원생: 기존 카드 */
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    isOwner={user?.id === question.author_id}
                  />
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

/* ========== 하위 컴포넌트 ========== */

function TabButton({
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
      className={`flex items-center gap-2 px-4 py-3 text-[14px] font-medium border-b-2 transition-colors ${
        active
          ? "border-navy text-navy"
          : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
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
      className={`px-4 py-2 text-[13px] font-medium border transition-colors ${
        active
          ? "bg-navy border-navy text-white"
          : "bg-white border-rule text-ink hover:border-navy"
      }`}
    >
      {children}
    </button>
  );
}

function StaffFilterButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? "bg-white text-navy"
          : "bg-white/10 text-white/70 hover:bg-white/20"
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className={`ml-1.5 ${active ? "text-teal" : "text-teal"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function QuestionItem({
  question,
  isOwner,
}: {
  question: QuestionWithAuthor;
  isOwner: boolean;
}) {
  const isAnswered = question.status === "answered";
  const isPublic = question.is_public;

  return (
    <Link
      href={`${ROUTES.QUESTIONS}/${question.id}`}
      className="group block p-5 border border-rule bg-white hover:border-navy transition-colors"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${
            isAnswered ? "bg-teal/10" : "bg-stone"
          }`}
        >
          {isAnswered ? (
            <CheckCircle size={18} className="text-teal" />
          ) : (
            <Clock size={18} className="text-muted" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 ${
                isAnswered ? "bg-teal/10 text-teal" : "bg-stone text-muted"
              }`}
            >
              {isAnswered ? "답변 완료" : "답변 대기"}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 ${
                isPublic ? "bg-navy/5 text-navy" : "bg-stone text-muted"
              }`}
            >
              {isPublic ? <Globe size={10} /> : <Lock size={10} />}
              {isPublic ? "공개" : "비공개"}
            </span>
            {isOwner && (
              <span className="text-[11px] font-medium px-2 py-0.5 bg-teal/10 text-teal">
                내 질문
              </span>
            )}
          </div>
          <h3 className="text-[15px] font-medium text-ink truncate group-hover:text-navy transition-colors">
            {question.is_pinned && (
              <span className="text-teal font-bold mr-1">[고정]</span>
            )}
            {question.title}
          </h3>
          <p className="text-[13px] text-muted mt-1 line-clamp-2">
            {question.content}
          </p>
          <div className="flex items-center gap-3 mt-2">
            {isPublic && !isOwner && question.author?.name && (
              <span className="flex items-center gap-1 text-[12px] text-muted/70">
                <User size={11} />
                {question.author.name}
              </span>
            )}
            <ElapsedBadge
              createdAt={question.created_at}
              isPending={!isAnswered}
            />
          </div>
        </div>

        {question.image_urls && question.image_urls.length > 0 && (
          <div className="flex-shrink-0 w-16 h-16 bg-stone flex items-center justify-center text-[11px] text-muted">
            +{question.image_urls.length}
          </div>
        )}
      </div>
    </Link>
  );
}
