/**
 * Notice 도메인 - 리포지토리
 *
 * 이 파일에는 Supabase DB 쿼리만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  Notice,
  NoticeWithAuthor,
  NoticeAttachment,
  CreateNoticeInput,
  UpdateNoticeInput,
} from "./model";

/**
 * 공지사항 목록 조회
 */
export async function getNotices(
  supabase: SupabaseClient,
  options?: {
    category?: string;
    search?: string;
    publishedOnly?: boolean;
    publicOnly?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: NoticeWithAuthor[]; count: number }> {
  let query = supabase
    .from("notices")
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
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  if (options?.publishedOnly) {
    query = query.eq("is_published", true);
  }

  if (options?.publicOnly) {
    query = query.eq("visibility", "public");
  }

  if (options?.category) {
    query = query.eq("category", options.category);
  }

  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,content.ilike.%${options.search}%`
    );
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
    throw new Error(`공지사항 목록 조회 실패: ${error.message}`);
  }

  return { data: data || [], count: count || 0 };
}

/**
 * 공지사항 상세 조회
 */
export async function getNoticeById(
  supabase: SupabaseClient,
  noticeId: string
): Promise<NoticeWithAuthor | null> {
  const { data, error } = await supabase
    .from("notices")
    .select(
      `
      *,
      author:profiles!author_id (
        name,
        avatar_url
      )
    `
    )
    .eq("id", noticeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`공지사항 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 조회수 증가
 */
export async function incrementViewCount(
  supabase: SupabaseClient,
  noticeId: string
): Promise<void> {
  // RPC 함수 사용 시도
  const { error } = await supabase.rpc("increment_notice_view_count", {
    notice_id: noticeId,
  });

  // RPC가 없으면 직접 조회 후 업데이트
  if (error?.code === "PGRST202") {
    const { data: notice } = await supabase
      .from("notices")
      .select("view_count")
      .eq("id", noticeId)
      .single();

    if (notice) {
      await supabase
        .from("notices")
        .update({ view_count: (notice.view_count || 0) + 1 })
        .eq("id", noticeId);
    }
  }
}

/**
 * 공지사항 생성
 */
export async function createNotice(
  supabase: SupabaseClient,
  data: CreateNoticeInput & { author_id: string }
): Promise<Notice> {
  const { data: notice, error } = await supabase
    .from("notices")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`공지사항 생성 실패: ${error.message}`);
  }

  return notice;
}

/**
 * 공지사항 수정
 */
export async function updateNotice(
  supabase: SupabaseClient,
  noticeId: string,
  data: UpdateNoticeInput
): Promise<Notice> {
  const { data: notice, error } = await supabase
    .from("notices")
    .update(data)
    .eq("id", noticeId)
    .select()
    .single();

  if (error) {
    throw new Error(`공지사항 수정 실패: ${error.message}`);
  }

  return notice;
}

/**
 * 공지사항 삭제
 */
export async function deleteNotice(
  supabase: SupabaseClient,
  noticeId: string
): Promise<void> {
  const { error } = await supabase
    .from("notices")
    .delete()
    .eq("id", noticeId);

  if (error) {
    throw new Error(`공지사항 삭제 실패: ${error.message}`);
  }
}

/**
 * 공지사항 순서 일괄 업데이트
 */
export async function updateNoticeOrders(
  supabase: SupabaseClient,
  orders: { id: string; order_index: number }[]
): Promise<void> {
  for (const order of orders) {
    const { error } = await supabase
      .from("notices")
      .update({ order_index: order.order_index })
      .eq("id", order.id);

    if (error) {
      throw new Error(`공지사항 순서 업데이트 실패: ${error.message}`);
    }
  }
}

/**
 * 첨부파일 목록 조회
 */
export async function getNoticeAttachments(
  supabase: SupabaseClient,
  noticeId: string
): Promise<NoticeAttachment[]> {
  const { data, error } = await supabase
    .from("notice_attachments")
    .select("*")
    .eq("notice_id", noticeId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`첨부파일 조회 실패: ${error.message}`);
  }

  return data || [];
}

/**
 * 첨부파일 추가
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
): Promise<NoticeAttachment> {
  const { data: attachment, error } = await supabase
    .from("notice_attachments")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`첨부파일 추가 실패: ${error.message}`);
  }

  return attachment;
}

/**
 * 첨부파일 삭제
 */
export async function deleteNoticeAttachment(
  supabase: SupabaseClient,
  attachmentId: string
): Promise<void> {
  const { error } = await supabase
    .from("notice_attachments")
    .delete()
    .eq("id", attachmentId);

  if (error) {
    throw new Error(`첨부파일 삭제 실패: ${error.message}`);
  }
}
