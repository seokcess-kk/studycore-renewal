"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import { Button } from "@/components/common";
import { useUserStore } from "@/stores/useUserStore";

/**
 * 후기 목록의 재원생 전용 "후기 작성" 버튼.
 * /reviews를 Server Component로 유지하기 위해 활성 재원생 판별(store) UI만 분리한 클라이언트 아일랜드.
 */
export function ReviewWriteButton() {
  const isActive = useUserStore((state) => state.isActive);

  if (!isActive) return null;

  return (
    <Link href="/reviews/write">
      <Button variant="primary" size="sm">
        <PenLine size={14} />
        후기 작성
      </Button>
    </Link>
  );
}
