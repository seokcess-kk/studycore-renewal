"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Nav, Footer, Button, Skeleton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { getReviews, getReviewStats } from "@/domains/review/service";
import {
  type Review,
  type ReviewStats,
  type ReviewCategoryValue,
  CATEGORY_LABELS,
} from "@/domains/review/model";
import { useUserStore } from "@/stores/useUserStore";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  PenLine,
} from "lucide-react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<ReviewCategoryValue | "">("");
  const [isLoading, setIsLoading] = useState(true);

  const { isActive } = useUserStore();

  const LIMIT = 10;
  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const supabase = createClient();

      // 리뷰 목록
      const reviewsResult = await getReviews(supabase, {
        category: category || undefined,
        page,
        limit: LIMIT,
      });

      if (reviewsResult.success) {
        setReviews(reviewsResult.reviews);
        setTotal(reviewsResult.total);
      }

      // 통계 (첫 로드 시만)
      if (!stats) {
        const statsResult = await getReviewStats(supabase);
        if (statsResult.success && statsResult.stats) {
          setStats(statsResult.stats);
        }
      }

      setIsLoading(false);
    }

    fetchData();
  }, [page, category, stats]);

  // 별점 렌더링
  const renderStars = (rating: number) => {
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
  };

  return (
    <>
      <Nav />
      <main className="page-body bg-stone min-h-screen">
        <div className="container-wide px-6">
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
            <div className="bg-white border border-rule p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-ink">
                      {stats.averageRating}
                    </div>
                    <div className="flex justify-center mt-1">
                      {renderStars(Math.round(stats.averageRating))}
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCategory("");
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-secondary font-medium border transition-colors ${
                  category === ""
                    ? "bg-navy text-white border-navy"
                    : "bg-white text-muted border-rule hover:border-navy"
                }`}
              >
                전체
              </button>
              {(["student", "parent", "alumni"] as ReviewCategoryValue[]).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 text-secondary font-medium border transition-colors ${
                      category === cat
                        ? "bg-navy text-white border-navy"
                        : "bg-white text-muted border-rule hover:border-navy"
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                )
              )}
            </div>

            {isActive && (
              <Link href="/reviews/write">
                <Button variant="primary" size="sm">
                  <PenLine size={14} />
                  후기 작성
                </Button>
              </Link>
            )}
          </div>

          {/* 리뷰 목록 */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white border border-rule p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-rule mb-4" />
              <p className="text-muted text-body">
                아직 등록된 후기가 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-rule p-6"
                >
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
                        {renderStars(review.rating)}
                        <span className="text-small text-muted">
                          {new Date(review.created_at).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                      </div>
                    </div>
                    {review.is_featured && (
                      <span className="px-2 py-0.5 bg-teal/10 text-teal text-caption font-medium">
                        추천
                      </span>
                    )}
                  </div>

                  <p className="text-body text-ink leading-relaxed whitespace-pre-wrap">
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
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-rule bg-white hover:bg-stone disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-4 text-secondary">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-rule bg-white hover:bg-stone disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
