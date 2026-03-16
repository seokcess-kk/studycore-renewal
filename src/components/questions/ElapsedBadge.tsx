"use client";

import { Clock, AlertTriangle } from "lucide-react";

type Urgency = "normal" | "warning" | "urgent";

function getElapsed(createdAt: string): { label: string; urgency: Urgency } {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  let label: string;
  if (minutes < 1) label = "방금 전";
  else if (minutes < 60) label = `${minutes}분 전`;
  else if (hours < 24) label = `${hours}시간 전`;
  else label = `${days}일 전`;

  let urgency: Urgency = "normal";
  if (hours >= 24) urgency = "urgent";
  else if (hours >= 1) urgency = "warning";

  return { label, urgency };
}

const urgencyStyles = {
  normal: "text-muted",
  warning: "text-orange-500",
  urgent: "text-red-500",
};

interface ElapsedBadgeProps {
  createdAt: string;
  isPending?: boolean;
}

export function ElapsedBadge({ createdAt, isPending }: ElapsedBadgeProps) {
  const { label, urgency } = getElapsed(createdAt);
  const style = isPending ? urgencyStyles[urgency] : "text-muted";

  return (
    <span className={`inline-flex items-center gap-1 text-[12px] ${style}`}>
      {isPending && urgency === "urgent" ? (
        <AlertTriangle size={11} />
      ) : (
        <Clock size={11} />
      )}
      {label}
    </span>
  );
}

/** 카드 좌측 border 색상 (스태프 목록용) */
export function getUrgencyBorderClass(createdAt: string, isPending: boolean): string {
  if (!isPending) return "";
  const { urgency } = getElapsed(createdAt);
  if (urgency === "urgent") return "border-l-2 border-l-red-400";
  if (urgency === "warning") return "border-l-2 border-l-orange-400";
  return "";
}
