"use client";

import { cn } from "@/lib/utils";
import type { UserRoleType } from "@/domains/user/model";

interface RoleBadgeProps {
  role: UserRoleType;
  size?: "sm" | "md";
}

const roleConfig: Record<UserRoleType, { label: string; className: string }> = {
  student: {
    label: "재원생",
    className: "bg-teal/10 text-teal-dark border-teal/20",
  },
  assistant: {
    label: "조교",
    className: "bg-navy/10 text-navy border-navy/20",
  },
  mentor: {
    label: "멘토",
    className: "bg-teal text-white border-teal",
  },
  admin: {
    label: "관리자",
    className: "bg-navy text-white border-navy",
  },
};

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <span
      className={cn(
        "inline-flex items-center border font-medium",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-caption" : "px-2.5 py-1 text-body"
      )}
    >
      {config.label}
    </span>
  );
}
