"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Globe,
  Lock,
  Pin,
  PinOff,
  ChevronDown,
  ChevronUp,
  User,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { togglePinQuestion, getQuestionDetail } from "@/domains/question/service";
import type { QuestionWithAuthor, QuestionWithAnswers, AnswerWithAuthor } from "@/domains/question/model";
import { ROUTES } from "@/lib/constants";
import { ElapsedBadge, getUrgencyBorderClass } from "./ElapsedBadge";
import { AnswerForm } from "./AnswerForm";

interface StaffQuestionCardProps {
  question: QuestionWithAuthor;
  onUpdated: () => void;
}

export function StaffQuestionCard({ question, onUpdated }: StaffQuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [detail, setDetail] = useState<QuestionWithAnswers | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const isAnswered = question.status === "answered";
  const isPending = question.status === "pending";
  const urgencyBorder = getUrgencyBorderClass(question.created_at, isPending);

  const handleExpand = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);

    // 상세 데이터 로드 (펼칠 때마다 최신 조회)
    setIsLoadingDetail(true);
    const supabase = createClient();
    const result = await getQuestionDetail(supabase, question.id);
    if (result.success && result.question) {
      setDetail(result.question as QuestionWithAnswers);
    }
    setIsLoadingDetail(false);
  };

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = createClient();
    const result = await togglePinQuestion(supabase, question.id, !question.is_pinned);
    if (result.success) {
      onUpdated();
    }
  };

  const handleAnswered = async () => {
    // 답변 후 상세 새로고침
    const supabase = createClient();
    const result = await getQuestionDetail(supabase, question.id);
    if (result.success && result.question) {
      setDetail(result.question as QuestionWithAnswers);
    }
    onUpdated();
  };

  return (
    <div className={`border border-rule bg-white ${urgencyBorder}`}>
      {/* 접힌 상태 — 요약 */}
      <button
        type="button"
        onClick={handleExpand}
        className="w-full text-left p-4 hover:bg-stone/30 transition-colors cursor-pointer"
      >
        <div className="flex items-start gap-3">
          {/* 상태 아이콘 */}
          <div
            className={`flex-shrink-0 w-9 h-9 flex items-center justify-center mt-0.5 ${
              isAnswered ? "bg-teal/10" : "bg-stone"
            }`}
          >
            {isAnswered ? (
              <CheckCircle size={16} className="text-teal" />
            ) : (
              <Clock size={16} className="text-muted" />
            )}
          </div>

          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`text-caption font-medium px-2 py-0.5 ${
                  isAnswered ? "bg-teal/10 text-teal" : "bg-stone text-muted"
                }`}
              >
                {isAnswered ? "답변 완료" : "미답변"}
              </span>
              {question.is_pinned && (
                <span className="text-caption font-medium px-2 py-0.5 bg-teal/10 text-teal flex items-center gap-1">
                  <Pin size={10} />
                  고정
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 text-caption font-medium px-2 py-0.5 ${
                  question.is_public ? "bg-navy/5 text-navy" : "bg-stone text-muted"
                }`}
              >
                {question.is_public ? <Globe size={10} /> : <Lock size={10} />}
                {question.is_public ? "공개" : "비공개"}
              </span>
              <span className="text-caption text-muted flex items-center gap-1">
                <User size={10} />
                {question.author?.name || "익명"}
              </span>
              <ElapsedBadge createdAt={question.created_at} isPending={isPending} />
            </div>

            <h3 className="text-body font-medium text-ink truncate">
              {question.title}
            </h3>

            {!isExpanded && (
              <p className="text-secondary text-muted mt-1 line-clamp-1">
                {question.content}
              </p>
            )}
          </div>

          {/* 펼치기/접기 */}
          <div className="flex-shrink-0 text-muted mt-1">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {/* 펼친 상태 — 상세 + 답변 */}
      {isExpanded && (
        <div className="border-t border-rule">
          {/* 액션 바 */}
          <div className="flex items-center gap-2 px-4 py-2 bg-stone/50 border-b border-rule">
            <button
              type="button"
              onClick={handlePin}
              className="flex items-center gap-1 px-2 py-1 text-small text-muted hover:text-ink transition-colors cursor-pointer"
            >
              {question.is_pinned ? <PinOff size={12} /> : <Pin size={12} />}
              {question.is_pinned ? "고정 해제" : "고정"}
            </button>
            <Link
              href={`${ROUTES.QUESTIONS}/${question.id}`}
              className="flex items-center gap-1 px-2 py-1 text-small text-muted hover:text-ink transition-colors cursor-pointer"
            >
              <ExternalLink size={12} />
              상세 페이지
            </Link>
          </div>

          <div className="p-4 space-y-4">
            {isLoadingDetail ? (
              <p className="text-secondary text-muted py-4 text-center">로딩 중...</p>
            ) : (
              <>
                {/* 질문 전문 */}
                <div>
                  <p className="text-body text-ink whitespace-pre-wrap leading-relaxed">
                    {question.content}
                  </p>
                  {question.image_urls && question.image_urls.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {question.image_urls.map((url, i) => (
                        <img
                          key={url}
                          src={url}
                          alt={`첨부 ${i + 1}`}
                          className="w-20 h-20 object-cover border border-rule"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* 기존 답변 */}
                {detail?.answers && detail.answers.length > 0 && (
                  <div className="border-t border-rule pt-4 space-y-3">
                    <p className="text-small font-medium text-muted">
                      답변 {detail.answers.length}개
                    </p>
                    {detail.answers.map((answer: AnswerWithAuthor) => (
                      <div key={answer.id} className="bg-teal/5 border border-teal/20 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-small font-medium text-ink">
                            {answer.author?.name || "멘토"}
                          </span>
                          <ElapsedBadge createdAt={answer.created_at} />
                        </div>
                        <p className="text-secondary text-ink whitespace-pre-wrap">
                          {answer.content}
                        </p>
                        {answer.image_urls && answer.image_urls.length > 0 && (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {answer.image_urls.map((url, i) => (
                              <img
                                key={`answer-img-${answer.id}-${i}`}
                                src={url}
                                alt={`답변 첨부 ${i + 1}`}
                                className="w-20 h-20 object-cover border border-teal/20 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(url, "_blank");
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 답변 작성 폼 */}
                <div className="border-t border-rule pt-4">
                  <p className="text-small font-medium text-muted mb-2">답변 작성</p>
                  <AnswerForm
                    questionId={question.id}
                    onSuccess={handleAnswered}
                    compact
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
