"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Nav, Footer, Button, Skeleton, useToast } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getQuestionDetail, deleteQuestion, togglePinQuestion } from "@/domains/question/service";
import { type QuestionWithAnswers, type AnswerWithAuthor } from "@/domains/question/model";
import { AnswerForm } from "@/components/questions/AnswerForm";
import { useUserStore } from "@/stores/useUserStore"
import { ROUTES } from "@/lib/constants";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Trash2,
  User,
  MessageSquare,
  Image as ImageIcon,
  Globe,
  Lock,
  Pin,
  PinOff,
  Eye,
  X,
} from "lucide-react";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isActive, isAuthenticated, isStaff, canAccessAdmin } = useUserStore();

  const [question, setQuestion] = useState<QuestionWithAnswers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const questionId = params.id as string;

  useEffect(() => {
    async function fetchQuestion() {
      if (!isAuthenticated) return;

      setIsLoading(true);
      const supabase = createClient();
      const result = await getQuestionDetail(supabase, questionId);

      if (result.success && result.question) {
        setQuestion(result.question as QuestionWithAnswers);
      } else {
        showToast(result.error || "질문을 찾을 수 없습니다.", "error");
        router.push(ROUTES.QUESTIONS);
      }
      setIsLoading(false);
    }

    fetchQuestion();
  }, [questionId, isAuthenticated, router, showToast]);

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    setIsDeleting(true);
    const supabase = createClient();
    const result = await deleteQuestion(supabase, questionId);

    if (result.success) {
      showToast("질문이 삭제되었습니다.", "success");
      router.push(ROUTES.QUESTIONS);
    } else {
      showToast(result.error || "삭제에 실패했습니다.", "error");
    }
    setIsDeleting(false);
  };

  const isOwner = user?.id === question?.author_id;
  const canDelete = isOwner && question?.status === "pending";
  const isAnswered = question?.status === "answered";
  const canAnswer = isStaff && !isOwner; // 모든 스태프(admin/mentor/assistant)가 답변 가능 (본인 질문 제외)

  // 비활성 사용자 안내 (스태프 제외)
  if (!isStaff && !isActive && isAuthenticated) {
    return (
      <>
        <Nav />
        <main className="page-body min-h-screen bg-stone">
          <div className="max-w-md mx-auto px-6 py-16 text-center">
            <div className="w-16 h-16 bg-navy/10 flex items-center justify-center mx-auto mb-6">
              <Clock size={32} className="text-navy" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-ink mb-4">
              승인 대기 중
            </h1>
            <p className="text-muted text-reading leading-relaxed">
              질문방은 관리자 승인 후 이용 가능합니다.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Nav />
        <main className="page-body min-h-screen">
          <section className="bg-navy py-12 px-6 md:px-13">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-4 w-24 bg-white/20 mb-4" />
              <Skeleton className="h-8 w-3/4 bg-white/20" />
            </div>
          </section>
          <section className="px-6 md:px-13 py-8">
            <div className="max-w-4xl mx-auto space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <>
      <Nav />
      <main className="page-body min-h-screen">
        {/* 헤더 */}
        <section className="bg-navy py-12 px-6 md:px-13">
          <div className="max-w-4xl mx-auto">
            <Link
              href={ROUTES.QUESTIONS}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-secondary mb-4 transition-colors"
            >
              <ArrowLeft size={14} />
              질문 목록으로
            </Link>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-caption font-medium px-2 py-0.5 ${
                      isAnswered
                        ? "bg-teal/20 text-teal"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {isAnswered ? "답변 완료" : "답변 대기"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-caption font-medium px-2 py-0.5 ${
                      question.is_public
                        ? "bg-white/10 text-white/80"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    {question.is_public ? (
                      <>
                        <Globe size={10} />
                        공개
                      </>
                    ) : (
                      <>
                        <Lock size={10} />
                        비공개
                      </>
                    )}
                  </span>
                </div>
                <h1 className="font-serif text-[clamp(20px,3vw,28px)] font-bold text-white">
                  {question.title}
                </h1>
                <div className="flex items-center gap-4 mt-3 text-secondary text-white/70">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {question.author?.name || "익명"}
                  </span>
                  <span>
                    {new Date(question.created_at).toLocaleDateString("ko-KR")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {question.view_count || 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canAccessAdmin && (
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      const supabase = createClient();
                      const result = await togglePinQuestion(supabase, question.id, !question.is_pinned);
                      if (result.success) {
                        setQuestion({ ...question, is_pinned: !question.is_pinned });
                      }
                    }}
                    className="text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    {question.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 질문 내용 */}
        <section className="px-6 md:px-13 py-8">
          <div className="max-w-4xl mx-auto">
            {/* 본문 */}
            <div className="bg-white border border-rule p-6 mb-6">
              <p className="text-reading text-ink whitespace-pre-wrap leading-relaxed">
                {question.content}
              </p>

              {/* 첨부 이미지 */}
              {question.image_urls && question.image_urls.length > 0 && (
                <div className="mt-6 pt-6 border-t border-rule">
                  <div className="flex items-center gap-2 text-secondary text-muted mb-3">
                    <ImageIcon size={14} />
                    첨부 이미지 ({question.image_urls.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {question.image_urls.map((url, index) => (
                      <button
                        key={url}
                        onClick={() => setSelectedImage(url)}
                        className="aspect-square bg-stone border border-rule overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <img
                          src={url}
                          alt={`첨부 이미지 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 답변 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-navy" />
                <h2 className="font-medium text-ink">
                  답변 {question.answers?.length || 0}개
                </h2>
              </div>

              {question.answers && question.answers.length > 0 ? (
                question.answers.map((answer) => (
                  <AnswerCard key={answer.id} answer={answer} onImageClick={setSelectedImage} />
                ))
              ) : (
                <div className="bg-stone border border-rule p-8 text-center">
                  <Clock size={32} className="mx-auto text-muted mb-3" />
                  <p className="text-muted text-body">
                    아직 답변이 없습니다. 멘토가 곧 답변해 드릴 예정입니다.
                  </p>
                </div>
              )}

              {/* 답변 작성 폼 (멘토/관리자용) */}
              {canAnswer && (
                <div className="bg-white border border-rule p-6">
                  <h3 className="font-medium text-ink mb-4">답변 작성</h3>
                  <AnswerForm
                    questionId={question.id}
                    onSuccess={() => {
                      const supabase = createClient();
                      getQuestionDetail(supabase, questionId).then((result) => {
                        if (result.success && result.question) {
                          setQuestion(result.question as QuestionWithAnswers);
                        }
                      });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 이미지 모달 (통합) */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            onClick={() => setSelectedImage(null)}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
          <img
            src={selectedImage}
            alt="확대 이미지"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      <Footer />
    </>
  );
}

function AnswerCard({ answer, onImageClick }: { answer: AnswerWithAuthor; onImageClick: (url: string) => void }) {
  return (
    <div className="bg-teal/5 border border-teal/20 p-6">
      {/* 답변자 정보 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-teal/20 flex items-center justify-center">
          <CheckCircle size={18} className="text-teal" />
        </div>
        <div>
          <p className="text-body font-medium text-ink">
            {answer.author?.name || "멘토"}
          </p>
          <p className="text-small text-muted">
            {new Date(answer.created_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* 답변 내용 */}
      <p className="text-reading text-ink whitespace-pre-wrap leading-relaxed">
        {answer.content}
      </p>

      {/* 첨부 이미지 */}
      {answer.image_urls && answer.image_urls.length > 0 && (
        <div className="mt-4 pt-4 border-t border-teal/20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {answer.image_urls.map((url, index) => (
              <button
                key={url}
                onClick={() => onImageClick(url)}
                className="aspect-square bg-white border border-teal/20 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
              >
                <img
                  src={url}
                  alt={`답변 이미지 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// AnswerForm은 @/components/questions/AnswerForm에서 import
