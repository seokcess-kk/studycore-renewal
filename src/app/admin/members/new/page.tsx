"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/Toast";

const CreateStaffSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  username: z
    .string()
    .min(4, "아이디는 4자 이상이어야 합니다")
    .regex(/^[a-z0-9_]+$/, "영문 소문자, 숫자, 밑줄만 사용 가능합니다"),
  role: z.enum(["assistant", "mentor", "admin"]),
});

type CreateStaffInput = z.infer<typeof CreateStaffSchema>;

export default function AdminMemberNewPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [createdAccount, setCreatedAccount] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<"username" | "password" | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateStaffInput>({
    resolver: zodResolver(CreateStaffSchema),
    defaultValues: {
      role: "assistant",
    },
  });

  const onSubmit = async (data: CreateStaffInput) => {
    try {
      const res = await fetch("/api/admin/create-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          variant: "error",
          title: "오류",
          description: result.error || "계정 생성에 실패했습니다.",
        });
        return;
      }

      setCreatedAccount({
        username: result.username,
        password: result.password,
      });

      toast({
        variant: "success",
        title: "계정 생성 완료",
        description: "아래 정보를 해당 직원에게 전달해주세요.",
      });
    } catch (error) {
      console.error("계정 생성 실패:", error);
      toast({
        variant: "error",
        title: "오류",
        description: "계정 생성에 실패했습니다.",
      });
    }
  };

  const copyToClipboard = async (text: string, field: "username" | "password") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("복사 실패:", error);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* 상단 */}
      <Link
        href="/admin/members"
        className="flex items-center gap-2 text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로
      </Link>

      {createdAccount ? (
        /* 생성 완료 화면 */
        <div className="border border-rule bg-white p-8">
          <h2 className="mb-6 text-center font-serif text-xl font-bold text-ink">
            계정 생성 완료
          </h2>

          <p className="mb-6 text-center text-muted">
            아래 정보를 해당 직원에게 안전하게 전달해주세요.
          </p>

          <div className="space-y-4">
            <div className="border border-rule p-4">
              <div className="mb-1 text-sm text-muted">아이디</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg text-ink">
                  {createdAccount.username}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(createdAccount.username, "username")
                  }
                  className="flex items-center gap-1 text-sm text-teal hover:underline"
                >
                  {copiedField === "username" ? (
                    <>
                      <Check className="h-4 w-4" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      복사
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="border border-rule p-4">
              <div className="mb-1 text-sm text-muted">임시 비밀번호</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg text-ink">
                  {showPassword
                    ? createdAccount.password
                    : "••••••••••••"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted hover:text-ink"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      copyToClipboard(createdAccount.password, "password")
                    }
                    className="flex items-center gap-1 text-sm text-teal hover:underline"
                  >
                    {copiedField === "password" ? (
                      <>
                        <Check className="h-4 w-4" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        복사
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setCreatedAccount(null)}
            >
              다른 계정 생성
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => router.push("/admin/members")}
            >
              완료
            </Button>
          </div>
        </div>
      ) : (
        /* 계정 생성 폼 */
        <div className="border border-rule bg-white p-8">
          <h2 className="mb-6 text-center font-serif text-xl font-bold text-ink">
            스태프 계정 생성
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                이름
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="홍길동"
                className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                아이디
              </label>
              <input
                type="text"
                {...register("username")}
                placeholder="hong_gildong"
                className="w-full border border-rule px-3 py-2 font-mono text-sm focus:border-navy focus:outline-none"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.username.message}
                </p>
              )}
              <p className="mt-1 text-xs text-muted">
                영문 소문자, 숫자, 밑줄만 사용 가능
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                역할
              </label>
              <select
                {...register("role")}
                className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
              >
                <option value="assistant">조교</option>
                <option value="mentor">멘토</option>
                <option value="admin">관리자</option>
              </select>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "생성 중..." : "계정 생성"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
