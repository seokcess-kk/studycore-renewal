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
} from "lucide-react";
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
        <a
          href="/admin/questions"
          className="mt-4 inline-block text-teal hover:underline transition-colors duration-200"
        >
          목록으로 돌아가기
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상단 */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-2 text-muted hover:text-ink text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          목록으로
        </Link>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-medium px-2 py-1 ${
              isAnswered
                ? "bg-teal/10 text-teal"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            {isAnswered ? "답변 완료" : "답변 대기"}
          </span>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-small text-muted hover:text-red-500 border border-rule hover:border-red-300 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            삭제
          </button>
        </div>
      </div>

      {/* 질문 정보 */}
      <div className="border border-rule bg-white p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="font-serif text-xl font-bold text-ink">
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
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-small border border-rule hover:bg-stone transition-colors cursor-pointer"
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

        <div className="flex items-center gap-4 text-sm text-muted mb-6">
          <span className="flex items-center gap-1">
            <User size={14} />
            {question.author?.name || "익명"}
          </span>
          <span>{formatDistanceToNow(question.created_at)}</span>
        </div>

        <p className="text-reading text-ink whitespace-pre-wrap leading-relaxed">
          {question.content}
        </p>

        {/* 첨부 파일 */}
        {((question.attachments && question.attachments.length > 0) ||
          (question.image_urls && question.image_urls.length > 0)) && (
          <div className="mt-6 pt-6 border-t border-rule">
            <div className="flex items-center gap-2 text-sm text-muted mb-3">
              <ImageIcon size={14} />
              첨부 파일 ({(question.attachments || question.image_urls)!.length})
            </div>
            {question.attachments && question.attachments.length > 0 ? (
              <MetaAttachmentList attachments={toMetaAttachments(question.attachments)} />
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
          question.answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              questionId={question.id}
              onImageClick={setSelectedImage}
              onDeleted={fetchQuestion}
            />
          ))
        ) : (
          <div className="border border-rule bg-stone/50 p-8 text-center">
            <Clock size={32} className="mx-auto text-muted mb-3" />
            <p className="text-muted text-sm">아직 답변이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 답변 작성 폼 */}
      <div className="border border-rule bg-white p-6">
        <h3 className="font-serif text-lg font-bold text-ink mb-4">
          답변 작성
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <textarea
              {...register("content")}
              rows={6}
              placeholder="답변 내용을 입력하세요 (10자 이상)"
              className="w-full border border-rule px-4 py-3 text-sm focus:border-navy focus:outline-none resize-none"
              disabled={isSubmitting}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-500">
                {errors.content.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">
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
}: {
  answer: AnswerWithAuthor;
  questionId: string;
  onImageClick: (url: string) => void;
  onDeleted: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
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

  return (
    <div className="border border-teal/20 bg-teal/5 p-6">
      {/* 답변자 정보 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-teal/20 flex items-center justify-center">
          <CheckCircle size={18} className="text-teal" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-ink">
              {answer.author?.name || "스태프"}
            </p>
            <span
              className={`text-label font-medium px-1.5 py-0.5 ${badge.className}`}
            >
              {badge.text}
            </span>
          </div>
          <p className="text-xs text-muted">
            {new Date(answer.created_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-muted hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="답변 삭제"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* 답변 내용 */}
      <p className="text-reading text-ink whitespace-pre-wrap leading-relaxed">
        {answer.content}
      </p>

      {/* 첨부 파일 */}
      {((answer.attachments && answer.attachments.length > 0) ||
        (answer.image_urls && answer.image_urls.length > 0)) && (
        <div className="mt-4 pt-4 border-t border-teal/20">
          {answer.attachments && answer.attachments.length > 0 ? (
            <MetaAttachmentList attachments={toMetaAttachments(answer.attachments)} />
          ) : (
            <AttachmentList urls={answer.image_urls!} onSelect={onImageClick} variant="answer" />
          )}
        </div>
      )}
    </div>
  );
}
