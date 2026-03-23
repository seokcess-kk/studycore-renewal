"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Nav, Footer, Button } from "@/components/common";
import { useToast } from "@/components/common";
import {
  consultationFormSchema,
  type ConsultationFormInput,
  type ConsultationApiResponse,
} from "@/domains/consultation/model";
import { CONTACT, CONSULT_TYPES, ROUTES } from "@/lib/constants";
import { CheckCircle } from "lucide-react";

export default function ConsultPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { success, error: showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ConsultationFormInput>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      consultType: undefined,
      message: "",
    },
  });

  const onSubmit = async (data: ConsultationFormInput) => {
    try {
      const response = await fetch("/api/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ConsultationApiResponse = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        success("상담 신청이 완료되었습니다!");
        reset();
      } else {
        showError(result.error || "상담 신청에 실패했습니다.");
      }
    } catch {
      showError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Nav />
        <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center px-6 max-w-md">
            <div className="w-16 h-16 bg-teal/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-teal" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-ink mb-4">
              상담 신청이 완료되었습니다
            </h1>
            <p className="text-muted text-[15px] leading-relaxed mb-8">
              원장님이 확인 후 빠른 시일 내에 연락드리겠습니다.
              <br />
              카카오 채널을 통해 더 빠르게 문의하실 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={CONTACT.kakaoChannel}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] text-[14px] font-bold px-6 py-3"
              >
                카카오 채널 바로가기
              </Link>
              <Link
                href={ROUTES.HOME}
                className="inline-flex items-center justify-center border border-rule text-ink text-[14px] font-medium px-6 py-3 hover:border-navy transition-colors"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        {/* 헤더 */}
        <section className="bg-navy py-16 px-6 md:px-13 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(87,173,177,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(87,173,177,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
          <div className="relative z-10 max-w-2xl">
            <span className="font-mono text-[10px] font-bold text-teal tracking-[0.28em] uppercase block mb-4">
              Consultation / 상담 신청
            </span>
            <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-black text-white leading-tight tracking-[-0.03em]">
              무료 상담 신청
            </h1>
            <p className="mt-4 text-white/60 text-[15px] leading-relaxed">
              입소 상담, 시설 견학, 프로그램 문의 등 무엇이든 편하게
              문의해 주세요.
              <br />
              원장님이 직접 확인하고 연락드립니다.
            </p>
          </div>
        </section>

        {/* 폼 */}
        <section className="py-16 px-6 md:px-13">
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 이름 */}
              <FormField
                label="이름"
                htmlFor="consult-name"
                error={errors.name?.message}
                required
              >
                <input
                  id="consult-name"
                  type="text"
                  placeholder="홍길동"
                  {...register("name")}
                  className={`w-full px-4 py-3 border bg-white text-ink text-[15px] placeholder:text-muted/50 focus:outline-none transition-colors ${
                    errors.name ? "border-red-500 focus:border-red-500" : "border-rule focus:border-navy"
                  }`}
                />
              </FormField>

              {/* 연락처 */}
              <FormField
                label="연락처"
                htmlFor="consult-phone"
                error={errors.phone?.message}
                required
              >
                <input
                  id="consult-phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  {...register("phone")}
                  className={`w-full px-4 py-3 border bg-white text-ink text-[15px] placeholder:text-muted/50 focus:outline-none transition-colors ${
                    errors.phone ? "border-red-500 focus:border-red-500" : "border-rule focus:border-navy"
                  }`}
                />
              </FormField>

              {/* 학교 및 학년 */}
              <FormField
                label="학교 및 학년"
                htmlFor="consult-school"
                error={errors.school?.message}
              >
                <input
                  id="consult-school"
                  type="text"
                  placeholder="예: 광주고 2학년"
                  {...register("school")}
                  className={`w-full px-4 py-3 border bg-white text-ink text-[15px] placeholder:text-muted/50 focus:outline-none transition-colors ${
                    errors.school ? "border-red-500 focus:border-red-500" : "border-rule focus:border-navy"
                  }`}
                />
              </FormField>

              {/* 상담 유형 */}
              <FormField
                label="상담 유형"
                htmlFor="consult-type"
                error={errors.consultType?.message}
                required
              >
                <select
                  id="consult-type"
                  {...register("consultType")}
                  className={`w-full px-4 py-3 border bg-white text-ink text-[15px] focus:outline-none transition-colors appearance-none ${
                    errors.consultType ? "border-red-500 focus:border-red-500" : "border-rule focus:border-navy"
                  }`}
                  defaultValue=""
                >
                  <option value="" disabled>
                    선택해주세요
                  </option>
                  {CONSULT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* 문의 내용 */}
              <FormField label="문의 내용" htmlFor="consult-message" error={errors.message?.message}>
                <textarea
                  id="consult-message"
                  placeholder="궁금하신 점을 자유롭게 적어주세요."
                  rows={4}
                  {...register("message")}
                  className={`w-full px-4 py-3 border bg-white text-ink text-[15px] placeholder:text-muted/50 focus:outline-none transition-colors resize-none ${
                    errors.message ? "border-red-500 focus:border-red-500" : "border-rule focus:border-navy"
                  }`}
                />
              </FormField>

              {/* 제출 버튼 */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
              >
                상담 신청하기
              </Button>

              {/* 안내 문구 */}
              <p className="text-center text-[13px] text-muted">
                상담 신청 시{" "}
                <Link href={ROUTES.PRIVACY} className="underline">
                  개인정보처리방침
                </Link>
                에 동의하게 됩니다.
              </p>
            </form>

            {/* 연락처 정보 */}
            <div className="mt-12 p-6 bg-stone">
              <h3 className="font-bold text-ink mb-4">
                더 빠른 상담을 원하시나요?
              </h3>
              <div className="space-y-2 text-[14px] text-ink/70">
                <p>
                  <span className="font-medium text-ink">전화:</span>{" "}
                  {CONTACT.phone}
                </p>
                <p>
                  <span className="font-medium text-ink">카카오:</span>{" "}
                  <a
                    href={CONTACT.kakaoChannel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal underline"
                  >
                    @스터디코어 1.0
                  </a>
                </p>
                <p>
                  <span className="font-medium text-ink">이메일:</span>{" "}
                  {CONTACT.email}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function FormField({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="flex">
        <span className="text-[13px] font-bold text-ink tracking-tight">{label}</span>
        {required && <span className="text-teal ml-1 text-[13px] font-bold" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-0.5 text-[11.5px] font-mono text-red-500 tracking-tight"
        >
          * {error}
        </motion.p>
      )}
    </div>
  );
}
