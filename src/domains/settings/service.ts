/**
 * Settings 도메인 - 서비스
 *
 * 비즈니스 로직
 */

import { SupabaseClient } from "@supabase/supabase-js";
import * as repository from "./repository";
import type {
  MenuVisibility,
  SettingKey,
  UpdateSettingInput,
} from "./model";
import { settingToBoolean, booleanToSetting } from "./model";
import { logSettingsUpdate } from "@/lib/audit";

/**
 * 모든 설정 조회
 */
export async function getAllSiteSettings(supabase: SupabaseClient) {
  return repository.getAllSettings(supabase);
}

/**
 * 메뉴 가시성 설정 조회
 */
export async function getMenuVisibility(
  supabase: SupabaseClient
): Promise<MenuVisibility> {
  const keys: SettingKey[] = [
    "menu_about_visible",
    "menu_blog_visible",
    "menu_reviews_visible",
    "menu_system_visible",
  ];

  const settings = await repository.getSettingsByKeys(supabase, keys);

  const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

  return {
    about: settingToBoolean(settingsMap.get("menu_about_visible") || "false"),
    blog: settingToBoolean(settingsMap.get("menu_blog_visible") || "false"),
    reviews: settingToBoolean(settingsMap.get("menu_reviews_visible") || "false"),
    system: settingToBoolean(settingsMap.get("menu_system_visible") || "true"),
  };
}

/**
 * 메뉴 가시성 설정 업데이트
 */
export async function updateMenuVisibility(
  supabase: SupabaseClient,
  visibility: Partial<MenuVisibility>
): Promise<void> {
  const updates: UpdateSettingInput[] = [];

  if (visibility.about !== undefined) {
    updates.push({
      key: "menu_about_visible",
      value: booleanToSetting(visibility.about),
    });
  }
  if (visibility.blog !== undefined) {
    updates.push({
      key: "menu_blog_visible",
      value: booleanToSetting(visibility.blog),
    });
  }
  if (visibility.reviews !== undefined) {
    updates.push({
      key: "menu_reviews_visible",
      value: booleanToSetting(visibility.reviews),
    });
  }
  if (visibility.system !== undefined) {
    updates.push({
      key: "menu_system_visible",
      value: booleanToSetting(visibility.system),
    });
  }

  if (updates.length > 0) {
    await repository.updateSettings(supabase, updates);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      void logSettingsUpdate(supabase, user.id, "menu_visibility", { changes: updates });
    }
  }
}

/**
 * SMS 템플릿 조회
 */
export async function getSmsTemplate(
  supabase: SupabaseClient
): Promise<string> {
  const setting = await repository.getSettingByKey(
    supabase,
    "sms_consult_template"
  );
  return setting?.value || "";
}

/**
 * SMS 템플릿 업데이트
 */
export async function updateSmsTemplate(
  supabase: SupabaseClient,
  template: string
): Promise<void> {
  await repository.updateSetting(supabase, {
    key: "sms_consult_template",
    value: template,
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    void logSettingsUpdate(supabase, user.id, "sms_consult_template");
  }
}

/**
 * 단일 설정 업데이트
 */
export async function updateSingleSetting(
  supabase: SupabaseClient,
  key: SettingKey,
  value: string
): Promise<void> {
  await repository.updateSetting(supabase, { key, value });
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    void logSettingsUpdate(supabase, user.id, key);
  }
}
