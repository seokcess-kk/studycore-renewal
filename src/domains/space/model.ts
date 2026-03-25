/**
 * Space 도메인 - 모델 정의
 */

import { z } from "zod";

export const spaceSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  is_active: z.boolean(),
  sort_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Space = z.infer<typeof spaceSchema>;

export const createSpaceSchema = z.object({
  label: z.string().min(1, "라벨을 입력해주세요").max(50),
  title: z.string().min(1, "제목을 입력해주세요").max(100),
  description: z.string().max(500).nullable().optional(),
  image_url: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional(),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;

export const updateSpaceSchema = createSpaceSchema.partial();
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;

export interface SpaceServiceResult {
  success: boolean;
  space?: Space;
  error?: string;
}
