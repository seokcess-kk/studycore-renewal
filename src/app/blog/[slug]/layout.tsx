import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, tags")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) {
    return { title: "블로그 | 스터디코어 1.0" };
  }

  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
    },
  };
}

export default function BlogPostLayout({ children }: Props) {
  return <>{children}</>;
}
