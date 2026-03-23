"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/common/Button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import { useUserStore } from "@/stores/useUserStore";
import { studentRegisterSchema, type StudentRegisterInput } from "@/domains/user/model";
import { getCurrentProfile } from "@/domains/user/service";
import { logger } from "@/lib/logger";
import { ROUTES } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setProfile = useUserStore((state) => state.setProfile);

  const [isChecking, setIsChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<StudentRegisterInput>({
    resolver: zodResolver(studentRegisterSchema),
  });

  useEffect(() => {
    const supabase = createClient();

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace(ROUTES.LOGIN);
          return;
        }

        setUserId(session.user.id);

        const result = await getCurrentProfile(supabase);

        if (result.success && result.profile) {
          setProfile(result.profile);

          // 이미 정보 입력 완료된 사용자 → 홈으로
          if (result.profile.phone) {
            router.replace(ROUTES.HOME);
            return;
          }

          // pending 상태 → 승인 대기 페이지로
          if (result.profile.status === "pending") {
            router.replace("/pending-approval");
            return;
          }

          // 카카오 이름 미리 세팅
          if (result.profile.name && result.profile.name !== "미입력") {
            setUserName(result.profile.name);
            setValue("name", result.profile.name);
          }
        } else {
          // 프로필 없음 (트리거 실패 등 예외) → 승인 대기
          router.replace("/pending-approval");
          return;
        }
      } catch (error) {
        logger.exception(error, "RegisterPage.checkAuth");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, setProfile, setValue]);

  const onSubmit = useCallback(async (data: StudentRegisterInput) => {
    if (!userId) {
      toast({
        variant: "error",
        title: "오류",
        description: "로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
      });
      router.replace(ROUTES.LOGIN);
      return;
    }

    const supabase = createClient();

    try {
      // 기존 프로필 업데이트 (트리거로 이미 생성됨)
      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          phone: data.phone,
          school: data.school,
          grade: parseInt(data.grade),
          parent_phone: data.parent_phone,
        })
        .eq("id", userId);

      if (error) throw error;

      // 스토어 업데이트
      const result = await getCurrentProfile(supabase);
      if (result.success && result.profile) {
        setProfile(result.profile);
      }

      toast({
        variant: "success",
        title: "정보 입력 완료",
        description: "환영합니다! 이제 서비스를 이용하실 수 있습니다.",
      });

      router.replace(ROUTES.HOME);
    } catch (error) {
      logger.exception(error, "RegisterPage.onSubmit");
      toast({
        variant: "error",
        title: "오류",
        description: error instanceof Error ? error.message : "정보 저장에 실패했습니다.",
      });
    }
  }, [userId, toast, router, setProfile]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone">
        <p className="text-muted">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone px-4">
      <div className="w-full max-w-md mx-auto border border-rule bg-white p-8">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-ink">
            추가 정보 입력
          </h1>
          <p className="mt-2 text-muted">
            {userName ? `${userName}님, ` : ""}서비스 이용을 위해 추가 정보를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="홍길동"
              className="w-full border border-rule px-4 py-3 focus:border-navy focus:outline-none"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* 전화번호 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register("phone")}
              placeholder="010-1234-5678"
              className="w-full border border-rule px-4 py-3 focus:border-navy focus:outline-none"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* 학교 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              학교 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("school")}
              placeholder="OO고등학교"
              className="w-full border border-rule px-4 py-3 focus:border-navy focus:outline-none"
            />
            {errors.school && (
              <p className="mt-1 text-xs text-red-500">{errors.school.message}</p>
            )}
          </div>

          {/* 학년 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              학년 <span className="text-red-500">*</span>
            </label>
            <select
              {...register("grade")}
              className="w-full border border-rule px-4 py-3 focus:border-navy focus:outline-none"
            >
              <option value="">선택해주세요</option>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
            </select>
            {errors.grade && (
              <p className="mt-1 text-xs text-red-500">{errors.grade.message}</p>
            )}
          </div>

          {/* 학부모 연락처 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              학부모 연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register("parent_phone")}
              placeholder="010-1234-5678"
              className="w-full border border-rule px-4 py-3 focus:border-navy focus:outline-none"
            />
            {errors.parent_phone && (
              <p className="mt-1 text-xs text-red-500">
                {errors.parent_phone.message}
              </p>
            )}
            <p className="mt-1 text-xs text-muted">
              알림톡 발송에 사용됩니다.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="mt-6 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "정보 입력 완료"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          가입 시{" "}
          <Link href={ROUTES.TERMS} className="text-teal hover:underline">
            이용약관
          </Link>{" "}
          및{" "}
          <Link href={ROUTES.PRIVACY} className="text-teal hover:underline">
            개인정보처리방침
          </Link>
          에 동의하는 것으로 간주합니다.
        </p>
      </div>
    </div>
  );
}
