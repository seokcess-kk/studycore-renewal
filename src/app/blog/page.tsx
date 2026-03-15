"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Nav, Footer, Skeleton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getPublishedBlogList } from "@/domains/blog/service";
import type { BlogPostWithAuthor } from "@/domains/blog/model";
import { Calendar, Tag, ChevronLeft, ChevronRight } from "lucide-react";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [allTags, setAllTags] = useState<string[]>([]);
  const pageSize = 9;

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      const supabase = createClient();
      const result = await getPublishedBlogList(supabase, {
        tag: selectedTag,
        page,
        pageSize,
      });

      if (result.success) {
        setPosts(result.posts);
        setTotal(result.total);

        // 태그 목록 추출 (첫 로드 시에만)
        if (allTags.length === 0) {
          const tags = new Set<string>();
          result.posts.forEach((post) => {
            post.tags.forEach((tag) => tags.add(tag));
          });
          setAllTags(Array.from(tags));
        }
      }
      setIsLoading(false);
    }

    fetchPosts();
  }, [page, selectedTag, allTags.length]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        {/* 헤더 */}
        <section className="bg-navy py-16 px-6 md:px-13">
          <div className="max-w-6xl mx-auto">
            <span className="font-mono text-[10px] font-bold text-teal tracking-[0.28em] uppercase block mb-4">
              Blog / 블로그
            </span>
            <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-black text-white leading-tight">
              스터디코어 블로그
            </h1>
            <p className="mt-4 text-white/50 text-[15px] max-w-xl">
              입시 정보, 학습 팁, 스터디코어 소식을 전해드립니다.
            </p>
          </div>
        </section>

        {/* 태그 필터 */}
        {allTags.length > 0 && (
          <section className="border-b border-rule">
            <div className="max-w-6xl mx-auto px-6 md:px-13 py-4 flex gap-2 overflow-x-auto">
              <button
                onClick={() => {
                  setSelectedTag(undefined);
                  setPage(1);
                }}
                className={`px-4 py-2 text-[13px] font-medium border whitespace-nowrap transition-colors ${
                  !selectedTag
                    ? "bg-navy border-navy text-white"
                    : "bg-white border-rule text-ink hover:border-navy"
                }`}
              >
                전체
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    setPage(1);
                  }}
                  className={`px-4 py-2 text-[13px] font-medium border whitespace-nowrap transition-colors ${
                    selectedTag === tag
                      ? "bg-navy border-navy text-white"
                      : "bg-white border-rule text-ink hover:border-navy"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 블로그 목록 */}
        <section className="px-6 md:px-13 py-12">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-rule bg-white">
                    <Skeleton className="aspect-[16/9] w-full" />
                    <div className="p-5">
                      <Skeleton className="h-5 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted text-[15px]">
                  {selectedTag
                    ? `"${selectedTag}" 태그의 포스트가 없습니다.`
                    : "등록된 포스트가 없습니다."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center border border-rule text-ink hover:border-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 text-[14px] font-medium border transition-colors ${
                      page === i + 1
                        ? "bg-navy border-navy text-white"
                        : "border-rule text-ink hover:border-navy"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 flex items-center justify-center border border-rule text-ink hover:border-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function BlogCard({ post }: { post: BlogPostWithAuthor }) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="border border-rule bg-white overflow-hidden hover:border-navy transition-colors">
        {/* 썸네일 */}
        <div className="aspect-[16/9] relative bg-stone overflow-hidden">
          {post.thumbnail_url ? (
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-muted text-[13px]">No Image</span>
            </div>
          )}
        </div>

        {/* 내용 */}
        <div className="p-5">
          {/* 태그 */}
          {post.tags.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-teal"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 제목 */}
          <h2 className="text-[17px] font-bold text-ink leading-snug line-clamp-2 group-hover:text-navy transition-colors">
            {post.title}
          </h2>

          {/* 요약 */}
          {post.excerpt && (
            <p className="mt-2 text-[14px] text-muted line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* 날짜 */}
          <div className="mt-4 flex items-center gap-2 text-[12px] text-muted">
            <Calendar size={12} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
