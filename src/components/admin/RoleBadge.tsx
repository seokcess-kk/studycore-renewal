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
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  assistant: {
    label: "조교",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  mentor: {
    label: "멘토",
    className: "bg-teal-100 text-teal-800 border-teal-200",
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
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      )}
    >
      {config.label}
    </span>
  );
}
