/**
 * Counseling 도메인 - 모델
 *
 * 상담 기록 관련 타입 및 스키마 정의
 */

import { z } from "zod";

// ============================================
// 타입 정의
// ============================================

export type CounselingType = "admission" | "career" | "etc";

export interface CounselingRecord {
  id: string;
  student_id: string;
  counselor_id: string;
  date: string;
  type: CounselingType;
  content: string;
  next_date: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CounselingRecordWithProfiles extends CounselingRecord {
  student: {
    name: string;
    school: string | null;
    grade: number | null;
  };
  counselor: {
    name: string;
  };
}

// ============================================
// Zod 스키마
// ============================================

export const CounselingTypeSchema = z.enum(["admission", "career", "etc"]);

export const CreateCounselingInputSchema = z.object({
  student_id: z.string().uuid("유효한 학생 ID가 필요합니다"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다"),
  type: CounselingTypeSchema,
  content: z.string().min(1, "상담 내용을 입력해주세요"),
  next_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  attachment_url: z.string().url().nullable().optional(),
  attachment_name: z.string().nullable().optional(),
});

export const UpdateCounselingInputSchema = CreateCounselingInputSchema.partial();

export type CreateCounselingInput = z.infer<typeof CreateCounselingInputSchema>;
export type UpdateCounselingInput = z.infer<typeof UpdateCounselingInputSchema>;

// ============================================
// 헬퍼
// ============================================

export const COUNSELING_TYPE_LABELS: Record<CounselingType, string> = {
  admission: "진학 상담",
  career: "진로 상담",
  etc: "기타",
};
