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
    .select("title, excerpt, tags, published_at, updated_at, thumbnail_url, author:profiles!author_id(name)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) {
    return { title: "블로그 | 스터디코어 1.0" };
  }

  const authorData = post.author as { name: string } | { name: string }[] | null;
  const author = (Array.isArray(authorData) ? authorData[0]?.name : authorData?.name) ?? "스터디코어 1.0";

  return {
    title: post.title,
    description: post.excerpt || undefined,
    authors: [{ name: author }],
    keywords: post.tags ?? undefined,
    alternates: {
      canonical: `https://studycore.kr/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      url: `https://studycore.kr/blog/${slug}`,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: [author],
      tags: post.tags ?? undefined,
      images: post.thumbnail_url ? [{ url: post.thumbnail_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || undefined,
      images: post.thumbnail_url ? [post.thumbnail_url] : undefined,
    },
  };
}

export default function BlogPostLayout({ children }: Props) {
  return <>{children}</>;
}
