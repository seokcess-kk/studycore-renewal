"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Nav, Footer, Skeleton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getPublishedBlogList } from "@/domains/blog/service";
import type { BlogPostWithAuthor } from "@/domains/blog/model";
import { Calendar, Tag, ChevronLeft, ChevronRight, PenLine } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { ROUTES } from "@/lib/constants";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [allTags, setAllTags] = useState<string[]>([]);
  const canAccessAdmin = useUserStore((state) => state.canAccessAdmin);
  const pageSize = 10;

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

  // Featured: 첫 번째 글, Side: 2~3번째, Rest: 4번째 이후
  const featured = posts[0];
  const sideCards = posts.slice(1, 3);
  const restCards = posts.slice(3);

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        {/* 헤더 */}
        <section className="bg-navy py-16 px-6 md:px-13">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="font-mono text-label font-bold text-teal tracking-label uppercase block mb-4">
                Blog
              </span>
              <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-black text-white leading-tight">
                스터디코어 블로그
              </h1>
              <p className="mt-3 text-white/40 text-reading max-w-md">
                입시 정보, 학습 팁, 스터디코어 소식을 전해드립니다.
              </p>
            </div>
            {canAccessAdmin && (
              <Link
                href={`${ROUTES.ADMIN_BLOG}/new`}
                className="inline-flex items-center gap-2 px-5 py-2.5 border-[1.5px] border-teal text-teal text-secondary font-bold tracking-cta hover:bg-teal hover:text-navy-dark transition-colors duration-200 cursor-pointer self-start md:self-auto"
              >
                <PenLine size={14} />
                글쓰기
              </Link>
            )}
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
                className={`px-4 py-2 text-secondary font-medium border whitespace-nowrap transition-colors cursor-pointer ${
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
                  className={`px-4 py-2 text-secondary font-medium border whitespace-nowrap transition-colors cursor-pointer ${
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
              <BlogSkeleton />
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted text-reading">
                  {selectedTag
                    ? `"${selectedTag}" 태그의 포스트가 없습니다.`
                    : "등록된 포스트가 없습니다."}
                </p>
              </div>
            ) : (
              <>
                {/* Featured + Side 영역 */}
                <div className={`grid grid-cols-1 gap-6 mb-6 ${sideCards.length > 0 ? "lg:grid-cols-5" : ""}`}>
                  {/* Featured (큰 카드) */}
                  {featured && (
                    <Link
                      href={`/blog/${featured.slug}`}
                      className={`group block ${sideCards.length > 0 ? "lg:col-span-3" : ""}`}
                    >
                      <article className="border border-rule bg-white overflow-hidden hover:border-navy transition-colors h-full flex flex-col">
                        <div className="aspect-[16/9] relative bg-stone overflow-hidden">
                          {featured.thumbnail_url ? (
                            <Image
                              src={featured.thumbnail_url}
                              alt={featured.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              priority
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-muted text-secondary">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-6 md:p-8 flex-1 flex flex-col">
                          {featured.tags.length > 0 && (
                            <div className="flex gap-2 mb-3 flex-wrap">
                              {featured.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 text-caption font-medium text-teal"
                                >
                                  <Tag size={10} />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <h2 className="text-[22px] md:text-[26px] font-bold text-ink leading-snug line-clamp-2 group-hover:text-navy transition-colors font-serif">
                            {featured.title}
                          </h2>
                          {featured.excerpt && (
                            <p className="mt-3 text-reading text-muted line-clamp-3 flex-1">
                              {featured.excerpt}
                            </p>
                          )}
                          <div className="mt-4 flex items-center gap-2 text-small text-muted">
                            <Calendar size={12} />
                            <span>{formatDate(featured.published_at)}</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  )}

                  {/* Side 카드 (2~3번째) */}
                  {sideCards.length > 0 && (
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      {sideCards.map((post, i) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="group block flex-1"
                        >
                          <article className="border border-rule bg-white overflow-hidden hover:border-navy transition-colors h-full flex flex-col">
                            <div className="aspect-[2/1] relative bg-stone overflow-hidden">
                              {post.thumbnail_url ? (
                                <Image
                                  src={post.thumbnail_url}
                                  alt={post.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="font-mono text-[48px] font-bold text-rule">
                                    {String(i + 2).padStart(2, "0")}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                              {post.tags.length > 0 && (
                                <span className="text-caption font-medium text-teal mb-2 inline-flex items-center gap-1">
                                  <Tag size={10} />
                                  {post.tags[0]}
                                </span>
                              )}
                              <h3 className="text-subhead font-bold text-ink leading-snug line-clamp-2 group-hover:text-navy transition-colors">
                                {post.title}
                              </h3>
                              <div className="mt-auto pt-3 flex items-center gap-2 text-small text-muted">
                                <Calendar size={12} />
                                <span>{formatDate(post.published_at)}</span>
                              </div>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* 나머지 카드 그리드 */}
                {restCards.length > 0 && (
                  <>
                    <div className="border-t border-rule pt-8 mb-6">
                      <span className="font-mono text-label font-bold text-muted tracking-label uppercase">
                        More Posts
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {restCards.map((post) => (
                        <CompactCard key={post.id} post={post} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center border border-rule text-ink hover:border-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 text-body font-medium border transition-colors cursor-pointer ${
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
                  className="w-10 h-10 flex items-center justify-center border border-rule text-ink hover:border-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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

/* ── Compact Card (4번째 이후) ── */
function CompactCard({ post }: { post: BlogPostWithAuthor }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="border border-rule bg-white overflow-hidden hover:border-navy transition-colors h-full flex flex-col">
        <div className="aspect-[16/10] relative bg-stone overflow-hidden">
          {post.thumbnail_url ? (
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-stone">
              <span className="font-mono text-[32px] font-bold text-rule">
                {post.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {post.tags.length > 0 && (
            <span className="text-label font-medium text-teal mb-1.5 inline-flex items-center gap-1">
              <Tag size={9} />
              {post.tags[0]}
            </span>
          )}
          <h3 className="text-reading font-bold text-ink leading-snug line-clamp-2 group-hover:text-navy transition-colors">
            {post.title}
          </h3>
          <div className="mt-auto pt-3 flex items-center gap-2 text-caption text-muted">
            <Calendar size={11} />
            <span>{formatDate(post.published_at)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ── 스켈레톤 ── */
function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 border border-rule bg-white">
        <Skeleton className="aspect-[16/9] w-full" />
        <div className="p-8">
          <Skeleton className="h-4 w-20 mb-4" />
          <Skeleton className="h-7 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="lg:col-span-2 flex flex-col gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="flex-1 border border-rule bg-white">
            <Skeleton className="aspect-[2/1] w-full" />
            <div className="p-5">
              <Skeleton className="h-3 w-16 mb-3" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 날짜 포맷 ── */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
