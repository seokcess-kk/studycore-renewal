/**
 * Popup 도메인 - 모델 정의
 */

import { z } from "zod";

export const popupSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  image_url: z.string().nullable(),
  content: z.string().nullable(),
  link_url: z.string().nullable(),
  link_text: z.string().nullable(),
  notice_id: z.string().uuid().nullable(),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean(),
  sort_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Popup = z.infer<typeof popupSchema>;

export const createPopupSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100),
  image_url: z.string().nullable().optional(),
  content: z.string().max(2000).nullable().optional(),
  link_url: z.string().url("올바른 URL을 입력해주세요").nullable().optional().or(z.literal("")),
  link_text: z.string().max(50).nullable().optional(),
  notice_id: z.string().uuid().nullable().optional(),
  start_date: z.string().min(1, "시작일을 선택해주세요"),
  end_date: z.string().min(1, "종료일을 선택해주세요"),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional(),
});

export type CreatePopupInput = z.infer<typeof createPopupSchema>;

export const updatePopupSchema = createPopupSchema.partial();
export type UpdatePopupInput = z.infer<typeof updatePopupSchema>;

export interface PopupServiceResult {
  success: boolean;
  popup?: Popup;
  error?: string;
}
