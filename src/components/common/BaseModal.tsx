"use client";

import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
} as const;

interface BaseModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 모달 콘텐츠 */
  children: React.ReactNode;
  /** 최대 너비 */
  maxWidth?: keyof typeof maxWidthMap;
  /** 오버레이 배경 (기본: bg-ink/50) */
  overlayClassName?: string;
  /** 모달 본체 추가 className */
  className?: string;
  /** X 닫기 버튼 표시 여부 */
  showCloseButton?: boolean;
  /** 닫기 버튼 색상 (다크 오버레이에선 white, 밝은 배경에선 ink) */
  closeButtonColor?: "white" | "ink";
  /** aria-label */
  ariaLabel?: string;
}

/**
 * 통일된 모달 래퍼 컴포넌트
 *
 * 제공하는 것:
 * - ESC 닫기
 * - 오버레이 클릭 닫기
 * - body scroll lock
 * - 포커스 트랩
 * - Framer Motion 애니메이션
 * - z-50 표준 레이어
 *
 * @example
 * <BaseModal isOpen={open} onClose={close} maxWidth="md">
 *   <div className="p-6">모달 내용</div>
 * </BaseModal>
 */
export function BaseModal({
  isOpen,
  onClose,
  children,
  maxWidth = "md",
  overlayClassName,
  className,
  showCloseButton = true,
  closeButtonColor = "ink",
  ariaLabel,
}: BaseModalProps) {
  const trapRef = useFocusTrap(isOpen);

  // ESC 닫기
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  // body scroll lock + ESC 리스너
  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4",
            overlayClassName || "bg-ink/50"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            className={cn(
              "relative bg-white w-full",
              maxWidthMap[maxWidth],
              className
            )}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  "absolute top-4 right-4 z-10 cursor-pointer transition-opacity duration-200 hover:opacity-70",
                  closeButtonColor === "white" ? "text-white" : "text-ink"
                )}
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
