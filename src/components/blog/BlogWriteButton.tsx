"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { ROUTES } from "@/lib/constants";

/**
 * 블로그 목록/상세의 어드민 전용 "글쓰기" 버튼.
 * 목록 페이지를 Server Component로 유지하기 위해 권한 의존 UI만 분리한 클라이언트 아일랜드.
 */
export function BlogWriteButton() {
  const canAccessAdmin = useUserStore((state) => state.canAccessAdmin);

  if (!canAccessAdmin) return null;

  return (
    <Link
      href={`${ROUTES.ADMIN_BLOG}/new`}
      className="inline-flex items-center gap-2 px-5 py-2.5 border-[1.5px] border-teal text-teal text-secondary font-bold tracking-cta hover:bg-teal hover:text-navy-dark transition-colors duration-200 cursor-pointer"
    >
      <PenLine size={14} />
      글쓰기
    </Link>
  );
}
