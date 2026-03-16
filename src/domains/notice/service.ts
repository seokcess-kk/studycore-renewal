/**
 * Notice 도메인 - 서비스
 *
 * 이 파일에는 비즈니스 로직만 포함합니다.
 * ⚠️ DB 쿼리 금지 → repository.ts 경유
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  createNoticeSchema,
  updateNoticeSchema,
  type CreateNoticeInput,
  type UpdateNoticeInput,
  type NoticeServiceResult,
  type NoticeListResult,
  type NoticeAttachment,
} from "./model";
import * as noticeRepo from "./repository";

/**
 * 공지사항 목록 조회
 */
export async function getNoticeList(
  supabase: SupabaseClient,
  options?: {
    category?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<NoticeListResult> {
  try {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    const { data, count } = await noticeRepo.getNotices(supabase, {
      category: options?.category,
      search: options?.search,
      publishedOnly: true,
      limit: pageSize,
      offset,
    });

    return {
      success: true,
      notices: data,
      total: count,
      page,
      pageSize,
    };
  } catch (error) {
    console.error("공지사항 목록 조회 실패:", error);
    return {
      success: false,
      notices: [],
      total: 0,
      page: 1,
      pageSize: 10,
      error:
        error instanceof Error
          ? error.message
          : "공지사항 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 공지사항 상세 조회
 */
export async function getNoticeDetail(
  supabase: SupabaseClient,
  noticeId: string,
  incrementView: boolean = true
): Promise<NoticeServiceResult> {
  try {
    const notice = await noticeRepo.getNoticeById(supabase, noticeId);

    if (!notice) {
      return {
        success: false,
        error: "공지사항을 찾을 수 없습니다.",
      };
    }

    // 조회수 증가 (비동기, 에러 무시)
    if (incrementView) {
      noticeRepo.incrementViewCount(supabase, noticeId).catch(() => {});
    }

    return { success: true, notice };
  } catch (error) {
    console.error("공지사항 조회 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "공지사항 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 공지사항 생성 (관리자용)
 */
export async function createNotice(
  supabase: SupabaseClient,
  authorId: string,
  input: CreateNoticeInput
): Promise<NoticeServiceResult> {
  try {
    // 1. 유효성 검사
    const validationResult = createNoticeSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    // 2. 공지사항 생성
    const notice = await noticeRepo.createNotice(supabase, {
      ...validationResult.data,
      author_id: authorId,
    });

    return { success: true, notice };
  } catch (error) {
    console.error("공지사항 생성 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "공지사항 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 공지사항 수정 (관리자용)
 */
export async function updateNotice(
  supabase: SupabaseClient,
  noticeId: string,
  input: UpdateNoticeInput
): Promise<NoticeServiceResult> {
  try {
    // 1. 유효성 검사
    const validationResult = updateNoticeSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    // 2. 공지사항 수정
    const notice = await noticeRepo.updateNotice(
      supabase,
      noticeId,
      validationResult.data
    );

    return { success: true, notice };
  } catch (error) {
    console.error("공지사항 수정 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "공지사항 수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 공지사항 삭제 (관리자용)
 */
export async function deleteNotice(
  supabase: SupabaseClient,
  noticeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await noticeRepo.deleteNotice(supabase, noticeId);
    return { success: true };
  } catch (error) {
    console.error("공지사항 삭제 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "공지사항 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 공지사항 고정 토글 (관리자용)
 */
export async function toggleNoticePin(
  supabase: SupabaseClient,
  noticeId: string
): Promise<NoticeServiceResult> {
  try {
    const notice = await noticeRepo.getNoticeById(supabase, noticeId);

    if (!notice) {
      return {
        success: false,
        error: "공지사항을 찾을 수 없습니다.",
      };
    }

    const updatedNotice = await noticeRepo.updateNotice(supabase, noticeId, {
      is_pinned: !notice.is_pinned,
    });

    return { success: true, notice: updatedNotice };
  } catch (error) {
    console.error("공지사항 고정 토글 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "공지사항 고정 토글 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 공지사항 첨부파일 목록 조회
 */
export async function getNoticeAttachments(
  supabase: SupabaseClient,
  noticeId: string
): Promise<NoticeAttachment[]> {
  try {
    return await noticeRepo.getNoticeAttachments(supabase, noticeId);
  } catch (error) {
    console.error("첨부파일 조회 실패:", error);
    return [];
  }
}

/**
 * 공지사항 첨부파일 추가
 */
export async function addNoticeAttachment(
  supabase: SupabaseClient,
  data: {
    notice_id: string;
    file_name: string;
    file_url: string;
    file_size?: number;
    file_type?: string;
  }
): Promise<{ success: boolean; attachment?: NoticeAttachment; error?: string }> {
  try {
    const attachment = await noticeRepo.addNoticeAttachment(supabase, data);
    return { success: true, attachment };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "첨부파일 추가 실패",
    };
  }
}

/**
 * 공지사항 첨부파일 삭제
 */
export async function deleteNoticeAttachment(
  supabase: SupabaseClient,
  attachmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await noticeRepo.deleteNoticeAttachment(supabase, attachmentId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "첨부파일 삭제 실패",
    };
  }
}
