"use client";

import { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/common/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  message?: string; // 별칭
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  confirmVariant?: "danger" | "warning" | "default"; // 별칭
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  message,
  confirmText = "확인",
  cancelText = "취소",
  variant = "default",
  confirmVariant,
  isLoading = false,
}: ConfirmModalProps) {
  const displayMessage = description || message || "";
  const displayVariant = confirmVariant || variant;
  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative z-10 w-full max-w-md border border-rule bg-white p-6">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 아이콘 */}
        {displayVariant !== "default" && (
          <div className="mb-4 flex justify-center">
            <div
              className={
                displayVariant === "danger"
                  ? "flex h-12 w-12 items-center justify-center bg-red-100"
                  : "flex h-12 w-12 items-center justify-center bg-yellow-100"
              }
            >
              <AlertTriangle
                className={
                  displayVariant === "danger"
                    ? "h-6 w-6 text-red-600"
                    : "h-6 w-6 text-yellow-600"
                }
              />
            </div>
          </div>
        )}

        {/* 타이틀 */}
        <h2 className="mb-2 text-center font-serif text-xl font-bold text-ink">
          {title}
        </h2>

        {/* 설명 */}
        <p className="mb-6 text-center text-muted">{displayMessage}</p>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={displayVariant === "danger" ? "primary" : "secondary"}
            className={
              displayVariant === "danger"
                ? "flex-1 bg-red-600 hover:bg-red-700"
                : "flex-1"
            }
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
