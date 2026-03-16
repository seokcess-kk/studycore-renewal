import { SupabaseClient } from "@supabase/supabase-js";
import type { SearchResult } from "./model";
import * as searchRepo from "./repository";

export async function search(
  supabase: SupabaseClient,
  query: string,
  limit = 10
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const perType = Math.ceil(limit / 2);

  const [notices, blogs] = await Promise.all([
    searchRepo.searchNotices(supabase, query, perType).catch(() => []),
    searchRepo.searchBlogPosts(supabase, query, perType).catch(() => []),
  ]);

  const results: SearchResult[] = [
    ...notices.map((n) => ({
      id: n.id,
      type: "notice" as const,
      title: n.title,
      excerpt: (n.content || "").replace(/<[^>]*>/g, "").slice(0, 100),
      url: `/notices/${n.id}`,
      date: n.created_at,
    })),
    ...blogs.map((b) => ({
      id: b.id,
      type: "blog" as const,
      title: b.title,
      excerpt: b.excerpt || "",
      url: `/blog/${b.slug}`,
      date: b.created_at,
    })),
  ];

  // 날짜순 정렬
  results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return results.slice(0, limit);
}
