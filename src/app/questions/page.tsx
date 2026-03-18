"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Nav, Footer, Skeleton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getPublicQuestionList, getMyQuestions, getQuestionList } from "@/domains/question/service";
import { type QuestionWithAuthor } from "@/domains/question/model";
import { useUserStore } from "@/stores/useUserStore";
import { ROUTES } from "@/lib/constants";
import { MessageCircle, Clock, Globe, Lock, User, Eye, Pencil, Image as ImageIcon } from "lucide-react";
import { StaffQuestionCard } from "@/components/questions/StaffQuestionCard";

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
              <div className="px-6 md:px-13 py-3 flex gap-3">
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
                    : viewMode === "mine"
                    ? "아직 작성한 질문이 없습니다."
                    : "질문이 없습니다."}
                </p>
                {!isStaff && (
                  <Link
                    href={`${ROUTES.QUESTIONS}/new`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal border-[1.5px] border-teal text-white text-[13px] font-bold tracking-[0.04em] hover:bg-teal-d transition-colors cursor-pointer"
                  >
                    <Pencil size={14} />
                    첫 질문 작성하기
                  </Link>
                )}
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
              /* 재원생: 게시판형 컴팩트 목록 */
              <div className="border border-rule bg-white divide-y divide-rule">
                {/* 헤더 행 — 데스크톱만 */}
                <div className="hidden md:grid grid-cols-[auto_1fr_100px_80px] items-center gap-4 px-5 py-2.5 bg-stone text-[11px] font-medium text-muted tracking-wide uppercase">
                  <span className="w-[52px]">상태</span>
                  <span>제목</span>
                  <span className="text-center">작성자</span>
                  <span className="text-right">날짜</span>
                </div>
                {filteredQuestions.map((question) => (
                  <QuestionRow
                    key={question.id}
                    question={question}
                    isOwner={user?.id === question.author_id}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
        {/* 모바일 floating 질문하기 버튼 (재원생 전용) */}
        {!isStaff && (
          <Link
            href={`${ROUTES.QUESTIONS}/new`}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-teal border-[1.5px] border-teal text-white flex items-center justify-center hover:bg-teal-d transition-colors cursor-pointer"
            aria-label="질문하기"
          >
            <Pencil size={22} />
          </Link>
        )}
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
      className={`flex items-center gap-2 px-4 py-3 text-[14px] font-medium border-b-2 transition-colors cursor-pointer ${
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
      className={`px-4 py-2.5 text-[13px] font-medium border transition-colors cursor-pointer ${
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
      className={`px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
        active
          ? "bg-white text-navy"
          : "bg-white/10 text-white/70 hover:bg-white/20"
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className={`ml-1.5 ${active ? "text-navy" : "text-teal"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function QuestionRow({
  question,
  isOwner,
}: {
  question: QuestionWithAuthor;
  isOwner: boolean;
}) {
  const isAnswered = question.status === "answered";
  const hasImages = question.image_urls && question.image_urls.length > 0;

  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
  };

  return (
    <Link
      href={`${ROUTES.QUESTIONS}/${question.id}`}
      className="group block hover:bg-stone/40 transition-colors cursor-pointer"
    >
      {/* 데스크톱 레이아웃 */}
      <div className="hidden md:grid grid-cols-[auto_1fr_100px_80px] items-center gap-4 px-5 py-3">
        {/* 상태 뱃지 */}
        <span
          className={`w-[52px] text-center text-[11px] font-medium px-1.5 py-0.5 ${
            isAnswered ? "bg-teal/10 text-teal" : "bg-stone text-muted"
          }`}
        >
          {isAnswered ? "완료" : "대기"}
        </span>

        {/* 제목 + 태그 */}
        <div className="flex items-center gap-2 min-w-0">
          {question.is_pinned && (
            <span className="flex-shrink-0 text-[10px] font-bold text-teal bg-teal/10 px-1.5 py-0.5">고정</span>
          )}
          <h3 className="text-[14px] text-ink truncate group-hover:text-navy transition-colors">
            {question.title}
          </h3>
          {!question.is_public && (
            <Lock size={11} className="flex-shrink-0 text-muted/50" />
          )}
          {isOwner && (
            <span className="flex-shrink-0 text-[10px] font-medium text-teal">내 글</span>
          )}
          {hasImages && (
            <ImageIcon size={12} className="flex-shrink-0 text-muted/40" />
          )}
          {(question.view_count ?? 0) > 0 && (
            <span className="flex-shrink-0 flex items-center gap-0.5 text-[11px] text-muted/50">
              <Eye size={10} />
              {question.view_count}
            </span>
          )}
        </div>

        {/* 작성자 */}
        <span className="text-[12px] text-muted text-center truncate">
          {question.author?.name || "익명"}
        </span>

        {/* 날짜 */}
        <span className="text-[12px] text-muted text-right">
          {formatShortDate(question.created_at)}
        </span>
      </div>

      {/* 모바일 레이아웃 */}
      <div className="md:hidden px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 ${
              isAnswered ? "bg-teal/10 text-teal" : "bg-stone text-muted"
            }`}
          >
            {isAnswered ? "완료" : "대기"}
          </span>
          {question.is_pinned && (
            <span className="text-[10px] font-bold text-teal bg-teal/10 px-1.5 py-0.5">고정</span>
          )}
          {!question.is_public && (
            <Lock size={10} className="text-muted/50" />
          )}
          {isOwner && (
            <span className="text-[10px] font-medium text-teal">내 글</span>
          )}
        </div>
        <h3 className="text-[14px] text-ink truncate group-hover:text-navy transition-colors">
          {question.title}
        </h3>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted">
          <span>{question.author?.name || "익명"}</span>
          <span>{formatShortDate(question.created_at)}</span>
          {hasImages && <ImageIcon size={11} className="text-muted/40" />}
          {(question.view_count ?? 0) > 0 && (
            <span className="flex items-center gap-0.5">
              <Eye size={10} />
              {question.view_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
