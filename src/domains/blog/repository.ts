/**
 * Blog 도메인 - 리포지토리
 *
 * 이 파일에는 Supabase DB 쿼리만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  BlogPost,
  BlogPostWithAuthor,
  CreateBlogPostInput,
  UpdateBlogPostInput,
} from "./model";

/**
 * 발행된 블로그 포스트 목록 조회 (공개용)
 */
export async function getPublishedPosts(
  supabase: SupabaseClient,
  options?: {
    tag?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: BlogPostWithAuthor[]; count: number }> {
  let query = supabase
    .from("blog_posts")
    .select(
      `
      *,
      author:profiles!author_id (
        name,
        avatar_url
      )
    `,
      { count: "exact" }
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (options?.tag) {
    query = query.contains("tags", [options.tag]);
  }

  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,content.ilike.%${options.search}%`
    );
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit ?? 10) - 1
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`블로그 목록 조회 실패: ${error.message}`);
  }

  return { data: data || [], count: count || 0 };
}

/**
 * 슬러그로 블로그 포스트 조회
 */
export async function getPostBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<BlogPostWithAuthor | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      *,
      author:profiles!author_id (
        name,
        avatar_url
      )
    `
    )
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`블로그 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * ID로 블로그 포스트 조회
 */
export async function getPostById(
  supabase: SupabaseClient,
  postId: string
): Promise<BlogPostWithAuthor | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      *,
      author:profiles!author_id (
        name,
        avatar_url
      )
    `
    )
    .eq("id", postId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`블로그 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 모든 블로그 포스트 목록 조회 (어드민용)
 */
export async function getAllPosts(
  supabase: SupabaseClient,
  options?: {
    publishedOnly?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: BlogPostWithAuthor[]; count: number }> {
  let query = supabase
    .from("blog_posts")
    .select(
      `
      *,
      author:profiles!author_id (
        name,
        avatar_url
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (options?.publishedOnly) {
    query = query.eq("is_published", true);
  }

  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,content.ilike.%${options.search}%`
    );
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit ?? 10) - 1
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`블로그 목록 조회 실패: ${error.message}`);
  }

  return { data: data || [], count: count || 0 };
}

/**
 * 블로그 포스트 생성
 */
export async function createPost(
  supabase: SupabaseClient,
  data: CreateBlogPostInput & { author_id: string }
): Promise<BlogPost> {
  const insertData = {
    ...data,
    published_at: data.is_published ? new Date().toISOString() : null,
  };

  const { data: post, error } = await supabase
    .from("blog_posts")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 사용 중인 슬러그입니다.");
    }
    throw new Error(`블로그 생성 실패: ${error.message}`);
  }

  return post;
}

/**
 * 블로그 포스트 수정
 */
export async function updatePost(
  supabase: SupabaseClient,
  postId: string,
  data: UpdateBlogPostInput
): Promise<BlogPost> {
  // 발행 상태가 true로 변경되면 published_at 설정
  const updateData: Record<string, unknown> = { ...data };
  if (data.is_published === true) {
    // 기존 published_at이 없으면 현재 시간으로 설정
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("published_at")
      .eq("id", postId)
      .single();

    if (!existing?.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data: post, error } = await supabase
    .from("blog_posts")
    .update(updateData)
    .eq("id", postId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 사용 중인 슬러그입니다.");
    }
    throw new Error(`블로그 수정 실패: ${error.message}`);
  }

  return post;
}

/**
 * 블로그 포스트 삭제
 */
export async function deletePost(
  supabase: SupabaseClient,
  postId: string
): Promise<void> {
  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", postId);

  if (error) {
    throw new Error(`블로그 삭제 실패: ${error.message}`);
  }
}

/**
 * 인접 포스트 조회 (이전/다음)
 */
export async function getAdjacentPosts(
  supabase: SupabaseClient,
  currentPostId: string,
  publishedAt: string
): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
  // 이전 포스트 (더 최신)
  const { data: prevData } = await supabase
    .from("blog_posts")
    .select("id, title, slug")
    .eq("is_published", true)
    .gt("published_at", publishedAt)
    .neq("id", currentPostId)
    .order("published_at", { ascending: true })
    .limit(1)
    .single();

  // 다음 포스트 (더 오래됨)
  const { data: nextData } = await supabase
    .from("blog_posts")
    .select("id, title, slug")
    .eq("is_published", true)
    .lt("published_at", publishedAt)
    .neq("id", currentPostId)
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  return {
    prev: prevData as BlogPost | null,
    next: nextData as BlogPost | null,
  };
}

/**
 * 슬러그 중복 확인
 */
export async function isSlugExists(
  supabase: SupabaseClient,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query.single();
  return !!data;
}

/**
 * 모든 발행된 포스트의 슬러그 목록 (SSG용)
 */
export async function getAllPublishedSlugs(
  supabase: SupabaseClient
): Promise<string[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);

  if (error) {
    throw new Error(`슬러그 목록 조회 실패: ${error.message}`);
  }

  return (data || []).map((post) => post.slug);
}
