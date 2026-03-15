/**
 * 감사 로그 유틸리티
 *
 * 관리자 액션 기록용
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "./logger";

// 액션 타입 상수
export const AUDIT_ACTIONS = {
  // 사용자 관련
  USER_STATUS_CHANGE: "user.status_change",
  USER_ROLE_CHANGE: "user.role_change",
  USER_CREATE: "user.create",
  USER_DELETE: "user.delete",

  // 공지 관련
  NOTICE_CREATE: "notice.create",
  NOTICE_UPDATE: "notice.update",
  NOTICE_DELETE: "notice.delete",

  // 질문 관련
  QUESTION_ANSWER: "question.answer",

  // 블로그 관련
  BLOG_CREATE: "blog.create",
  BLOG_UPDATE: "blog.update",
  BLOG_DELETE: "blog.delete",

  // 설정 관련
  SETTINGS_UPDATE: "settings.update",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

// 리소스 타입 상수
export const AUDIT_RESOURCES = {
  USER: "user",
  NOTICE: "notice",
  QUESTION: "question",
  BLOG: "blog",
  SETTINGS: "settings",
} as const;

export type AuditResource = (typeof AUDIT_RESOURCES)[keyof typeof AUDIT_RESOURCES];

interface CreateAuditLogParams {
  actorId: string;
  action: AuditAction;
  resourceType: AuditResource;
  resourceId?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * 감사 로그 생성
 * RPC 함수가 없으면 무시 (선택적 기능)
 */
export async function createAuditLog(
  supabase: SupabaseClient,
  params: CreateAuditLogParams
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc("create_audit_log", {
      p_actor_id: params.actorId,
      p_action: params.action,
      p_resource_type: params.resourceType,
      p_resource_id: params.resourceId || null,
      p_changes: params.changes || null,
      p_metadata: params.metadata || null,
    });

    if (error) {
      // RPC 함수가 없는 경우 무시
      if (error.code === "42883" || error.message.includes("does not exist")) {
        return null;
      }
      logger.warn("감사 로그 생성 실패", { context: "createAuditLog", data: error });
      return null;
    }

    return data as string;
  } catch (error) {
    logger.exception(error, "createAuditLog");
    return null;
  }
}

/**
 * 사용자 상태 변경 로그
 */
export async function logUserStatusChange(
  supabase: SupabaseClient,
  actorId: string,
  targetUserId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  await createAuditLog(supabase, {
    actorId,
    action: AUDIT_ACTIONS.USER_STATUS_CHANGE,
    resourceType: AUDIT_RESOURCES.USER,
    resourceId: targetUserId,
    changes: {
      status: { from: oldStatus, to: newStatus },
    },
  });
}

/**
 * 사용자 역할 변경 로그
 */
export async function logUserRoleChange(
  supabase: SupabaseClient,
  actorId: string,
  targetUserId: string,
  oldRole: string,
  newRole: string
): Promise<void> {
  await createAuditLog(supabase, {
    actorId,
    action: AUDIT_ACTIONS.USER_ROLE_CHANGE,
    resourceType: AUDIT_RESOURCES.USER,
    resourceId: targetUserId,
    changes: {
      role: { from: oldRole, to: newRole },
    },
  });
}

/**
 * 공지 생성 로그
 */
export async function logNoticeCreate(
  supabase: SupabaseClient,
  actorId: string,
  noticeId: string,
  noticeTitle: string
): Promise<void> {
  await createAuditLog(supabase, {
    actorId,
    action: AUDIT_ACTIONS.NOTICE_CREATE,
    resourceType: AUDIT_RESOURCES.NOTICE,
    resourceId: noticeId,
    metadata: { title: noticeTitle },
  });
}

/**
 * 공지 삭제 로그
 */
export async function logNoticeDelete(
  supabase: SupabaseClient,
  actorId: string,
  noticeId: string,
  noticeTitle: string
): Promise<void> {
  await createAuditLog(supabase, {
    actorId,
    action: AUDIT_ACTIONS.NOTICE_DELETE,
    resourceType: AUDIT_RESOURCES.NOTICE,
    resourceId: noticeId,
    metadata: { title: noticeTitle },
  });
}
