import { SupabaseClient } from "@supabase/supabase-js";

export async function searchNotices(
  supabase: SupabaseClient,
  query: string,
  limit = 5
) {
  const { data, error } = await supabase
    .from("notices")
    .select("id, title, content, created_at")
    .eq("is_published", true)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
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
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, excerpt, slug, created_at")
    .eq("status", "published")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
