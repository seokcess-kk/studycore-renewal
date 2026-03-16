import { SupabaseClient } from "@supabase/supabase-js";

/** PostgREST 필터에 사용되는 특수 문자를 이스케이프 */
function escapeFilterValue(value: string): string {
  return value.replace(/[%_.,()\\]/g, "\\$&");
}

export async function searchNotices(
  supabase: SupabaseClient,
  query: string,
  limit = 5
) {
  const safe = escapeFilterValue(query);
  const { data, error } = await supabase
    .from("notices")
    .select("id, title, content, created_at")
    .eq("is_published", true)
    .or(`title.ilike.%${safe}%,content.ilike.%${safe}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function searchBlogPosts(
  supabase: SupabaseClient,
  query: string,
  limit = 5
) {
  const safe = escapeFilterValue(query);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, excerpt, slug, created_at")
    .eq("status", "published")
    .or(`title.ilike.%${safe}%,content.ilike.%${safe}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
