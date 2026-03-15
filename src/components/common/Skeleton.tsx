/**
 * 스켈레톤 로딩 컴포넌트
 *
 * 콘텐츠 로딩 중 플레이스홀더로 사용
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-rule/50 ${className}`}
      aria-hidden="true"
    />
  );
}

/** 텍스트 라인 스켈레톤 */
export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/** 카드 스켈레톤 */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`p-6 border border-rule bg-white ${className}`}>
      <Skeleton className="h-6 w-1/3 mb-4" />
      <SkeletonText lines={3} />
    </div>
  );
}

/** 페이지 헤더 스켈레톤 */
export function SkeletonPageHeader() {
  return (
    <div className="bg-stone py-16 px-6 md:px-13 border-b border-rule">
      <div className="max-w-3xl">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}

/** 폼 스켈레톤 */
export function SkeletonForm() {
  return (
    <div className="space-y-6">
      {/* 입력 필드 4개 */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
      {/* 버튼 */}
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

/** 리스트 아이템 스켈레톤 */
export function SkeletonListItem() {
  return (
    <div className="flex gap-4 p-4 border border-rule bg-white">
      <Skeleton className="w-1 h-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-5 w-1/3 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
