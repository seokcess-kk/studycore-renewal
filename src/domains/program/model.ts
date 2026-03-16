/**
 * Program 도메인 - 모델 정의
 */

import { z } from "zod";

export const programSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  is_active: z.boolean(),
  sort_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Program = z.infer<typeof programSchema>;

export const createProgramSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100),
  description: z.string().max(2000).nullable().optional(),
  image_url: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;

export const updateProgramSchema = createProgramSchema.partial();
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

export interface ProgramServiceResult {
  success: boolean;
  program?: Program;
  error?: string;
}
