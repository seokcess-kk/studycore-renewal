"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  /** 현재 페이지 (1-based) */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 변경 콜백 */
  onPageChange: (page: number) => void;
  /**
   * numbered: 페이지 번호 버튼 + 좌우 화살표
   * simple:   이전/다음 텍스트 버튼 + "page / total" 표시
   */
  variant?: "numbered" | "simple";
  /** 추가 className */
  className?: string;
}

/**
 * 통일된 페이지네이션 컴포넌트
 *
 * @example
 * <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
 * <Pagination currentPage={page} totalPages={5} onPageChange={setPage} variant="simple" />
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = "numbered",
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  if (variant === "simple") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="border border-rule px-3 py-1.5 text-body cursor-pointer transition-colors duration-200 hover:border-navy disabled:opacity-40 disabled:cursor-not-allowed"
        >
          이전
        </button>
        <span className="text-secondary text-muted px-2">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="border border-rule px-3 py-1.5 text-body cursor-pointer transition-colors duration-200 hover:border-navy disabled:opacity-40 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    );
  }

  // numbered variant
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-10 h-10 flex items-center justify-center border border-rule cursor-pointer transition-colors duration-200 hover:border-navy disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-muted">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={cn(
              "w-10 h-10 text-body font-medium border cursor-pointer transition-colors duration-200",
              p === currentPage
                ? "bg-navy border-navy text-white"
                : "border-rule text-ink hover:border-navy"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-10 h-10 flex items-center justify-center border border-rule cursor-pointer transition-colors duration-200 hover:border-navy disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/** 페이지 번호 배열 생성 (1, 2, ..., 5, 6, 7, ..., 10) */
function getPageNumbers(
  current: number,
  total: number
): (number | "...")[] {
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
