"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { BaseModal } from "@/components/common";

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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      ariaLabel={title}
      className="border border-rule p-6"
    >
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
    </BaseModal>
  );
}
