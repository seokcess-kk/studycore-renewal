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
    className: "bg-stone text-ink/70 border-rule",
  },
  active: {
    label: "활성",
    className: "bg-teal/10 text-teal-dark border-teal/20",
  },
  inactive: {
    label: "비활성",
    className: "bg-stone text-muted border-rule",
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
    className: "bg-navy/10 text-navy border-navy/20",
  },
  answered: {
    label: "답변 완료",
    className: "bg-teal/10 text-teal-dark border-teal/20",
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
