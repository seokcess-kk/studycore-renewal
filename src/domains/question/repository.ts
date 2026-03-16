/**
 * Question 도메인 - 리포지토리
 *
 * 이 파일에는 Supabase DB 쿼리만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  Question,
  QuestionWithAuthor,
  QuestionWithAnswers,
  Answer,
  AnswerWithAuthor,
  CreateQuestionInput,
  CreateAnswerInput,
} from "./model";

/**
 * 질문 목록 조회
 */
export async function getQuestions(
  supabase: SupabaseClient,
  options?: {
    status?: string;
    authorId?: string;
    isPublic?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: QuestionWithAuthor[]; count: number }> {
  let query = supabase
    .from("questions")
    .select(
      `
      *,
      author:profiles!author_id (
        name,
        avatar_url
      )
    `,
      { count: "exact" }
    )
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.authorId) {
    query = query.eq("author_id", options.authorId);
  }

  if (options?.isPublic !== undefined) {
    query = query.eq("is_public", options.isPublic);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit ?? 10) - 1
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`질문 목록 조회 실패: ${error.message}`);
  }

  return { data: data || [], count: count || 0 };
}

/**
 * 미답변 질문 수 조회
 */
export async function getUnansweredCount(
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    throw new Error(`미답변 질문 수 조회 실패: ${error.message}`);
  }

  return count || 0;
}

/**
 * 질문 고정/해제 토글
 */
export async function toggleQuestionPinned(
  supabase: SupabaseClient,
  questionId: string,
  isPinned: boolean
): Promise<void> {
  const { error } = await supabase
    .from("questions")
    .update({ is_pinned: isPinned })
    .eq("id", questionId);

  if (error) {
    throw new Error(`질문 고정 상태 변경 실패: ${error.message}`);
  }
}

/**
 * 공개 질문 + 내 질문 목록 조회 (게시판용)
 */
export async function getPublicAndMyQuestions(
  supabase: SupabaseClient,
  userId: string,
  options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: QuestionWithAuthor[]; count: number }> {
  let query = supabase
    .from("questions")
    .select(
      `
      *,
      author:profiles!author_id (
        name,
        avatar_url
      )
    `,
      { count: "exact" }
    )
    .or(`is_public.eq.true,author_id.eq.${userId}`)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit ?? 10) - 1
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`질문 목록 조회 실패: ${error.message}`);
  }

  return { data: data || [], count: count || 0 };
}

/**
 * 질문 상세 조회 (답변 포함)
 */
export async function getQuestionById(
  supabase: SupabaseClient,
  questionId: string
): Promise<QuestionWithAnswers | null> {
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select(
      `
      *,
      author:profiles!author_id (
        name,
        avatar_url
      )
    `
    )
    .eq("id", questionId)
    .single();

  if (questionError) {
    if (questionError.code === "PGRST116") {
      return null;
    }
    throw new Error(`질문 조회 실패: ${questionError.message}`);
  }

  // 답변 조회
  const { data: answers, error: answersError } = await supabase
    .from("question_answers")
    .select(
      `
      *,
      author:profiles!author_id (
        name,
        role,
        avatar_url
      )
    `
    )
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });

  if (answersError) {
    throw new Error(`답변 조회 실패: ${answersError.message}`);
  }

  return {
    ...question,
    answers: answers || [],
  };
}

/**
 * 질문 생성
 */
export async function createQuestion(
  supabase: SupabaseClient,
  data: CreateQuestionInput & { author_id: string }
): Promise<Question> {
  const { data: question, error } = await supabase
    .from("questions")
    .insert({
      title: data.title,
      content: data.content,
      image_urls: data.image_urls || null,
      is_public: data.is_public ?? false,
      author_id: data.author_id,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`질문 생성 실패: ${error.message}`);
  }

  return question;
}

/**
 * 질문 수정
 */
export async function updateQuestion(
  supabase: SupabaseClient,
  questionId: string,
  data: Partial<CreateQuestionInput>
): Promise<Question> {
  const updateData: Record<string, unknown> = {};
  if (data.title) updateData.title = data.title;
  if (data.content) updateData.content = data.content;
  if (data.image_urls !== undefined) updateData.image_urls = data.image_urls;
  if (data.is_public !== undefined) updateData.is_public = data.is_public;

  const { data: question, error } = await supabase
    .from("questions")
    .update(updateData)
    .eq("id", questionId)
    .select()
    .single();

  if (error) {
    throw new Error(`질문 수정 실패: ${error.message}`);
  }

  return question;
}

/**
 * 질문 상태 변경
 */
export async function updateQuestionStatus(
  supabase: SupabaseClient,
  questionId: string,
  status: "pending" | "answered"
): Promise<Question> {
  const { data: question, error } = await supabase
    .from("questions")
    .update({ status })
    .eq("id", questionId)
    .select()
    .single();

  if (error) {
    throw new Error(`질문 상태 변경 실패: ${error.message}`);
  }

  return question;
}

/**
 * 질문 삭제
 */
export async function deleteQuestion(
  supabase: SupabaseClient,
  questionId: string
): Promise<void> {
  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", questionId);

  if (error) {
    throw new Error(`질문 삭제 실패: ${error.message}`);
  }
}

/**
 * 답변 생성
 */
export async function createAnswer(
  supabase: SupabaseClient,
  data: CreateAnswerInput & { author_id: string }
): Promise<Answer> {
  const { data: answer, error } = await supabase
    .from("question_answers")
    .insert({
      question_id: data.question_id,
      content: data.content,
      image_urls: data.image_urls || null,
      author_id: data.author_id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`답변 생성 실패: ${error.message}`);
  }

  return answer;
}

/**
 * 답변 수정
 */
export async function updateAnswer(
  supabase: SupabaseClient,
  answerId: string,
  data: { content?: string; image_urls?: string[] }
): Promise<Answer> {
  const { data: answer, error } = await supabase
    .from("question_answers")
    .update(data)
    .eq("id", answerId)
    .select()
    .single();

  if (error) {
    throw new Error(`답변 수정 실패: ${error.message}`);
  }

  return answer;
}

/**
 * 답변 삭제
 */
export async function deleteAnswer(
  supabase: SupabaseClient,
  answerId: string
): Promise<void> {
  const { error } = await supabase
    .from("question_answers")
    .delete()
    .eq("id", answerId);

  if (error) {
    throw new Error(`답변 삭제 실패: ${error.message}`);
  }
}

/**
 * 답변 목록 조회 (특정 질문)
 */
export async function getAnswersByQuestionId(
  supabase: SupabaseClient,
  questionId: string
): Promise<AnswerWithAuthor[]> {
  const { data, error } = await supabase
    .from("question_answers")
    .select(
      `
      *,
      author:profiles!author_id (
        name,
        role,
        avatar_url
      )
    `
    )
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`답변 목록 조회 실패: ${error.message}`);
  }

  return data || [];
}
