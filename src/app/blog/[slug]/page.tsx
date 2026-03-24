"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Nav, Footer, Skeleton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getBlogBySlug, getAdjacentPosts } from "@/domains/blog/service";
import type { BlogPostWithAuthor, BlogPost } from "@/domains/blog/model";
import { Calendar, Tag, ChevronLeft, ChevronRight, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPostWithAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adjacentPosts, setAdjacentPosts] = useState<{
    prev: BlogPost | null;
    next: BlogPost | null;
  }>({ prev: null, next: null });

  useEffect(() => {
    async function fetchPost() {
      setIsLoading(true);
      const supabase = createClient();
      const result = await getBlogBySlug(supabase, slug);

      if (result.success && result.post) {
        setPost(result.post as BlogPostWithAuthor);

        // 인접 포스트 조회
        if (result.post.published_at) {
          const adjacent = await getAdjacentPosts(
            supabase,
            result.post.id,
            result.post.published_at
          );
          setAdjacentPosts(adjacent);
        }
      }
      setIsLoading(false);
    }

    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <>
        <Nav />
        <main className="page-body">
          <article className="max-w-3xl mx-auto px-6 md:px-13">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/4 mb-8" />
            <Skeleton className="aspect-[16/9] w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </article>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    notFound();
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <>
      <Nav />
      <main className="page-body">
        {/* 헤더 */}
        <header className="bg-navy section-sm px-6 md:px-13">
          <div className="max-w-3xl mx-auto">
            {/* 태그 */}
            {post.tags.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 text-caption font-medium text-teal hover:text-teal-d transition-colors"
                  >
                    <Tag size={10} />
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* 제목 */}
            <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-black text-white leading-tight">
              {post.title}
            </h1>

            {/* 메타 정보 */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-secondary text-white/60">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{formattedDate}</span>
              </div>
              {post.author && (
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span>{post.author.name}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 썸네일 */}
        {post.thumbnail_url && (
          <div className="max-w-4xl mx-auto px-6 md:px-13 -mt-8">
            <div className="aspect-[16/9] relative bg-stone overflow-hidden border border-rule">
              <Image
                src={post.thumbnail_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* 본문 */}
        <article className="max-w-3xl mx-auto px-6 md:px-13 py-12">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="font-serif text-fluid-h2 font-bold text-ink mt-10 mb-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-serif text-fluid-h3 font-bold text-ink mt-8 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-serif text-subhead font-bold text-ink mt-6 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-subhead leading-prose text-ink mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-4 space-y-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-subhead leading-prose text-ink">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-teal pl-4 italic text-muted my-6">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-stone px-1.5 py-0.5 text-body font-mono text-navy">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-navy-d p-4 text-body font-mono text-white overflow-x-auto">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-navy-d p-4 overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-teal hover:text-teal-d underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => (
                  <span className="block my-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={typeof src === "string" ? src : ""}
                      alt={alt || ""}
                      className="w-full h-auto border border-rule"
                    />
                  </span>
                ),
                hr: () => <hr className="border-rule my-8" />,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse border border-rule">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-rule bg-stone px-4 py-2 text-left font-medium">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-rule px-4 py-2">{children}</td>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* 이전/다음 포스트 */}
        {(adjacentPosts.prev || adjacentPosts.next) && (
          <nav className="max-w-3xl mx-auto px-6 md:px-13 py-8 border-t border-rule">
            <div className="flex justify-between gap-4">
              {adjacentPosts.prev ? (
                <Link
                  href={`/blog/${adjacentPosts.prev.slug}`}
                  className="group flex items-center gap-3 text-left flex-1"
                >
                  <ChevronLeft
                    size={20}
                    className="text-muted group-hover:text-navy transition-colors"
                  />
                  <div>
                    <span className="text-small text-muted block">
                      이전 포스트
                    </span>
                    <span className="text-body font-medium text-ink group-hover:text-navy transition-colors line-clamp-1">
                      {adjacentPosts.prev.title}
                    </span>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {adjacentPosts.next ? (
                <Link
                  href={`/blog/${adjacentPosts.next.slug}`}
                  className="group flex items-center gap-3 text-right flex-1 justify-end"
                >
                  <div>
                    <span className="text-small text-muted block">
                      다음 포스트
                    </span>
                    <span className="text-body font-medium text-ink group-hover:text-navy transition-colors line-clamp-1">
                      {adjacentPosts.next.title}
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-muted group-hover:text-navy transition-colors"
                  />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </nav>
        )}

        {/* 목록으로 */}
        <div className="max-w-3xl mx-auto px-6 md:px-13 py-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-body text-muted hover:text-navy transition-colors"
          >
            <ChevronLeft size={16} />
            목록으로 돌아가기
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
