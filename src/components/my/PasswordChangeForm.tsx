"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { Button, useToast } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { changePassword } from "@/domains/user/service";
import { changePasswordSchema, type ChangePasswordInput } from "@/domains/user/model";

export function PasswordChangeForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsSubmitting(true);
    const supabase = createClient();
    const result = await changePassword(supabase, data);
    setIsSubmitting(false);

    if (result.success) {
      success("비밀번호가 변경되었습니다.");
      reset();
      setIsOpen(false);
    } else {
      showError(result.error || "비밀번호 변경에 실패했습니다.");
    }
  };

  return (
    <div className="bg-white border border-rule mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-stone/50 transition-colors"
      >
        <span className="font-bold text-ink">비밀번호 변경</span>
        {isOpen ? (
          <ChevronUp size={18} className="text-muted" />
        ) : (
          <ChevronDown size={18} className="text-muted" />
        )}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 pb-4 space-y-4">
          {/* 현재 비밀번호 */}
          <div>
            <label htmlFor="pw-current" className="block text-[13px] text-muted mb-1">
              현재 비밀번호
            </label>
            <div className="relative">
              <input
                id="pw-current"
                type={showCurrent ? "text" : "password"}
                {...register("currentPassword")}
                className="w-full px-3 py-2.5 border border-rule bg-white text-ink text-[14px] focus:border-navy focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-[12px] text-red-500">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label htmlFor="pw-new" className="block text-[13px] text-muted mb-1">
              새 비밀번호
            </label>
            <div className="relative">
              <input
                id="pw-new"
                type={showNew ? "text" : "password"}
                {...register("newPassword")}
                className="w-full px-3 py-2.5 border border-rule bg-white text-ink text-[14px] focus:border-navy focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? "비밀번호 숨기기" : "비밀번호 보기"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-[12px] text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="pw-confirm" className="block text-[13px] text-muted mb-1">
              새 비밀번호 확인
            </label>
            <input
              id="pw-confirm"
              type="password"
              {...register("confirmPassword")}
              className="w-full px-3 py-2.5 border border-rule bg-white text-ink text-[14px] focus:border-navy focus:outline-none"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-[12px] text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isSubmitting}
          >
            비밀번호 변경
          </Button>
        </form>
      )}
    </div>
  );
}
