import { cn } from "@/lib/utils";

/**
 * 범용 배지 variant
 *
 * 디자인 시스템 내 색상:
 * - success: teal 계열 (활성, 완료, 답변 완료)
 * - warning: orange 계열 (주의, 경과 시간)
 * - error:   red 계열 (긴급, 비활성, 에러)
 * - info:    navy 계열 (정보, 연락함, 대기)
 * - neutral: stone 계열 (기본, 비활성, 임시저장)
 * - teal-solid: teal 배경 실색 (멘토, 강조 카운트)
 * - navy-solid: navy 배경 실색 (관리자)
 */
export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "teal-solid"
  | "navy-solid";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-[var(--color-status-success-bg)] text-[var(--color-status-success)] border-[var(--color-status-success-border)]",
  warning: "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning)] border-[var(--color-status-warning-border)]",
  error: "bg-[var(--color-status-error-bg)] text-[var(--color-status-error)] border-[var(--color-status-error-border)]",
  info: "bg-[var(--color-status-info-bg)] text-[var(--color-status-info)] border-[var(--color-status-info-border)]",
  neutral: "bg-stone text-muted border-rule",
  "teal-solid": "bg-teal text-white border-teal",
  "navy-solid": "bg-navy text-white border-navy",
};

interface BadgeProps {
  /** 색상 variant */
  variant?: BadgeVariant;
  /** 크기 */
  size?: "sm" | "md";
  /** 추가 className */
  className?: string;
  children: React.ReactNode;
}

/**
 * 범용 배지 컴포넌트
 *
 * StatusBadge, RoleBadge, QuestionStatusBadge는
 * 도메인 특화 배지로 유지합니다.
 * 이 컴포넌트는 인라인으로 하드코딩하던 배지를 대체합니다.
 *
 * @example
 * <Badge variant="warning">신규</Badge>
 * <Badge variant="success" size="sm">발행됨</Badge>
 * <Badge variant="error">긴급</Badge>
 */
export function Badge({
  variant = "neutral",
  size = "sm",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border font-medium",
        variantStyles[variant],
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className
      )}
    >
      {children}
    </span>
  );
}
