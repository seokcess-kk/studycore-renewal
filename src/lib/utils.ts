import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜를 상대적 시간으로 변환 (예: "3분 전", "2시간 전")
 */
export function formatDistanceToNow(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) {
    return "방금 전";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}주 전`;
  } else if (diffMonths < 12) {
    return `${diffMonths}개월 전`;
  } else {
    return target.toLocaleDateString("ko-KR");
  }
}

/**
 * 날짜를 포맷팅 (예: "2025년 3월 15일")
 */
export function formatDate(date: string | Date): string {
  const target = new Date(date);
  return target.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 날짜를 짧은 포맷으로 (예: "2025.03.15")
 */
export function formatDateShort(date: string | Date): string {
  const target = new Date(date);
  return target.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\. /g, ".").replace(".", "");
}

/**
 * 날짜와 시간을 포맷팅 (예: "25.03.15 14:30")
 */
export function formatDateTime(date: string | Date): string {
  const target = new Date(date);
  const yy = String(target.getFullYear()).slice(-2);
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const dd = String(target.getDate()).padStart(2, "0");
  const hh = String(target.getHours()).padStart(2, "0");
  const min = String(target.getMinutes()).padStart(2, "0");
  return `${yy}.${mm}.${dd} ${hh}:${min}`;
}

