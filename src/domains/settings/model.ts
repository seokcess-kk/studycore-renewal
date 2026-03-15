/**
 * Settings 도메인 - 모델
 *
 * 사이트 설정 관련 타입 및 스키마 정의
 */

import { z } from "zod";

// ============================================
// 타입 정의
// ============================================

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

// 설정 키 타입
export type SettingKey =
  | "menu_about_visible"
  | "menu_blog_visible"
  | "menu_reviews_visible"
  | "menu_system_visible"
  | "sms_consult_template";

// 메뉴 가시성 설정
export interface MenuVisibility {
  about: boolean;
  blog: boolean;
  reviews: boolean;
  system: boolean;
}

// ============================================
// Zod 스키마
// ============================================

export const UpdateSettingInputSchema = z.object({
  key: z.string().min(1, "설정 키가 필요합니다"),
  value: z.string(),
});

export const UpdateSettingsInputSchema = z.array(UpdateSettingInputSchema);

export type UpdateSettingInput = z.infer<typeof UpdateSettingInputSchema>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsInputSchema>;

// ============================================
// 헬퍼
// ============================================

export const SETTING_KEYS: Record<SettingKey, string> = {
  menu_about_visible: "소개 페이지 노출",
  menu_blog_visible: "블로그 페이지 노출",
  menu_reviews_visible: "후기 페이지 노출",
  menu_system_visible: "운영시스템 페이지 노출",
  sms_consult_template: "상담 신청 SMS 템플릿",
};

/**
 * 설정값을 boolean으로 변환
 */
export function settingToBoolean(value: string): boolean {
  return value === "true";
}

/**
 * boolean을 설정값으로 변환
 */
export function booleanToSetting(value: boolean): string {
  return value ? "true" : "false";
}
