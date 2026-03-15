/**
 * Blog 도메인 - 모델 정의
 *
 * 이 파일에는 타입과 Zod 스키마만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ DB 쿼리 금지 → repository.ts
 */

import { z } from "zod";

// ─────────────────────────────────────────────
// Zod 스키마
// ─────────────────────────────────────────────

// 블로그 포스트 기본 스키마
export const blogPostSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  thumbnail_url: z.string().nullable(),
  tags: z.array(z.string()),
  is_published: z.boolean(),
  author_id: z.string().uuid(),
  published_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type BlogPost = z.infer<typeof blogPostSchema>;

// 블로그 포스트 + 작성자 정보
export const blogPostWithAuthorSchema = blogPostSchema.extend({
  author: z
    .object({
      name: z.string(),
      avatar_url: z.string().nullable(),
    })
    .nullable(),
});

export type BlogPostWithAuthor = z.infer<typeof blogPostWithAuthorSchema>;

// 블로그 포스트 생성 스키마
export const createBlogPostSchema = z.object({
  title: z.string().min(2, "제목은 2자 이상 입력해주세요").max(200),
  slug: z
    .string()
    .min(2, "슬러그는 2자 이상 입력해주세요")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "슬러그는 영문 소문자, 숫자, 하이픈만 사용 가능합니다"
    ),
  content: z.string().min(10, "내용은 10자 이상 입력해주세요"),
  excerpt: z.string().max(500).optional(),
  thumbnail_url: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
  is_published: z.boolean().optional().default(false),
});

export type CreateBlogPostInput = {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail_url?: string;
  tags: string[];
  is_published: boolean;
};

// 블로그 포스트 수정 스키마
export const updateBlogPostSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  content: z.string().min(10).optional(),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  thumbnail_url: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  is_published: z.boolean().optional(),
});

export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;

// ─────────────────────────────────────────────
// 서비스 결과 타입
// ─────────────────────────────────────────────

export interface BlogServiceResult {
  success: boolean;
  post?: BlogPost | BlogPostWithAuthor;
  error?: string;
}

export interface BlogListResult {
  success: boolean;
  posts: BlogPostWithAuthor[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
}

// ─────────────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────────────

/**
 * 제목에서 슬러그 생성
 * 한글 → 영문 변환은 하지 않고, 영문/숫자만 추출하여 슬러그 생성
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "") // 특수문자 제거
    .replace(/\s+/g, "-") // 공백 → 하이픈
    .replace(/-+/g, "-") // 중복 하이픈 제거
    .replace(/^-|-$/g, "") // 앞뒤 하이픈 제거
    .slice(0, 100); // 최대 100자
}

/**
 * 슬러그에 타임스탬프 추가 (중복 방지)
 */
export function generateUniqueSlug(title: string): string {
  const baseSlug = generateSlug(title);
  const timestamp = Date.now().toString(36);
  return baseSlug ? `${baseSlug}-${timestamp}` : timestamp;
}

// 스키마 별칭 (어드민 페이지용)
export const CreateBlogPostInputSchema = createBlogPostSchema;
export const UpdateBlogPostInputSchema = updateBlogPostSchema;
