"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/common/Button";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import { useUserStore } from "@/stores/useUserStore";
import { Clock } from "lucide-react";

const RegisterSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  phone: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, "올바른 전화번호 형식이 아닙니다"),
  school: z.string().min(2, "학교 이름을 입력해주세요"),
  grade: z.enum(["1", "2", "3"], { message: "학년을 선택해주세요" }),
  parent_phone: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, "올바른 전화번호 형식이 아닙니다"),
});

type RegisterInput = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setProfile = useUserStore((state) => state.setProfile);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  useEffect(() => {
    const supabase = createBrowserClient();

    const checkAuth = async () => {
      try {
        // Supabase에서 직접 세션 확인
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace("/login");
          return;
        }

        // 프로필 확인
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setProfile(profile);
          if (profile.status === "pending") {
            setIsSubmitted(true);
          } else {
            router.replace("/");
            return;
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, setProfile]);

  const onSubmit = useCallback(async (data: RegisterInput) => {
    const supabase = createBrowserClient();

    try {
      // Supabase 세션에서 직접 user 확인
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        toast({
          variant: "error",
          title: "오류",
          description: "로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
        });
        router.replace("/login");
        return;
      }

      // 전화번호 포맷 정리
      const cleanPhone = data.phone.replace(/-/g, "");
      const cleanParentPhone = data.parent_phone.replace(/-/g, "");

      // 프로필 생성
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          id: authUser.id,
          name: data.name,
          phone: cleanPhone,
          school: data.school,
          grade: parseInt(data.grade),
          parent_phone: cleanParentPhone,
          role: "student",
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // 스토어 업데이트
      setProfile(newProfile);
      setIsSubmitted(true);

      toast({
        variant: "success",
        title: "신청 완료",
        description: "관리자 승인 후 서비스를 이용하실 수 있습니다.",
      });
    } catch (error) {
      console.error("가입 신청 실패:", error);
      toast({
        variant: "error",
        title: "오류",
        description: "가입 신청에 실패했습니다. 다시 시도해주세요.",
      });
    }
  }, [toast, router, setProfile]);

  // 로딩 중
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone">
        <p className="text-muted">로딩 중...</p>
      </div>
    );
  }

  // 승인 대기 화면
  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone px-4">
        <div className="w-full max-w-md border border-rule bg-white p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-yellow-100">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>

          <h1 className="mb-2 font-serif text-2xl font-bold text-ink">
            승인 대기 중
          </h1>

          <p className="mb-6 text-muted">
            가입 신청이 완료되었습니다.
            <br />
            관리자 승인 후 서비스를 이용하실 수 있습니다.
          </p>

          <div className="mb-6 border border-rule bg-stone p-4 text-left">
            <p className="text-sm text-muted">
              승인은 보통 1~2일 내에 처리됩니다.
              <br />
              승인이 완료되면 카카오 알림톡으로 안내드립니다.
            </p>
          </div>

          <Link href="/" className="text-teal hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone px-4">
      <div className="w-full max-w-md border border-rule bg-white p-8">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-ink">
            추가 정보 입력
          </h1>
          <p className="mt-2 text-muted">
            서비스 이용을 위해 추가 정보를 입력해주세요.
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
            {isSubmitting ? "처리 중..." : "가입 신청"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          가입 신청 시{" "}
          <Link href="/terms" className="text-teal hover:underline">
            이용약관
          </Link>{" "}
          및{" "}
          <Link href="/privacy" className="text-teal hover:underline">
            개인정보처리방침
          </Link>
          에 동의하는 것으로 간주합니다.
        </p>
      </div>
    </div>
  );
}
