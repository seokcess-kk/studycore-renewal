import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

/**
 * 스터디코어 버튼 컴포넌트
 *
 * 브랜드 규칙:
 * - border-radius: 0 (globals.css에서 강제)
 * - box-shadow 없음
 *
 * Variants:
 * - primary: teal 배경, navy-dark 텍스트
 * - secondary: navy 배경, white 텍스트
 * - ghost: 투명 배경, ink 텍스트, rule 테두리
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold tracking-cta border-[1.5px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-teal border-teal text-navy-dark hover:bg-transparent hover:text-teal",
      secondary:
        "bg-navy border-navy text-white hover:bg-transparent hover:text-navy",
      ghost:
        "bg-transparent border-rule text-ink hover:border-navy hover:text-navy",
    };

    const sizes = {
      sm: "px-4 py-2 text-small",
      md: "px-6 py-3 text-secondary",
      lg: "px-8 py-4 text-body",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner />
            로딩 중...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
