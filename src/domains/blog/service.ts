/**
 * Blog 도메인 - 서비스
 *
 * 이 파일에는 비즈니스 로직만 포함합니다.
 * ⚠️ DB 쿼리 금지 → repository.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import * as repository from "./repository";
import {
  type BlogListResult,
  type BlogServiceResult,
  type CreateBlogPostInput,
  type UpdateBlogPostInput,
  generateUniqueSlug,
} from "./model";
import { logBlogCreate, logBlogUpdate, logBlogDelete } from "@/lib/audit";

/**
 * 발행된 블로그 목록 조회 (공개용)
 */
export async function getPublishedBlogList(
  supabase: SupabaseClient,
  options?: {
    tag?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<BlogListResult> {
  try {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 9;
    const offset = (page - 1) * pageSize;

    const { data, count } = await repository.getPublishedPosts(supabase, {
      tag: options?.tag,
      search: options?.search,
      limit: pageSize,
      offset,
    });

    return {
      success: true,
      posts: data,
      total: count,
      page,
      pageSize,
    };
  } catch (error) {
    return {
      success: false,
      posts: [],
      total: 0,
      page: 1,
      pageSize: 9,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 블로그 목록 조회 (어드민용)
 */
export async function getBlogList(
  supabase: SupabaseClient,
  options?: {
    publishedOnly?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<BlogListResult> {
  try {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    const { data, count } = await repository.getAllPosts(supabase, {
      publishedOnly: options?.publishedOnly,
      search: options?.search,
      limit: pageSize,
      offset,
    });

    return {
      success: true,
      posts: data,
      total: count,
      page,
      pageSize,
    };
  } catch (error) {
    return {
      success: false,
      posts: [],
      total: 0,
      page: 1,
      pageSize: 10,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 슬러그로 블로그 조회
 */
export async function getBlogBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<BlogServiceResult> {
  try {
    const post = await repository.getPostBySlug(supabase, slug);

    if (!post) {
      return {
        success: false,
        error: "포스트를 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      post,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * ID로 블로그 조회
 */
export async function getBlogById(
  supabase: SupabaseClient,
  postId: string
): Promise<BlogServiceResult> {
  try {
    const post = await repository.getPostById(supabase, postId);

    if (!post) {
      return {
        success: false,
        error: "포스트를 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      post,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 블로그 생성
 */
export async function createBlog(
  supabase: SupabaseClient,
  authorId: string,
  input: CreateBlogPostInput
): Promise<BlogServiceResult> {
  try {
    // 슬러그가 비어있으면 자동 생성
    let slug = input.slug;
    if (!slug || slug.trim() === "") {
      slug = generateUniqueSlug(input.title);
    }

    // 슬러그 중복 확인
    const slugExists = await repository.isSlugExists(supabase, slug);
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const post = await repository.createPost(supabase, {
      ...input,
      slug,
      author_id: authorId,
    });

    void logBlogCreate(supabase, authorId, post.id, post.title);

    return {
      success: true,
      post,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 블로그 수정
 */
export async function updateBlog(
  supabase: SupabaseClient,
  postId: string,
  input: UpdateBlogPostInput
): Promise<BlogServiceResult> {
  try {
    // 슬러그 변경 시 중복 확인
    if (input.slug) {
      const slugExists = await repository.isSlugExists(
        supabase,
        input.slug,
        postId
      );
      if (slugExists) {
        return {
          success: false,
          error: "이미 사용 중인 슬러그입니다.",
        };
      }
    }

    const post = await repository.updatePost(supabase, postId, input);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      void logBlogUpdate(supabase, user.id, post.id, post.title);
    }

    return {
      success: true,
      post,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 블로그 삭제
 */
export async function deleteBlog(
  supabase: SupabaseClient,
  postId: string
): Promise<BlogServiceResult> {
  try {
    // 삭제 전 제목 + actor 조회 (audit용)
    const [{ data: existing }, { data: { user } }] = await Promise.all([
      supabase.from("blog_posts").select("title").eq("id", postId).single(),
      supabase.auth.getUser(),
    ]);

    await repository.deletePost(supabase, postId);

    if (user && existing?.title) {
      void logBlogDelete(supabase, user.id, postId, existing.title);
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 블로그 발행
 */
export async function publishBlog(
  supabase: SupabaseClient,
  postId: string
): Promise<BlogServiceResult> {
  return updateBlog(supabase, postId, { is_published: true });
}

/**
 * 블로그 발행 취소
 */
export async function unpublishBlog(
  supabase: SupabaseClient,
  postId: string
): Promise<BlogServiceResult> {
  return updateBlog(supabase, postId, { is_published: false });
}

/**
 * 네이버 블로그 복사용 HTML 생성
 */
export function copyForNaver(
  post: { title: string; content: string; thumbnail_url?: string | null },
  baseUrl: string
): string {
  // Markdown을 HTML로 간단 변환
  // 실제로는 react-markdown 등으로 렌더링된 HTML 사용 권장
  let html = post.content
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/!\[(.*?)\]\((.*?)\)/gim, `<img src="${baseUrl}$2" alt="$1">`)
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    .replace(/\n/gim, "<br>");

  // 썸네일이 있으면 상단에 추가
  if (post.thumbnail_url) {
    const thumbnailUrl = post.thumbnail_url.startsWith("http")
      ? post.thumbnail_url
      : `${baseUrl}${post.thumbnail_url}`;
    html = `<img src="${thumbnailUrl}" alt="${post.title}"><br><br>${html}`;
  }

  return html;
}

/**
 * 인접 포스트 조회
 */
export async function getAdjacentPosts(
  supabase: SupabaseClient,
  postId: string,
  publishedAt: string
) {
  return repository.getAdjacentPosts(supabase, postId, publishedAt);
}

/**
 * 모든 발행된 슬러그 목록 (SSG용)
 */
export async function getAllPublishedSlugs(
  supabase: SupabaseClient
): Promise<string[]> {
  return repository.getAllPublishedSlugs(supabase);
}
