"use client";

import { cn } from "@/lib/utils";
import type { UserStatusType } from "@/domains/user/model";

interface StatusBadgeProps {
  status: UserStatusType;
  size?: "sm" | "md";
  labels?: Partial<Record<UserStatusType, string>>;
}

const statusConfig: Record<
  UserStatusType,
  { label: string; className: string }
> = {
  pending: {
    label: "승인 대기",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  active: {
    label: "활성",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  inactive: {
    label: "비활성",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export function StatusBadge({ status, size = "md", labels }: StatusBadgeProps) {
  const config = statusConfig[status];
  const label = labels?.[status] || config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center border font-medium",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      )}
    >
      {label}
    </span>
  );
}

// 질문 상태 뱃지
type QuestionStatus = "pending" | "answered";

interface QuestionStatusBadgeProps {
  status: QuestionStatus;
  size?: "sm" | "md";
}

const questionStatusConfig: Record<
  QuestionStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "답변 대기",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  answered: {
    label: "답변 완료",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

export function QuestionStatusBadge({
  status,
  size = "md",
}: QuestionStatusBadgeProps) {
  const config = questionStatusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center border font-medium",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      )}
    >
      {config.label}
    </span>
  );
}
