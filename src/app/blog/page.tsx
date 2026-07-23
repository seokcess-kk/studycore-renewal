import Link from "next/link";
import Image from "next/image";
import { Nav, Footer, SectionHeader } from "@/components/common";
import { createClient } from "@/lib/supabase/server";
import { getPublishedBlogList } from "@/domains/blog/service";
import type { BlogPostWithAuthor } from "@/domains/blog/model";
import { BlogWriteButton } from "@/components/blog/BlogWriteButton";
import { Calendar, Tag, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

interface Props {
  searchParams: Promise<{ tag?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { tag, page: pageParam } = await searchParams;
  const selectedTag = tag?.trim() || undefined;
  const page = Math.max(1, Number(pageParam) || 1);

  const supabase = await createClient();
  const result = await getPublishedBlogList(supabase, {
    tag: selectedTag,
    page,
    pageSize: PAGE_SIZE,
  });

  const posts = result.posts;
  const total = result.total;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // 현재 결과에서 태그 목록 추출
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags))
  );

  // Featured: 첫 번째 글, Side: 2~3번째, Rest: 4번째 이후
  const featured = posts[0];
  const sideCards = posts.slice(1, 3);
  const restCards = posts.slice(3);

  return (
    <>
      <Nav />
      <main className="page-body">
        {/* 헤더 */}
        <section className="bg-navy section-sm px-6 md:px-13">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              label="Blog"
              title="스터디코어 블로그"
              description="입시 정보, 학습 팁, 스터디코어 소식을 전해드립니다."
              theme="dark"
              as="h1"
              actions={<BlogWriteButton />}
            />
          </div>
        </section>

        {/* 태그 필터 */}
        {allTags.length > 0 && (
          <section className="border-b border-rule">
            <div className="max-w-6xl mx-auto px-6 md:px-13 py-4 flex gap-2 overflow-x-auto">
              <Link
                href="/blog"
                className={`px-4 py-2 text-secondary font-medium border whitespace-nowrap transition-colors cursor-pointer ${
                  !selectedTag
                    ? "bg-navy border-navy text-white"
                    : "bg-white border-rule text-ink hover:border-navy"
                }`}
              >
                전체
              </Link>
              {allTags.map((t) => (
                <Link
                  key={t}
                  href={`/blog?tag=${encodeURIComponent(t)}`}
                  className={`px-4 py-2 text-secondary font-medium border whitespace-nowrap transition-colors cursor-pointer ${
                    selectedTag === t
                      ? "bg-navy border-navy text-white"
                      : "bg-white border-rule text-ink hover:border-navy"
                  }`}
                >
                  {t}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 블로그 목록 */}
        <section className="px-6 md:px-13 section-md">
          <div className="max-w-6xl mx-auto">
            {posts.length === 0 ? (
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
                              {featured.tags.slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  className="inline-flex items-center gap-1 text-caption font-medium text-teal"
                                >
                                  <Tag size={10} />
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          <h2 className="text-fluid-h3 font-bold text-ink leading-snug line-clamp-2 group-hover:text-navy transition-colors font-serif">
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
                                  <span className="font-mono text-fluid-h1 font-bold text-rule">
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
              <BlogPagination
                currentPage={page}
                totalPages={totalPages}
                tag={selectedTag}
                className="mt-12"
              />
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
              <span className="font-mono text-fluid-h2 font-bold text-rule">
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

/* ── 링크 기반 페이지네이션 (SSR) ── */
function BlogPagination({
  currentPage,
  totalPages,
  tag,
  className,
}: {
  currentPage: number;
  totalPages: number;
  tag?: string;
  className?: string;
}) {
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  const pages = getPageNumbers(currentPage, totalPages);
  const arrowBase =
    "w-10 h-10 flex items-center justify-center border transition-colors duration-200";

  return (
    <div className={`flex items-center justify-center gap-2 ${className ?? ""}`}>
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          aria-label="이전 페이지"
          className={`${arrowBase} border-rule cursor-pointer hover:border-navy`}
        >
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <span className={`${arrowBase} border-rule opacity-40`}>
          <ChevronLeft size={16} />
        </span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-10 h-10 flex items-center justify-center text-muted"
          >
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(p as number)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`w-10 h-10 flex items-center justify-center text-body font-medium border cursor-pointer transition-colors duration-200 ${
              p === currentPage
                ? "bg-navy border-navy text-white"
                : "border-rule text-ink hover:border-navy"
            }`}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          aria-label="다음 페이지"
          className={`${arrowBase} border-rule cursor-pointer hover:border-navy`}
        >
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span className={`${arrowBase} border-rule opacity-40`}>
          <ChevronRight size={16} />
        </span>
      )}
    </div>
  );
}

/** 페이지 번호 배열 생성 (1, 2, ..., 5, 6, 7, ..., 10) */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...", total);
  } else if (current >= total - 3) {
    pages.push(1, "...");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, "...");
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push("...", total);
  }

  return pages;
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
