"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/common/Button";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import {
  getMenuVisibility,
  getSmsTemplate,
  updateMenuVisibility,
  updateSmsTemplate,
} from "@/domains/settings/service";

const settingsSchema = z.object({
  about: z.boolean(),
  blog: z.boolean(),
  reviews: z.boolean(),
  system: z.boolean(),
  smsTemplate: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      about: false,
      blog: false,
      reviews: false,
      system: true,
      smsTemplate: "",
    },
  });

  const menuVisibility = {
    about: watch("about"),
    blog: watch("blog"),
    reviews: watch("reviews"),
    system: watch("system"),
  };
  const smsTemplate = watch("smsTemplate");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const [visibility, template] = await Promise.all([
          getMenuVisibility(supabase),
          getSmsTemplate(supabase),
        ]);

        reset({
          about: visibility.about,
          blog: visibility.blog,
          reviews: visibility.reviews,
          system: visibility.system,
          smsTemplate: template,
        });
      } catch (error) {
        console.error("설정 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [supabase, reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await Promise.all([
        updateMenuVisibility(supabase, {
          about: data.about,
          blog: data.blog,
          reviews: data.reviews,
          system: data.system,
        }),
        updateSmsTemplate(supabase, data.smsTemplate),
      ]);

      toast({
        variant: "success",
        title: "저장 완료",
        description: "설정이 저장되었습니다.",
      });
    } catch (error) {
      console.error("설정 저장 실패:", error);
      toast({
        variant: "error",
        title: "오류",
        description: "설정 저장에 실패했습니다.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  const menuItems = [
    { key: "about" as const, label: "소개 페이지", path: "/about" },
    { key: "blog" as const, label: "블로그 페이지", path: "/blog" },
    { key: "reviews" as const, label: "후기 페이지", path: "/reviews" },
    { key: "system" as const, label: "운영시스템 페이지", path: "/system" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container-content space-y-6">
      {/* 메뉴 노출 설정 */}
      <div className="border border-rule bg-white p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-ink">
          메뉴 노출 설정
        </h2>
        <p className="mb-4 text-sm text-muted">
          네비게이션 바에 표시할 메뉴를 선택하세요.
        </p>

        <div className="space-y-3">
          {menuItems.map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between border border-rule p-4"
            >
              <div>
                <span className="font-medium text-ink">{item.label}</span>
                <p className="text-sm text-muted">{item.path}</p>
              </div>
              <button
                type="button"
                onClick={() => setValue(item.key, !menuVisibility[item.key])}
                className={`flex h-10 w-20 items-center justify-center border cursor-pointer ${
                  menuVisibility[item.key]
                    ? "border-teal bg-teal text-white"
                    : "border-rule bg-white text-muted"
                }`}
              >
                {menuVisibility[item.key] ? (
                  <>
                    <Eye className="mr-1 h-4 w-4" /> 노출
                  </>
                ) : (
                  <>
                    <EyeOff className="mr-1 h-4 w-4" /> 숨김
                  </>
                )}
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* SMS 템플릿 */}
      <div className="border border-rule bg-white p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-ink">
          상담 신청 SMS 템플릿
        </h2>
        <p className="mb-4 text-sm text-muted">
          상담 신청 시 신청자에게 발송되는 SMS 내용입니다.
        </p>

        <textarea
          value={smsTemplate}
          onChange={(e) => setValue("smsTemplate", e.target.value)}
          rows={6}
          className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
          placeholder="SMS 템플릿을 입력하세요"
        />
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "저장 중..." : "설정 저장"}
        </Button>
      </div>
    </form>
  );
}
