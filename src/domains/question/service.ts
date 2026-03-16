/**
 * Question 도메인 - 서비스
 *
 * 이 파일에는 비즈니스 로직만 포함합니다.
 * ⚠️ DB 쿼리 금지 → repository.ts 경유
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  createQuestionSchema,
  createAnswerSchema,
  type CreateQuestionInput,
  type CreateAnswerInput,
  type QuestionServiceResult,
  type QuestionListResult,
  type AnswerServiceResult,
} from "./model";
import * as questionRepo from "./repository";

/**
 * 미답변 질문 수 조회 (알림 뱃지용)
 */
export async function fetchUnansweredCount(
  supabase: SupabaseClient
): Promise<number> {
  try {
    return await questionRepo.getUnansweredCount(supabase);
  } catch {
    return 0;
  }
}

/**
 * 질문 고정/해제 (관리자용)
 */
export async function togglePinQuestion(
  supabase: SupabaseClient,
  questionId: string,
  isPinned: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await questionRepo.toggleQuestionPinned(supabase, questionId, isPinned);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "고정 상태 변경에 실패했습니다.",
    };
  }
}

/**
 * 질문 목록 조회
 */
export async function getQuestionList(
  supabase: SupabaseClient,
  options?: {
    status?: string;
    authorId?: string;
    isPublic?: boolean;
    page?: number;
    pageSize?: number;
  }
): Promise<QuestionListResult> {
  try {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    const { data, count } = await questionRepo.getQuestions(supabase, {
      status: options?.status,
      authorId: options?.authorId,
      isPublic: options?.isPublic,
      limit: pageSize,
      offset,
    });

    return {
      success: true,
      questions: data,
      total: count,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("질문 목록 조회 실패:", error);
    return {
      success: false,
      questions: [],
      total: 0,
      page: 1,
      pageSize: 10,
      error:
        error instanceof Error
          ? error.message
          : "질문 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 내 질문 목록 조회
 */
export async function getMyQuestions(
  supabase: SupabaseClient,
  options?: {
    page?: number;
    pageSize?: number;
  }
): Promise<QuestionListResult> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        questions: [],
        total: 0,
        page: 1,
        pageSize: 10,
        error: "로그인이 필요합니다.",
      };
    }

    return getQuestionList(supabase, {
      authorId: user.id,
      ...options,
    });
  } catch (error) {
    console.error("내 질문 목록 조회 실패:", error);
    return {
      success: false,
      questions: [],
      total: 0,
      page: 1,
      pageSize: 10,
      error: "질문 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 공개 질문 + 내 질문 목록 조회 (게시판용)
 * - 공개 질문: 모든 활성 재원생이 볼 수 있음
 * - 비공개 질문: 본인만 볼 수 있음
 */
export async function getPublicQuestionList(
  supabase: SupabaseClient,
  options?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<QuestionListResult> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        questions: [],
        total: 0,
        page: 1,
        pageSize: 10,
        error: "로그인이 필요합니다.",
      };
    }

    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    const { data, count } = await questionRepo.getPublicAndMyQuestions(
      supabase,
      user.id,
      {
        status: options?.status,
        limit: pageSize,
        offset,
      }
    );

    return {
      success: true,
      questions: data,
      total: count,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("공개 질문 목록 조회 실패:", error);
    return {
      success: false,
      questions: [],
      total: 0,
      page: 1,
      pageSize: 10,
      error:
        error instanceof Error
          ? error.message
          : "질문 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 질문 상세 조회
 */
export async function getQuestionDetail(
  supabase: SupabaseClient,
  questionId: string,
  incrementView: boolean = true
): Promise<QuestionServiceResult> {
  try {
    const question = await questionRepo.getQuestionById(supabase, questionId);

    if (!question) {
      return {
        success: false,
        error: "질문을 찾을 수 없습니다.",
      };
    }

    // 조회수 증가 (비동기, 에러 무시)
    if (incrementView) {
      questionRepo.incrementViewCount(supabase, questionId).catch(() => {});
    }

    return { success: true, question };
  } catch (error) {
    console.error("질문 조회 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "질문 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 질문 생성
 */
export async function createQuestion(
  supabase: SupabaseClient,
  input: CreateQuestionInput
): Promise<QuestionServiceResult> {
  try {
    // 1. 로그인 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // 2. 유효성 검사
    const validationResult = createQuestionSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    // 3. 질문 생성
    const question = await questionRepo.createQuestion(supabase, {
      ...validationResult.data,
      author_id: user.id,
    });

    // 4. 멘토에게 알림 발송 (Edge Function)
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    // 비동기로 알림 발송 (실패해도 질문 등록은 성공)
    supabase.functions
      .invoke("notify-question", {
        body: {
          questionId: question.id,
          studentName: profile?.name || "학생",
          title: validationResult.data.title,
        },
      })
      .catch((err) => {
        console.error("알림 발송 실패:", err);
      });

    return { success: true, question };
  } catch (error) {
    console.error("질문 생성 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "질문 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 질문 수정
 */
export async function updateQuestion(
  supabase: SupabaseClient,
  questionId: string,
  input: Partial<CreateQuestionInput>
): Promise<QuestionServiceResult> {
  try {
    // 1. 로그인 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 2. 기존 질문 확인
    const existingQuestion = await questionRepo.getQuestionById(
      supabase,
      questionId
    );

    if (!existingQuestion) {
      return { success: false, error: "질문을 찾을 수 없습니다." };
    }

    // 3. 소유자 확인 (스태프가 아닌 경우)
    if (existingQuestion.author_id !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || !["admin", "mentor", "assistant"].includes(profile.role)) {
        return { success: false, error: "본인의 질문만 수정할 수 있습니다." };
      }
    }

    // 4. 답변된 질문은 수정 불가 (스태프 제외 — 고정 등 관리 목적)
    if (existingQuestion.status === "answered" && existingQuestion.author_id === user.id) {
      return { success: false, error: "답변이 달린 질문은 수정할 수 없습니다." };
    }

    // 5. 질문 수정
    const question = await questionRepo.updateQuestion(
      supabase,
      questionId,
      input
    );

    return { success: true, question };
  } catch (error) {
    console.error("질문 수정 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "질문 수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 질문 삭제
 */
export async function deleteQuestion(
  supabase: SupabaseClient,
  questionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. 로그인 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 2. 기존 질문 확인
    const existingQuestion = await questionRepo.getQuestionById(
      supabase,
      questionId
    );

    if (!existingQuestion) {
      return { success: false, error: "질문을 찾을 수 없습니다." };
    }

    // 3. 소유자 또는 스태프 확인
    if (existingQuestion.author_id !== user.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || !["admin", "mentor"].includes(profile.role)) {
        return { success: false, error: "본인의 질문만 삭제할 수 있습니다." };
      }
    }

    // 4. 답변된 질문은 일반 사용자 삭제 불가 (스태프는 가능)
    if (existingQuestion.status === "answered" && existingQuestion.author_id === user.id) {
      return { success: false, error: "답변이 달린 질문은 삭제할 수 없습니다." };
    }

    // 5. 질문 삭제
    await questionRepo.deleteQuestion(supabase, questionId);

    return { success: true };
  } catch (error) {
    console.error("질문 삭제 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "질문 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 답변 생성 (멘토/관리자용)
 */
export async function createAnswer(
  supabase: SupabaseClient,
  input: CreateAnswerInput
): Promise<AnswerServiceResult> {
  try {
    // 1. 로그인 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // 2. 유효성 검사
    const validationResult = createAnswerSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    // 3. 답변 생성
    const answer = await questionRepo.createAnswer(supabase, {
      ...validationResult.data,
      author_id: user.id,
    });

    // 4. 질문 상태를 'answered'로 변경
    await questionRepo.updateQuestionStatus(
      supabase,
      input.question_id,
      "answered"
    );

    // 5. 질문 작성자에게 알림 발송 (Edge Function)
    // 질문 정보 조회
    const { data: questionData } = await supabase
      .from("questions")
      .select("author_id, title")
      .eq("id", input.question_id)
      .single();

    // 멘토 이름 조회
    const { data: mentorProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    if (questionData) {
      // 비동기로 알림 발송 (실패해도 답변 등록은 성공)
      supabase.functions
        .invoke("notify-answer", {
          body: {
            questionId: input.question_id,
            studentId: questionData.author_id,
            mentorName: mentorProfile?.name || "멘토",
            questionTitle: questionData.title,
          },
        })
        .catch((err) => {
          console.error("알림 발송 실패:", err);
        });
    }

    return { success: true, answer };
  } catch (error) {
    console.error("답변 생성 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "답변 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 답변 수정 (멘토/관리자용)
 */
export async function updateAnswer(
  supabase: SupabaseClient,
  answerId: string,
  input: { content?: string; image_urls?: string[] }
): Promise<AnswerServiceResult> {
  try {
    const answer = await questionRepo.updateAnswer(supabase, answerId, input);
    return { success: true, answer };
  } catch (error) {
    console.error("답변 수정 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "답변 수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 답변 삭제 (멘토/관리자용)
 * 마지막 답변 삭제 시 질문 상태를 pending으로 롤백
 */
export async function deleteAnswer(
  supabase: SupabaseClient,
  answerId: string,
  questionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await questionRepo.deleteAnswer(supabase, answerId);

    // 해당 질문에 남은 답변이 있는지 확인
    const { count } = await supabase
      .from("question_answers")
      .select("id", { count: "exact", head: true })
      .eq("question_id", questionId);

    // 답변이 없으면 질문 상태를 pending으로 복원
    if (!count || count === 0) {
      await supabase
        .from("questions")
        .update({ status: "pending" })
        .eq("id", questionId);
    }

    return { success: true };
  } catch (error) {
    console.error("답변 삭제 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "답변 삭제 중 오류가 발생했습니다.",
    };
  }
}
