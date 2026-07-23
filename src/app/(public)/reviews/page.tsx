import Link from "next/link";
import Image from "next/image";
import { Nav, Footer } from "@/components/common";
import { createClient } from "@/lib/supabase/server";
import { getReviews, getReviewStats } from "@/domains/review/service";
import {
  type Review,
  type ReviewCategoryValue,
  CATEGORY_LABELS,
} from "@/domains/review/model";
import { ReviewWriteButton } from "@/components/review/ReviewWriteButton";
import { Star, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";

const LIMIT = 10;
const VALID_CATEGORIES: ReviewCategoryValue[] = ["student", "parent", "alumni"];

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function ReviewsPage({ searchParams }: Props) {
  const { category: categoryParam, page: pageParam } = await searchParams;
  const category = VALID_CATEGORIES.includes(
    categoryParam as ReviewCategoryValue
  )
    ? (categoryParam as ReviewCategoryValue)
    : undefined;
  const page = Math.max(1, Number(pageParam) || 1);

  const supabase = await createClient();
  const [reviewsResult, statsResult] = await Promise.all([
    getReviews(supabase, { category, page, limit: LIMIT }),
    getReviewStats(supabase),
  ]);

  const reviews = reviewsResult.reviews;
  const total = reviewsResult.total;
  const stats = statsResult.stats ?? null;
  const totalPages = Math.ceil(total / LIMIT);

  const categoryHref = (cat?: ReviewCategoryValue) =>
    cat ? `/reviews?category=${cat}` : "/reviews";

  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `/reviews?${qs}` : "/reviews";
  };

  return (
    <>
      <Nav />
      <main className="page-body bg-stone min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <span className="text-teal text-secondary font-medium tracking-wider uppercase">
              Reviews
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink mt-2">
              수강 후기
            </h1>
            <p className="text-muted text-body mt-3">
              스터디코어를 경험한 학생과 학부모님의 진솔한 이야기
            </p>
          </div>

          {/* 통계 */}
          {stats && stats.total > 0 && (
            <div className="bg-white border border-rule card-md mb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-ink">
                      {stats.averageRating}
                    </div>
                    <div className="flex justify-center mt-1">
                      <StarRating rating={Math.round(stats.averageRating)} />
                    </div>
                  </div>
                  <div className="text-secondary text-muted">
                    총 {stats.total}개의 리뷰
                  </div>
                </div>

                {/* 분포 */}
                <div className="flex gap-4">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.distribution[rating] || 0;
                    const percentage =
                      stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={rating} className="text-center">
                        <div className="text-caption text-muted mb-1">
                          {rating}점
                        </div>
                        <div className="w-8 h-16 bg-stone relative">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-teal transition-all"
                            style={{ height: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-caption text-muted mt-1">
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 필터 + 작성 버튼 */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex gap-2">
              <Link
                href={categoryHref()}
                className={`px-3 py-1.5 text-secondary font-medium border transition-colors ${
                  !category
                    ? "bg-navy text-white border-navy"
                    : "bg-white text-muted border-rule hover:border-navy"
                }`}
              >
                전체
              </Link>
              {VALID_CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={categoryHref(cat)}
                  className={`px-3 py-1.5 text-secondary font-medium border transition-colors ${
                    category === cat
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-muted border-rule hover:border-navy"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </Link>
              ))}
            </div>

            <ReviewWriteButton />
          </div>

          {/* 리뷰 목록 */}
          {reviews.length === 0 ? (
            <div className="bg-white border border-rule p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-rule mb-4" />
              <p className="text-muted text-body">
                아직 등록된 후기가 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="border border-rule px-3 py-1.5 text-body cursor-pointer transition-colors duration-200 hover:border-navy inline-flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  이전
                </Link>
              ) : (
                <span className="border border-rule px-3 py-1.5 text-body opacity-40 inline-flex items-center gap-1">
                  <ChevronLeft size={14} />
                  이전
                </span>
              )}
              <span className="text-secondary text-muted px-2">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  className="border border-rule px-3 py-1.5 text-body cursor-pointer transition-colors duration-200 hover:border-navy inline-flex items-center gap-1"
                >
                  다음
                  <ChevronRight size={14} />
                </Link>
              ) : (
                <span className="border border-rule px-3 py-1.5 text-body opacity-40 inline-flex items-center gap-1">
                  다음
                  <ChevronRight size={14} />
                </span>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ── 별점 ── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-rule"
          }
        />
      ))}
    </div>
  );
}

/* ── 리뷰 카드 ── */
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white border border-rule card-md">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink text-reading">
              {review.author_name}
            </span>
            <span className="px-2 py-0.5 bg-stone text-caption text-muted">
              {CATEGORY_LABELS[review.category]}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={review.rating} />
            <span className="text-small text-muted">
              {new Date(review.created_at).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </div>
        {review.is_featured && (
          <span className="px-2 py-0.5 bg-teal/10 text-teal text-caption font-medium">
            추천
          </span>
        )}
      </div>

      <p className="text-body text-ink leading-prose whitespace-pre-wrap">
        {review.content}
      </p>

      {/* 이미지 갤러리 */}
      {review.images && review.images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {review.images.map((imageUrl, idx) => (
            <a
              key={idx}
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square bg-stone border border-rule overflow-hidden hover:opacity-90 transition-opacity"
            >
              <Image
                src={imageUrl}
                alt={`리뷰 이미지 ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 200px"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
