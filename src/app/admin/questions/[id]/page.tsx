"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBrowserClient } from "@/lib/supabase/client";
import { getQuestionDetail, createAnswer, deleteAnswer, togglePinQuestion, deleteQuestion } from "@/domains/question/service";
import {
  type QuestionWithAnswers,
  type AnswerWithAuthor,
  type QuestionAttachment,
  toMetaAttachments,
} from "@/domains/question/model";
import { ImageUploader, type UploadedFileMeta } from "@/components/common/ImageUploader";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/Toast";
import { formatDistanceToNow } from "@/lib/utils";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  User,
  MessageSquare,
  Image as ImageIcon,
  Send,
  Pin,
  PinOff,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AttachmentModal, AttachmentList, MetaAttachmentList } from "@/components/common";

// 폼 스키마 (question_id 제외 - 페이지에서 주입)
const answerFormSchema = z.object({
  content: z.string().min(10, "답변은 10자 이상 입력해주세요"),
  image_urls: z.array(z.string().url()).max(5).optional(),
});

type AnswerFormData = z.infer<typeof answerFormSchema>;

export default function AdminQuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const [question, setQuestion] = useState<QuestionWithAnswers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [attachmentsMeta, setAttachmentsMeta] = useState<QuestionAttachment[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isQuestionExpanded, setIsQuestionExpanded] = useState(false);

  const questionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnswerFormData>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: {
      content: "",
      image_urls: [],
    },
  });

  // 질문 조회
  const fetchQuestion = async () => {
    if (!questionId) {
      showToast("질문 ID가 없습니다.", "error");
      router.push("/admin/questions");
      return;
    }

    setIsLoading(true);
    const result = await getQuestionDetail(supabase, questionId);

    if (result.success && result.question) {
      setQuestion(result.question as QuestionWithAnswers);
    } else {
      showToast(result.error || "질문을 찾을 수 없습니다.", "error");
      router.push("/admin/questions");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  // 답변 등록
  const onSubmit = async (data: AnswerFormData) => {
    setIsSubmitting(true);

    if (!question?.id) {
      showToast("질문 정보를 찾을 수 없습니다.", "error");
      setIsSubmitting(false);
      return;
    }

    const result = await createAnswer(supabase, {
      question_id: question.id,
      content: data.content,
      image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      attachments: attachmentsMeta.length > 0 ? attachmentsMeta : undefined,
    });

    if (result.success) {
      showToast("답변이 등록되었습니다.", "success");
      reset();
      setImageUrls([]);
      setAttachmentsMeta([]);
      // 목록 새로고침
      await fetchQuestion();
    } else {
      showToast(result.error || "답변 등록에 실패했습니다.", "error");
    }

    setIsSubmitting(false);
  };

  const isAnswered = question?.status === "answered";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-stone animate-pulse" />
        <div className="border border-rule bg-white p-6">
          <div className="h-6 w-3/4 bg-stone animate-pulse mb-4" />
          <div className="h-24 bg-stone animate-pulse" />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">질문을 찾을 수 없습니다.</p>
        <Link
          href="/admin/questions"
          className="mt-4 inline-block text-teal hover:underline transition-colors duration-200 cursor-pointer"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상단 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-2 text-muted hover:text-ink text-body transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft size={16} />
          목록으로
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <span
            className={`text-caption font-medium px-2 py-1 ${
              isAnswered
                ? "bg-teal/10 text-teal"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            {isAnswered ? "답변 완료" : "답변 대기"}
          </span>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-small text-muted hover:text-red-500 border border-rule hover:border-red-300 transition-colors duration-200 cursor-pointer"
          >
            <Trash2 size={14} />
            삭제
          </button>
        </div>
      </div>

      {/* 질문 정보 */}
      <div className="border border-rule bg-white p-4 md:p-6">
        <div className="mb-4">
          <h1 className="font-serif text-fluid-h2 font-bold text-ink mb-3">
            {question.is_pinned && (
              <span className="text-teal mr-2">[고정]</span>
            )}
            {question.title}
          </h1>
          <button
            type="button"
            onClick={async () => {
              const supabase = createBrowserClient();
              const result = await togglePinQuestion(
                supabase,
                question.id,
                !question.is_pinned
              );
              if (result.success) {
                setQuestion({ ...question, is_pinned: !question.is_pinned });
              }
            }}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-small border border-rule hover:bg-stone transition-colors duration-200 cursor-pointer"
          >
            {question.is_pinned ? (
              <>
                <PinOff size={14} />
                고정 해제
              </>
            ) : (
              <>
                <Pin size={14} />
                고정
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 text-body text-muted mb-6">
          <span className="flex items-center gap-1">
            <User size={14} />
            {question.author?.name || "익명"}
          </span>
          <span>{formatDistanceToNow(question.created_at)}</span>
        </div>

        <div className="relative">
          <div className={cn(
            "overflow-hidden transition-all duration-200",
            !isQuestionExpanded && "max-h-[120px]"
          )}>
            <p className="text-reading text-ink whitespace-pre-wrap leading-prose">
              {question.content}
            </p>
          </div>

          {/* 그라데이션 + 펼치기 버튼 */}
          {!isQuestionExpanded && (question.content.length > 200 || question.content.split("\n").length > 4) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent pt-8">
              <button
                onClick={() => setIsQuestionExpanded(true)}
                className="flex items-center gap-1 text-small text-teal hover:text-teal-d transition-colors duration-200 cursor-pointer"
              >
                <ChevronDown size={14} />
                더 보기
              </button>
            </div>
          )}
        </div>

        {isQuestionExpanded && (question.content.length > 200 || question.content.split("\n").length > 4) && (
          <button
            onClick={() => setIsQuestionExpanded(false)}
            className="mt-3 flex items-center gap-1 text-small text-muted hover:text-ink transition-colors duration-200 cursor-pointer"
          >
            <ChevronDown size={14} className="rotate-180" />
            접기
          </button>
        )}

        {/* 첨부 파일 — 접기 영역 바깥에 항상 표시 */}
        {((question.attachments && question.attachments.length > 0) ||
          (question.image_urls && question.image_urls.length > 0)) && (
          <div className="mt-6 pt-6 border-t border-rule">
            <div className="flex items-center gap-2 text-body text-muted mb-3">
              <ImageIcon size={14} />
              첨부 파일 ({(question.attachments || question.image_urls)!.length})
            </div>
            {question.attachments && question.attachments.length > 0 ? (
              <MetaAttachmentList attachments={toMetaAttachments(question.attachments)} onSelect={setSelectedImage} />
            ) : (
              <AttachmentList urls={question.image_urls!} onSelect={setSelectedImage} />
            )}
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
          question.answers.map((answer, idx) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              questionId={question.id}
              onImageClick={setSelectedImage}
              onDeleted={fetchQuestion}
              defaultExpanded={idx === question.answers!.length - 1}
            />
          ))
        ) : (
          <div className="border border-rule bg-stone/50 p-8 text-center">
            <Clock size={32} className="mx-auto text-muted mb-3" />
            <p className="text-muted text-body">아직 답변이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 답변 작성 폼 */}
      <div className="border border-rule bg-white p-4 md:p-6">
        <h3 className="font-serif text-subhead font-bold text-ink mb-4">
          답변 작성
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <textarea
              {...register("content")}
              rows={6}
              placeholder="답변 내용을 입력하세요 (10자 이상)"
              className="w-full border border-rule px-4 py-3 text-body focus:border-navy focus:outline-none resize-none"
              disabled={isSubmitting}
            />
            {errors.content && (
              <p className="mt-1 text-small text-red-500">
                {errors.content.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-body font-medium text-muted mb-2">
              파일 첨부 (선택)
            </label>
            <ImageUploader
              bucket="question-images"
              folder="answers"
              maxFiles={5}
              maxSizeMB={1}
              accept="image/*,.pdf"
              value={imageUrls}
              onChange={(urls) => {
                setImageUrls(urls);
                setAttachmentsMeta((prev) => prev.filter((m) => urls.includes(m.url)));
              }}
              onFileUploaded={(meta: UploadedFileMeta) =>
                setAttachmentsMeta((prev) => [...prev, meta])
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Send size={16} />
              {isSubmitting ? "등록 중..." : "답변 등록"}
            </Button>
          </div>
        </form>
      </div>

      {/* 첨부파일 모달 */}
      {selectedImage && (
        <AttachmentModal url={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          setIsDeleting(true);
          const result = await deleteQuestion(supabase, question.id);
          if (result.success) {
            showToast("질문이 삭제되었습니다.", "success");
            router.push("/admin/questions");
          } else {
            showToast(result.error || "삭제에 실패했습니다.", "error");
          }
          setIsDeleting(false);
          setShowDeleteModal(false);
        }}
        title="질문 삭제"
        description="이 질문과 관련 답변을 모두 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

function AnswerCard({
  answer,
  questionId,
  onImageClick,
  onDeleted,
  defaultExpanded = false,
}: {
  answer: AnswerWithAuthor;
  questionId: string;
  onImageClick: (url: string) => void;
  onDeleted: () => void;
  defaultExpanded?: boolean;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!confirm("이 답변을 삭제하시겠습니까?")) return;
    setIsDeleting(true);
    const supabase = createBrowserClient();
    const result = await deleteAnswer(supabase, answer.id, questionId);
    if (result.success) {
      showToast("답변이 삭제되었습니다.", "success");
      onDeleted();
    } else {
      showToast(result.error || "삭제에 실패했습니다.", "error");
    }
    setIsDeleting(false);
  };

  // 역할 뱃지 텍스트
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return { text: "관리자", className: "bg-navy text-white" };
      case "mentor":
        return { text: "멘토", className: "bg-teal text-white" };
      case "assistant":
        return { text: "조교", className: "bg-stone text-ink" };
      default:
        return { text: "스태프", className: "bg-stone text-muted" };
    }
  };

  const badge = getRoleBadge(answer.author?.role);

  const contentPreview = answer.content.length > 80
    ? answer.content.slice(0, 80) + "…"
    : answer.content;

  return (
    <div className="border border-teal/20 bg-teal/5">
      {/* 답변 헤더 (클릭으로 펼침/접기) */}
      <div
        className="flex items-start gap-3 px-4 py-3 md:px-6 md:py-4 cursor-pointer hover:bg-teal/10 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-7 h-7 md:w-8 md:h-8 bg-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle size={14} className="text-teal md:w-4 md:h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-body font-medium text-ink">
              {answer.author?.name || "스태프"}
            </p>
            <span
              className={`text-label font-medium px-1.5 py-0.5 ${badge.className}`}
            >
              {badge.text}
            </span>
            <span className="text-caption text-muted">
              {new Date(answer.created_at).toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {!isExpanded && (
            <p className="text-small text-muted truncate mt-0.5">
              {contentPreview}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            disabled={isDeleting}
            className="p-1 text-muted hover:text-red-500 transition-colors duration-200 cursor-pointer disabled:opacity-50"
            aria-label="답변 삭제"
          >
            <Trash2 size={15} />
          </button>
          <ChevronDown
            size={16}
            className={cn(
              "text-muted transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* 답변 내용 (펼침 시) */}
      {isExpanded && (
        <div className="px-4 md:px-6 pb-5 pt-1 border-t border-teal/20">
          <p className="text-reading text-ink whitespace-pre-wrap leading-prose">
            {answer.content}
          </p>

          {/* 첨부 파일 */}
          {((answer.attachments && answer.attachments.length > 0) ||
            (answer.image_urls && answer.image_urls.length > 0)) && (
            <div className="mt-4 pt-4 border-t border-teal/20">
              {answer.attachments && answer.attachments.length > 0 ? (
                <MetaAttachmentList attachments={toMetaAttachments(answer.attachments)} onSelect={onImageClick} />
              ) : (
                <AttachmentList urls={answer.image_urls!} onSelect={onImageClick} variant="answer" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
