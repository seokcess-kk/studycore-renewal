/**
 * Question 도메인 - 모델 정의
 *
 * 이 파일에는 타입과 Zod 스키마만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ DB 쿼리 금지 → repository.ts
 */

import { z } from "zod";

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────

export const QuestionStatus = {
  PENDING: "pending",
  ANSWERED: "answered",
} as const;

export type QuestionStatusType =
  (typeof QuestionStatus)[keyof typeof QuestionStatus];

// ─────────────────────────────────────────────
// Zod 스키마
// ─────────────────────────────────────────────

// 질문 스키마
export const questionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  image_urls: z.array(z.string()).nullable(),
  status: z.enum(["pending", "answered"]),
  is_public: z.boolean(),
  is_pinned: z.boolean().optional().default(false),
  view_count: z.number().default(0),
  author_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Question = z.infer<typeof questionSchema>;

// 질문 + 작성자 정보
export const questionWithAuthorSchema = questionSchema.extend({
  author: z.object({
    name: z.string(),
    avatar_url: z.string().nullable(),
  }).nullable(),
});

export type QuestionWithAuthor = z.infer<typeof questionWithAuthorSchema>;

// 답변 스키마
export const answerSchema = z.object({
  id: z.string().uuid(),
  question_id: z.string().uuid(),
  content: z.string(),
  image_urls: z.array(z.string()).nullable(),
  author_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Answer = z.infer<typeof answerSchema>;

// 답변 + 작성자 정보
export const answerWithAuthorSchema = answerSchema.extend({
  author: z.object({
    name: z.string(),
    role: z.string(),
    avatar_url: z.string().nullable(),
  }).nullable(),
});

export type AnswerWithAuthor = z.infer<typeof answerWithAuthorSchema>;

// 질문 + 답변 전체
export const questionWithAnswersSchema = questionWithAuthorSchema.extend({
  answers: z.array(answerWithAuthorSchema),
});

export type QuestionWithAnswers = z.infer<typeof questionWithAnswersSchema>;

// 질문 생성 스키마
export const createQuestionSchema = z.object({
  title: z.string().min(5, "제목은 5자 이상 입력해주세요").max(100),
  content: z.string().min(10, "내용은 10자 이상 입력해주세요"),
  image_urls: z.array(z.string().url()).max(5, "이미지는 최대 5개까지 첨부 가능합니다").optional(),
  is_public: z.boolean().optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

// 답변 생성 스키마
export const createAnswerSchema = z.object({
  question_id: z.string().uuid(),
  content: z.string().min(10, "답변은 10자 이상 입력해주세요"),
  image_urls: z.array(z.string().url()).max(5).optional(),
});

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;

// ─────────────────────────────────────────────
// 서비스 결과 타입
// ─────────────────────────────────────────────

export interface QuestionServiceResult {
  success: boolean;
  question?: Question | QuestionWithAuthor | QuestionWithAnswers;
  error?: string;
}

export interface QuestionListResult {
  success: boolean;
  questions: QuestionWithAuthor[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
}

export interface AnswerServiceResult {
  success: boolean;
  answer?: Answer | AnswerWithAuthor;
  error?: string;
}
