/**
 * Settings 도메인 - 리포지토리
 *
 * Supabase DB 쿼리
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { SiteSetting, SettingKey, UpdateSettingInput } from "./model";

/**
 * 모든 설정 조회
 */
export async function getAllSettings(
  supabase: SupabaseClient
): Promise<SiteSetting[]> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("key");

  if (error) {
    throw new Error(`설정 조회 실패: ${error.message}`);
  }

  return data || [];
}

/**
 * 특정 설정 조회
 */
export async function getSettingByKey(
  supabase: SupabaseClient,
  key: SettingKey
): Promise<SiteSetting | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", key)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`설정 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 여러 설정 조회 (키 목록)
 */
export async function getSettingsByKeys(
  supabase: SupabaseClient,
  keys: SettingKey[]
): Promise<SiteSetting[]> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .in("key", keys);

  if (error) {
    throw new Error(`설정 조회 실패: ${error.message}`);
  }

  return data || [];
}

/**
 * 설정 수정
 */
export async function updateSetting(
  supabase: SupabaseClient,
  input: UpdateSettingInput
): Promise<SiteSetting> {
  const { data, error } = await supabase
    .from("site_settings")
    .update({ value: input.value })
    .eq("key", input.key)
    .select()
    .single();

  if (error) {
    throw new Error(`설정 수정 실패: ${error.message}`);
  }

  return data;
}

/**
 * 여러 설정 일괄 수정
 */
export async function updateSettings(
  supabase: SupabaseClient,
  inputs: UpdateSettingInput[]
): Promise<void> {
  // upsert를 사용하여 일괄 수정
  const updates = inputs.map((input) => ({
    key: input.key,
    value: input.value,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value: update.value })
      .eq("key", update.key);

    if (error) {
      throw new Error(`설정 수정 실패 (${update.key}): ${error.message}`);
    }
  }
}

/**
 * 설정 추가 (관리자 전용)
 */
export async function createSetting(
  supabase: SupabaseClient,
  data: { key: string; value: string; description?: string }
): Promise<SiteSetting> {
  const { data: setting, error } = await supabase
    .from("site_settings")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`설정 추가 실패: ${error.message}`);
  }

  return setting;
}
