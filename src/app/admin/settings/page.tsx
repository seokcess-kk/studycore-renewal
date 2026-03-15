"use client";

import { useEffect, useState } from "react";
import { Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/common/Button";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import type { SiteSetting } from "@/domains/settings/model";

export default function AdminSettingsPage() {
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const [_settings, setSettings] = useState<SiteSetting[]>([]);
  void _settings; // 향후 사용 예정
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 로컬 상태
  const [menuVisibility, setMenuVisibility] = useState({
    about: false,
    blog: false,
    reviews: false,
    system: true,
  });
  const [smsTemplate, setSmsTemplate] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*");

        if (error) throw error;

        setSettings(data || []);

        // 로컬 상태 초기화
        const settingsMap = new Map(data?.map((s) => [s.key, s.value]));
        setMenuVisibility({
          about: settingsMap.get("menu_about_visible") === "true",
          blog: settingsMap.get("menu_blog_visible") === "true",
          reviews: settingsMap.get("menu_reviews_visible") === "true",
          system: settingsMap.get("menu_system_visible") !== "false",
        });
        setSmsTemplate(settingsMap.get("sms_consult_template") || "");
      } catch (error) {
        console.error("설정 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [supabase]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = [
        { key: "menu_about_visible", value: menuVisibility.about.toString() },
        { key: "menu_blog_visible", value: menuVisibility.blog.toString() },
        { key: "menu_reviews_visible", value: menuVisibility.reviews.toString() },
        { key: "menu_system_visible", value: menuVisibility.system.toString() },
        { key: "sms_consult_template", value: smsTemplate },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: update.value })
          .eq("key", update.key);

        if (error) throw error;
      }

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
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* 메뉴 노출 설정 */}
      <div className="border border-rule bg-white p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-ink">
          메뉴 노출 설정
        </h2>
        <p className="mb-4 text-sm text-muted">
          네비게이션 바에 표시할 메뉴를 선택하세요.
        </p>

        <div className="space-y-3">
          <label className="flex items-center justify-between border border-rule p-4">
            <div>
              <span className="font-medium text-ink">소개 페이지</span>
              <p className="text-sm text-muted">/about</p>
            </div>
            <button
              onClick={() =>
                setMenuVisibility((prev) => ({ ...prev, about: !prev.about }))
              }
              className={`flex h-10 w-20 items-center justify-center border ${
                menuVisibility.about
                  ? "border-teal bg-teal text-white"
                  : "border-rule bg-white text-muted"
              }`}
            >
              {menuVisibility.about ? (
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

          <label className="flex items-center justify-between border border-rule p-4">
            <div>
              <span className="font-medium text-ink">블로그 페이지</span>
              <p className="text-sm text-muted">/blog</p>
            </div>
            <button
              onClick={() =>
                setMenuVisibility((prev) => ({ ...prev, blog: !prev.blog }))
              }
              className={`flex h-10 w-20 items-center justify-center border ${
                menuVisibility.blog
                  ? "border-teal bg-teal text-white"
                  : "border-rule bg-white text-muted"
              }`}
            >
              {menuVisibility.blog ? (
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

          <label className="flex items-center justify-between border border-rule p-4">
            <div>
              <span className="font-medium text-ink">후기 페이지</span>
              <p className="text-sm text-muted">/reviews</p>
            </div>
            <button
              onClick={() =>
                setMenuVisibility((prev) => ({
                  ...prev,
                  reviews: !prev.reviews,
                }))
              }
              className={`flex h-10 w-20 items-center justify-center border ${
                menuVisibility.reviews
                  ? "border-teal bg-teal text-white"
                  : "border-rule bg-white text-muted"
              }`}
            >
              {menuVisibility.reviews ? (
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

          <label className="flex items-center justify-between border border-rule p-4">
            <div>
              <span className="font-medium text-ink">운영시스템 페이지</span>
              <p className="text-sm text-muted">/system</p>
            </div>
            <button
              onClick={() =>
                setMenuVisibility((prev) => ({ ...prev, system: !prev.system }))
              }
              className={`flex h-10 w-20 items-center justify-center border ${
                menuVisibility.system
                  ? "border-teal bg-teal text-white"
                  : "border-rule bg-white text-muted"
              }`}
            >
              {menuVisibility.system ? (
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
          onChange={(e) => setSmsTemplate(e.target.value)}
          rows={6}
          className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
          placeholder="SMS 템플릿을 입력하세요"
        />
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "저장 중..." : "설정 저장"}
        </Button>
      </div>
    </div>
  );
}
