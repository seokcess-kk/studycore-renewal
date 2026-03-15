"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { createBrowserClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/common/Toast";
import type { Profile, UserStatusType } from "@/domains/user/model";

export default function AdminMemberDetailPage() {
  const params = useParams();
  useRouter(); // 향후 사용 예정
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const [member, setMember] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<UserStatusType | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    school: "",
    grade: "",
    parent_phone: "",
  });

  const memberId = params.id as string;

  useEffect(() => {
    async function fetchMember() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", memberId)
          .single();

        if (error) throw error;

        setMember(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          school: data.school || "",
          grade: data.grade?.toString() || "",
          parent_phone: data.parent_phone || "",
        });
      } catch (error) {
        console.error("회원 조회 실패:", error);
        toast({
          variant: "error",
          title: "오류",
          description: "회원 정보를 불러올 수 없습니다.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchMember();
  }, [supabase, memberId, toast]);

  const handleSave = async () => {
    if (!member) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          phone: formData.phone || null,
          school: formData.school || null,
          grade: formData.grade ? parseInt(formData.grade) : null,
          parent_phone: formData.parent_phone || null,
        })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        variant: "success",
        title: "저장 완료",
        description: "회원 정보가 수정되었습니다.",
      });
    } catch (error) {
      console.error("회원 정보 수정 실패:", error);
      toast({
        variant: "error",
        title: "오류",
        description: "회원 정보 수정에 실패했습니다.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async () => {
    if (!member || !newStatus) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", memberId);

      if (error) throw error;

      setMember({ ...member, status: newStatus });
      toast({
        variant: "success",
        title: "상태 변경 완료",
        description: `회원 상태가 ${newStatus === "active" ? "활성" : newStatus === "inactive" ? "비활성" : "승인 대기"}으로 변경되었습니다.`,
      });
    } catch (error) {
      console.error("상태 변경 실패:", error);
      toast({
        variant: "error",
        title: "오류",
        description: "상태 변경에 실패했습니다.",
      });
    } finally {
      setIsSaving(false);
      setShowStatusModal(false);
      setNewStatus(null);
    }
  };

  const openStatusModal = (status: UserStatusType) => {
    setNewStatus(status);
    setShowStatusModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">회원을 찾을 수 없습니다.</p>
        <Link href="/admin/members" className="mt-4 text-teal hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상단 */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/members"
          className="flex items-center gap-2 text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>

        <div className="flex items-center gap-3">
          <Link href={`/admin/members/${memberId}/consult`}>
            <Button variant="ghost">
              <FileText className="mr-2 h-4 w-4" />
              상담 기록
            </Button>
          </Link>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 기본 정보 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-rule bg-white p-6">
            <h2 className="mb-4 font-serif text-lg font-bold text-ink">
              기본 정보
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted">
                  이름
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted">
                  연락처
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
                />
              </div>
              {member.role === "student" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-muted">
                      학교
                    </label>
                    <input
                      type="text"
                      value={formData.school}
                      onChange={(e) =>
                        setFormData({ ...formData, school: e.target.value })
                      }
                      className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-muted">
                      학년
                    </label>
                    <select
                      value={formData.grade}
                      onChange={(e) =>
                        setFormData({ ...formData, grade: e.target.value })
                      }
                      className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
                    >
                      <option value="">선택</option>
                      <option value="1">1학년</option>
                      <option value="2">2학년</option>
                      <option value="3">3학년</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-muted">
                      학부모 연락처
                    </label>
                    <input
                      type="tel"
                      value={formData.parent_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, parent_phone: e.target.value })
                      }
                      className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 상태 및 정보 */}
        <div className="space-y-6">
          {/* 계정 상태 */}
          <div className="border border-rule bg-white p-6">
            <h2 className="mb-4 font-serif text-lg font-bold text-ink">
              계정 상태
            </h2>
            <div className="mb-4 flex items-center gap-3">
              <RoleBadge role={member.role} />
              {member.status && <StatusBadge status={member.status} />}
            </div>

            {member.role === "student" && (
              <div className="space-y-2">
                {member.status !== "active" && (
                  <button
                    onClick={() => openStatusModal("active")}
                    className="w-full border border-green-500 px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                  >
                    활성화
                  </button>
                )}
                {member.status !== "inactive" && (
                  <button
                    onClick={() => openStatusModal("inactive")}
                    className="w-full border border-gray-400 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    비활성화
                  </button>
                )}
                {member.status !== "pending" && (
                  <button
                    onClick={() => openStatusModal("pending")}
                    className="w-full border border-yellow-500 px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                  >
                    승인 대기로 변경
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 가입 정보 */}
          <div className="border border-rule bg-white p-6">
            <h2 className="mb-4 font-serif text-lg font-bold text-ink">
              가입 정보
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">가입일</dt>
                <dd className="text-ink">{formatDate(member.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">최근 수정</dt>
                <dd className="text-ink">{formatDate(member.updated_at)}</dd>
              </div>
              {member.username && (
                <div className="flex justify-between">
                  <dt className="text-muted">아이디</dt>
                  <dd className="font-mono text-ink">{member.username}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* 상태 변경 모달 */}
      <ConfirmModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setNewStatus(null);
        }}
        onConfirm={handleStatusChange}
        title="상태 변경"
        description={`회원 상태를 ${newStatus === "active" ? "활성" : newStatus === "inactive" ? "비활성" : "승인 대기"}으로 변경하시겠습니까?`}
        confirmText="변경"
        variant="warning"
        isLoading={isSaving}
      />
    </div>
  );
}
