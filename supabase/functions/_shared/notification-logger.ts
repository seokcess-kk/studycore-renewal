/**
 * Notification Logger
 * Edge Functions에서 알림 발송 이력을 저장하는 공통 유틸
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface NotificationLogEntry {
  type: "sms" | "alimtalk";
  recipient_phone: string;
  recipient_name?: string;
  message: string;
  template_code?: string;
  status: "pending" | "sent" | "failed";
  error_message?: string;
  sent_by?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Supabase 클라이언트 생성 (Service Role)
 */
function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * 단일 알림 로그 저장
 */
export async function logNotification(entry: NotificationLogEntry): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    await supabase.from("notification_logs").insert({
      type: entry.type,
      recipient_phone: entry.recipient_phone,
      recipient_name: entry.recipient_name || null,
      message: entry.message,
      template_code: entry.template_code || null,
      status: entry.status,
      error_message: entry.error_message || null,
      sent_by: entry.sent_by || null,
      metadata: entry.metadata || {},
    });
  } catch (error) {
    // 로그 저장 실패는 무시하고 계속 진행
    console.error("알림 로그 저장 실패:", error);
  }
}

/**
 * 배치 알림 로그 저장
 */
export async function logNotificationsBatch(
  entries: NotificationLogEntry[]
): Promise<void> {
  if (entries.length === 0) {
    return;
  }

  try {
    const supabase = getSupabaseAdmin();

    const records = entries.map((entry) => ({
      type: entry.type,
      recipient_phone: entry.recipient_phone,
      recipient_name: entry.recipient_name || null,
      message: entry.message,
      template_code: entry.template_code || null,
      status: entry.status,
      error_message: entry.error_message || null,
      sent_by: entry.sent_by || null,
      metadata: entry.metadata || {},
    }));

    // 100건씩 배치 저장
    const BATCH_SIZE = 100;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await supabase.from("notification_logs").insert(batch);
    }
  } catch (error) {
    // 로그 저장 실패는 무시하고 계속 진행
    console.error("알림 로그 배치 저장 실패:", error);
  }
}

/**
 * SMS 발송 결과를 로그 엔트리로 변환
 */
export function createSMSLogEntries(
  phones: string[],
  message: string,
  results: { success: number; failed: number; errors: string[] },
  phoneToNameMap?: Map<string, string>,
  sentBy?: string
): NotificationLogEntry[] {
  const entries: NotificationLogEntry[] = [];

  // 성공한 발송 기록
  const successCount = results.success;
  const failedPhones = new Set<string>();

  // 에러 메시지에서 실패한 전화번호 추출 (가능한 경우)
  results.errors.forEach((error) => {
    const phoneMatch = error.match(/(\d{10,11})/);
    if (phoneMatch) {
      failedPhones.add(phoneMatch[1]);
    }
  });

  let successIndex = 0;
  phones.forEach((phone) => {
    const isFailed = failedPhones.has(phone);

    if (isFailed) {
      entries.push({
        type: "sms",
        recipient_phone: phone,
        recipient_name: phoneToNameMap?.get(phone),
        message,
        status: "failed",
        error_message: results.errors.find((e) => e.includes(phone)) || "발송 실패",
        sent_by: sentBy,
      });
    } else if (successIndex < successCount) {
      entries.push({
        type: "sms",
        recipient_phone: phone,
        recipient_name: phoneToNameMap?.get(phone),
        message,
        status: "sent",
        sent_by: sentBy,
      });
      successIndex++;
    }
  });

  return entries;
}
