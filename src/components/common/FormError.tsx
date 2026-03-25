import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

/**
 * 폼 에러 메시지 컴포넌트
 *
 * 표준: mt-1 text-small text-red-500
 * message가 없으면 렌더링하지 않음
 */
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;
  return (
    <p className={cn("mt-1 text-small text-red-500", className)}>
      {message}
    </p>
  );
}
