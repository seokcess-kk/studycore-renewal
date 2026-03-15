/**
 * Notification 도메인 - 리포지토리
 *
 * 이 파일에는 Supabase DB 쿼리만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  NotificationTarget,
  NotificationLogDB,
  CreateNotificationLogInput,
  NotificationLogFilter,
  NotificationStats,
} from "./model";

// ─────────────────────────────────────────────
// 수신자 조회
// ─────────────────────────────────────────────

/**
 * 활성 재원생 연락처 조회
 */
export async function getActiveStudentContacts(
  supabase: SupabaseClient
): Promise<NotificationTarget[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, phone")
    .eq("role", "student")
    .eq("status", "active")
    .not("phone", "is", null);

  if (error) {
    throw new Error(`재원생 연락처 조회 실패: ${error.message}`);
  }

  return (data || []).map((profile) => ({
    userId: profile.id,
    name: profile.name,
    phone: profile.phone,
  }));
}

/**
 * 활성 재원생 + 학부모 연락처 조회
 */
export async function getActiveStudentAndParentContacts(
  supabase: SupabaseClient
): Promise<NotificationTarget[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, phone, parent_phone")
    .eq("role", "student")
    .eq("status", "active");

  if (error) {
    throw new Error(`연락처 조회 실패: ${error.message}`);
  }

  const targets: NotificationTarget[] = [];

  for (const profile of data || []) {
    // 학생 연락처
    if (profile.phone) {
      targets.push({
        userId: profile.id,
        name: profile.name,
        phone: profile.phone,
        isParent: false,
      });
    }

    // 학부모 연락처
    if (profile.parent_phone) {
      targets.push({
        userId: profile.id,
        name: `${profile.name} 학부모`,
        phone: profile.parent_phone,
        isParent: true,
      });
    }
  }

  return targets;
}

/**
 * 특정 사용자 연락처 조회
 */
export async function getUserContacts(
  supabase: SupabaseClient,
  userIds: string[],
  includeParents?: boolean
): Promise<NotificationTarget[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, phone, parent_phone")
    .in("id", userIds);

  if (error) {
    throw new Error(`사용자 연락처 조회 실패: ${error.message}`);
  }

  const targets: NotificationTarget[] = [];

  for (const profile of data || []) {
    // 사용자 연락처
    if (profile.phone) {
      targets.push({
        userId: profile.id,
        name: profile.name,
        phone: profile.phone,
        isParent: false,
      });
    }

    // 학부모 연락처
    if (includeParents && profile.parent_phone) {
      targets.push({
        userId: profile.id,
        name: `${profile.name} 학부모`,
        phone: profile.parent_phone,
        isParent: true,
      });
    }
  }

  return targets;
}

/**
 * 멘토 연락처 조회
 */
export async function getMentorContacts(
  supabase: SupabaseClient
): Promise<NotificationTarget[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, phone")
    .in("role", ["mentor", "admin"])
    .not("phone", "is", null);

  if (error) {
    throw new Error(`멘토 연락처 조회 실패: ${error.message}`);
  }

  return (data || []).map((profile) => ({
    userId: profile.id,
    name: profile.name,
    phone: profile.phone,
  }));
}

/**
 * 관리자 연락처 조회
 */
export async function getAdminContacts(
  supabase: SupabaseClient
): Promise<NotificationTarget[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, phone")
    .eq("role", "admin")
    .not("phone", "is", null);

  if (error) {
    throw new Error(`관리자 연락처 조회 실패: ${error.message}`);
  }

  return (data || []).map((profile) => ({
    userId: profile.id,
    name: profile.name,
    phone: profile.phone,
  }));
}

/**
 * 학생 ID로 연락처 조회
 */
export async function getStudentContact(
  supabase: SupabaseClient,
  studentId: string
): Promise<NotificationTarget | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, phone")
    .eq("id", studentId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`학생 연락처 조회 실패: ${error.message}`);
  }

  if (!data.phone) {
    return null;
  }

  return {
    userId: data.id,
    name: data.name,
    phone: data.phone,
  };
}

/**
 * 질문 작성자의 멘토 조회 (질문방 담당 멘토)
 * 현재는 모든 멘토에게 알림 발송
 */
export async function getQuestionMentors(
  supabase: SupabaseClient,
  questionId: string // 추후 질문 담당 멘토 기능 추가 시 사용
): Promise<NotificationTarget[]> {
  void questionId; // 추후 사용 예정
  return getMentorContacts(supabase);
}

// ─────────────────────────────────────────────
// 알림 로그 관리
// ─────────────────────────────────────────────

/**
 * 알림 로그 목록 조회
 */
export async function getNotificationLogs(
  supabase: SupabaseClient,
  filter: NotificationLogFilter = {}
): Promise<{ logs: NotificationLogDB[]; total: number }> {
  const { type, status, startDate, endDate, page = 1, limit = 20 } = filter;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("notification_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`알림 로그 조회 실패: ${error.message}`);
  }

  return {
    logs: (data || []) as NotificationLogDB[],
    total: count || 0,
  };
}

/**
 * 알림 통계 조회
 */
export async function getNotificationStats(
  supabase: SupabaseClient,
  filter: { startDate?: string; endDate?: string } = {}
): Promise<NotificationStats> {
  const { startDate, endDate } = filter;

  let query = supabase.from("notification_logs").select("status");

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`알림 통계 조회 실패: ${error.message}`);
  }

  const logs = data || [];
  const stats: NotificationStats = {
    total: logs.length,
    sent: logs.filter((l) => l.status === "sent").length,
    failed: logs.filter((l) => l.status === "failed").length,
    pending: logs.filter((l) => l.status === "pending").length,
  };

  return stats;
}

/**
 * 알림 로그 생성 (단일)
 */
export async function createNotificationLog(
  supabase: SupabaseClient,
  input: CreateNotificationLogInput
): Promise<NotificationLogDB> {
  const { data, error } = await supabase
    .from("notification_logs")
    .insert({
      type: input.type,
      recipient_phone: input.recipient_phone,
      recipient_name: input.recipient_name || null,
      message: input.message,
      template_code: input.template_code || null,
      status: input.status,
      error_message: input.error_message || null,
      sent_by: input.sent_by || null,
      metadata: input.metadata || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`알림 로그 생성 실패: ${error.message}`);
  }

  return data as NotificationLogDB;
}

/**
 * 알림 로그 배치 생성
 */
export async function createNotificationLogsBatch(
  supabase: SupabaseClient,
  inputs: CreateNotificationLogInput[]
): Promise<number> {
  if (inputs.length === 0) {
    return 0;
  }

  const records = inputs.map((input) => ({
    type: input.type,
    recipient_phone: input.recipient_phone,
    recipient_name: input.recipient_name || null,
    message: input.message,
    template_code: input.template_code || null,
    status: input.status,
    error_message: input.error_message || null,
    sent_by: input.sent_by || null,
    metadata: input.metadata || {},
  }));

  const { error } = await supabase.from("notification_logs").insert(records);

  if (error) {
    throw new Error(`알림 로그 배치 생성 실패: ${error.message}`);
  }

  return inputs.length;
}
