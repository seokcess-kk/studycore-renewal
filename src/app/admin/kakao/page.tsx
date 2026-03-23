"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  Send,
  Users,
  UserCheck,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  History,
} from "lucide-react";
import { Button, useToast } from "@/components/common";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { createClient } from "@/lib/supabase/client";
import {
  getActiveStudentAndParentContacts,
  generatePreview,
} from "@/domains/notification/service";
import { type NotificationTarget } from "@/domains/notification/model";

const kakaoMessageSchema = z.object({
  message: z.string().min(1, "메시지를 입력해주세요").max(1000, "1000자 이내로 작성해주세요"),
});

type KakaoMessageForm = z.infer<typeof kakaoMessageSchema>;

type TargetType = "all" | "selected" | "parents";

export default function AdminKakaoPage() {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset: resetForm,
    formState: { errors },
  } = useForm<KakaoMessageForm>({
    resolver: zodResolver(kakaoMessageSchema),
    defaultValues: { message: "" },
  });

  const message = watch("message");

  // 상태
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [includeParents, setIncludeParents] = useState(false);
  const [preview, setPreview] = useState("");

  // 수신자 관련
  const [allTargets, setAllTargets] = useState<NotificationTarget[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoadingTargets, setIsLoadingTargets] = useState(true);

  // 발송 상태
  const [showSendModal, setShowSendModal] = useState(false);
  const [pendingSendData, setPendingSendData] = useState<KakaoMessageForm | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  // 수신자 목록 로드
  useEffect(() => {
    async function loadTargets() {
      setIsLoadingTargets(true);
      const supabase = createClient();

      const result = await getActiveStudentAndParentContacts(supabase);
      if (result.success) {
        setAllTargets(result.targets);
      } else {
        showToast(result.error || "수신자 목록을 불러올 수 없습니다.", "error");
      }

      setIsLoadingTargets(false);
    }

    loadTargets();
  }, [showToast]);

  // 미리보기 업데이트
  useEffect(() => {
    setPreview(generatePreview(message));
  }, [message]);

  // 필터링된 수신자 계산
  const filteredTargets = (() => {
    if (targetType === "parents") {
      return allTargets.filter((t) => t.isParent);
    }
    if (targetType === "selected") {
      // 선택된 학생의 본인 연락처만 (학부모 포함 체크 시 학부모도)
      const selected = allTargets.filter(
        (t) => selectedIds.includes(t.userId) && (includeParents || !t.isParent)
      );
      return selected;
    }
    // all
    if (includeParents) {
      return allTargets;
    }
    return allTargets.filter((t) => !t.isParent);
  })();

  // 체크박스 토글
  const toggleSelect = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    const studentTargets = allTargets.filter((t) => !t.isParent);
    const allSelected = studentTargets.every((t) =>
      selectedIds.includes(t.userId)
    );

    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(studentTargets.map((t) => t.userId));
    }
  };

  // 발송 확인
  const handleSendRequest = (data: KakaoMessageForm) => {
    if (filteredTargets.length === 0) {
      showToast("발송 대상이 없습니다.", "error");
      return;
    }
    setPendingSendData(data);
    setShowSendModal(true);
  };

  // 실제 발송
  const handleSendConfirm = async () => {
    if (!pendingSendData) return;
    setIsSending(true);
    setSendResult(null);

    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom",
          recipients: filteredTargets,
          message: pendingSendData.message.trim(),
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "발송 실패");
      }

      setSendResult({
        success: resData.sentCount || 0,
        failed: resData.failedCount || 0,
      });

      if (resData.sentCount > 0) {
        showToast(`${resData.sentCount}건 발송 완료`, "success");
        resetForm({ message: "" });
      } else {
        showToast("발송에 실패했습니다.", "error");
      }
    } catch (err) {
      console.error("발송 실패:", err);
      showToast("발송 중 오류가 발생했습니다.", "error");
    } finally {
      setIsSending(false);
      setShowSendModal(false);
      setPendingSendData(null);
    }
  };

  const studentTargets = allTargets.filter((t) => !t.isParent);

  return (
    <div className="max-w-4xl">
      {/* 안내 + 이력 조회 링크 */}
      <div className="flex items-center justify-between bg-navy/5 border border-navy/20 p-4 mb-6">
        <p className="text-secondary text-navy">
          재원생 및 학부모에게 알림톡(또는 SMS)을 발송합니다.
          템플릿 심사 전까지는 SMS로 발송됩니다.
        </p>
        <Link
          href="/admin/kakao/history"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-navy/20 text-small text-navy hover:bg-navy/5 transition-colors"
        >
          <History size={14} />
          발송 이력
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 좌측: 수신자 선택 */}
        <div className="bg-white border border-rule p-6">
          <h2 className="font-medium text-ink mb-4 flex items-center gap-2">
            <Users size={18} />
            수신자 선택
          </h2>

          {/* 대상 유형 */}
          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="targetType"
                value="all"
                checked={targetType === "all"}
                onChange={() => setTargetType("all")}
                className="w-4 h-4 accent-navy"
              />
              <span className="text-body">전체 재원생</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="targetType"
                value="parents"
                checked={targetType === "parents"}
                onChange={() => setTargetType("parents")}
                className="w-4 h-4 accent-navy"
              />
              <span className="text-body">학부모만</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="targetType"
                value="selected"
                checked={targetType === "selected"}
                onChange={() => setTargetType("selected")}
                className="w-4 h-4 accent-navy"
              />
              <span className="text-body">선택</span>
            </label>
          </div>

          {/* 학부모 포함 (전체/선택 시) */}
          {(targetType === "all" || targetType === "selected") && (
            <label className="flex items-center gap-2 cursor-pointer mb-4 pl-6">
              <input
                type="checkbox"
                checked={includeParents}
                onChange={(e) => setIncludeParents(e.target.checked)}
                className="w-4 h-4 accent-navy"
              />
              <span className="text-secondary text-muted">
                학부모도 포함
              </span>
            </label>
          )}

          {/* 선택 모드: 학생 목록 */}
          {targetType === "selected" && (
            <div className="border border-rule max-h-64 overflow-y-auto">
              {isLoadingTargets ? (
                <div className="p-4 text-center">
                  <Loader2
                    size={20}
                    className="animate-spin mx-auto text-muted"
                  />
                </div>
              ) : (
                <>
                  {/* 전체 선택 */}
                  <div className="sticky top-0 bg-stone border-b border-rule px-3 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          studentTargets.length > 0 &&
                          studentTargets.every((t) =>
                            selectedIds.includes(t.userId)
                          )
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-navy"
                      />
                      <span className="text-small font-medium">
                        전체 선택 ({selectedIds.length}/
                        {studentTargets.length})
                      </span>
                    </label>
                  </div>

                  {/* 학생 목록 */}
                  {studentTargets.map((target) => (
                    <label
                      key={target.userId}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-stone cursor-pointer border-b border-rule last:border-b-0 transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(target.userId)}
                        onChange={() => toggleSelect(target.userId)}
                        className="w-4 h-4 accent-navy flex-shrink-0"
                      />
                      <span className="text-body font-medium text-ink">{target.name}</span>
                      <span className="text-small text-muted ml-auto">
                        {target.phone}
                      </span>
                    </label>
                  ))}
                </>
              )}
            </div>
          )}

          {/* 수신자 수 */}
          <div className="mt-4 pt-4 border-t border-rule">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-teal" />
              <span className="text-body font-medium">
                발송 대상: {filteredTargets.length}명
              </span>
            </div>
          </div>
        </div>

        {/* 우측: 메시지 작성 */}
        <div className="bg-white border border-rule p-6">
          <h2 className="font-medium text-ink mb-4 flex items-center gap-2">
            <Send size={18} />
            메시지 작성
          </h2>

          {/* 메시지 입력 */}
          <div className="mb-4">
            <textarea
              {...register("message")}
              placeholder="메시지를 입력하세요..."
              rows={6}
              maxLength={1000}
              className={`w-full px-3 py-2 border text-body resize-none focus:outline-none ${
                errors.message ? "border-red-400 focus:border-red-500" : "border-rule focus:border-navy"
              }`}
            />
            <div className="flex justify-between mt-1">
              <span className={`text-caption ${errors.message ? "text-red-500" : "text-muted"}`}>
                {errors.message?.message || "[스터디코어] 태그가 자동으로 추가됩니다."}
              </span>
              <span className="text-caption text-muted">
                {message.length} / 1000
              </span>
            </div>
          </div>

          {/* 미리보기 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={14} className="text-muted" />
              <span className="text-small font-medium text-muted">
                미리보기
              </span>
            </div>
            <div className="bg-stone p-3 border border-rule text-secondary whitespace-pre-wrap min-h-[80px]">
              {preview ? (
                `[스터디코어] ${preview}`
              ) : (
                <span className="text-muted">메시지를 입력하세요.</span>
              )}
            </div>
          </div>

          {/* 발송 결과 */}
          {sendResult && (
            <div
              className={`p-3 mb-4 border ${
                sendResult.failed > 0
                  ? "bg-red-50 border-red-200"
                  : "bg-teal/5 border-teal/20"
              }`}
            >
              <div className="flex items-center gap-2">
                {sendResult.failed > 0 ? (
                  <AlertCircle size={16} className="text-red-500" />
                ) : (
                  <CheckCircle size={16} className="text-teal" />
                )}
                <span className="text-secondary">
                  성공: {sendResult.success}건
                  {sendResult.failed > 0 &&
                    ` / 실패: ${sendResult.failed}건`}
                </span>
              </div>
            </div>
          )}

          {/* 발송 버튼 */}
          <Button
            variant="primary"
            onClick={handleSubmit(handleSendRequest)}
            disabled={
              isSending ||
              !message.trim() ||
              filteredTargets.length === 0
            }
            className="w-full flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                발송 중...
              </>
            ) : (
              <>
                <Send size={16} />
                {filteredTargets.length}명에게 발송
              </>
            )}
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showSendModal}
        onClose={() => { setShowSendModal(false); setPendingSendData(null); }}
        onConfirm={handleSendConfirm}
        title="메시지 발송 확인"
        description={`${filteredTargets.length}명에게 메시지를 발송하시겠습니까? 발송 비용이 발생할 수 있습니다.`}
        confirmText="발송"
        variant="warning"
        isLoading={isSending}
      />

      {/* 안내 사항 */}
      <div className="mt-6 p-4 bg-stone border border-rule">
        <h3 className="text-secondary font-medium text-ink mb-2">
          알림 발송 안내
        </h3>
        <ul className="text-small text-muted space-y-1">
          <li>
            • 현재 알림톡 템플릿 심사 전으로, SMS로 발송됩니다.
          </li>
          <li>• 발송 비용이 발생할 수 있습니다.</li>
          <li>
            • 발송 이력은{" "}
            <Link
              href="/admin/kakao/history"
              className="text-teal underline"
            >
              발송 이력
            </Link>
            에서 확인하실 수 있습니다.
          </li>
        </ul>
      </div>
    </div>
  );
}
