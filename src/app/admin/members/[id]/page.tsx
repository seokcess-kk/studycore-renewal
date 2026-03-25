"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { createBrowserClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/common/Toast";
import {
  adminUpdateMemberSchema,
  type Profile,
  type UserStatusType,
} from "@/domains/user/model";
import {
  getProfileById,
  adminUpdateMember,
  changeUserStatus,
} from "@/domains/user/service";
import { usePhoneFormat } from "@/hooks/usePhoneFormat";

type MemberFormValues = {
  name: string;
  phone: string;
  school: string;
  grade: string;
  parent_phone: string;
};

export default function AdminMemberDetailPage() {
  const params = useParams();
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const [member, setMember] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<UserStatusType | null>(null);
  const [isStatusChanging, setIsStatusChanging] = useState(false);

  const memberId = params.id as string;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(adminUpdateMemberSchema),
    defaultValues: {
      name: "",
      phone: "",
      school: "",
      grade: "",
      parent_phone: "",
    },
  });

  const handlePhoneChange = usePhoneFormat<MemberFormValues>(setValue);

  useEffect(() => {
    async function fetchMember() {
      const result = await getProfileById(supabase, memberId);

      if (result.success && result.profile) {
        setMember(result.profile);
        reset({
          name: result.profile.name || "",
          phone: result.profile.phone || "",
          school: result.profile.school || "",
          grade: result.profile.grade?.toString() || "",
          parent_phone: result.profile.parent_phone || "",
        });
      } else {
        toast({
          variant: "error",
          title: "오류",
          description: result.error || "회원 정보를 불러올 수 없습니다.",
        });
      }

      setIsLoading(false);
    }

    fetchMember();
  }, [supabase, memberId, toast, reset]);

  const onSubmit = async (data: MemberFormValues) => {
    if (!member) return;

    const result = await adminUpdateMember(supabase, memberId, data);

    if (result.success) {
      if (result.profile) setMember(result.profile);
      toast({
        variant: "success",
        title: "저장 완료",
        description: "회원 정보가 수정되었습니다.",
      });
    } else {
      toast({
        variant: "error",
        title: "오류",
        description: result.error || "회원 정보 수정에 실패했습니다.",
      });
    }
  };

  const handleStatusChange = async () => {
    if (!member || !newStatus) return;

    setIsStatusChanging(true);
    const result = await changeUserStatus(supabase, memberId, newStatus);

    if (result.success) {
      if (result.profile) setMember(result.profile);
      toast({
        variant: "success",
        title: "상태 변경 완료",
        description: `회원 상태가 ${newStatus === "active" ? "활성" : newStatus === "inactive" ? "비활성" : "승인 대기"}으로 변경되었습니다.`,
      });

    } else {
      toast({
        variant: "error",
        title: "오류",
        description: result.error || "상태 변경에 실패했습니다.",
      });
    }

    setIsStatusChanging(false);
    setShowStatusModal(false);
    setNewStatus(null);
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
          className="flex items-center gap-2 text-muted hover:text-ink transition-colors duration-200"
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
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 기본 정보 */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="border border-rule bg-white p-6">
            <h2 className="mb-4 font-serif text-subhead font-bold text-ink">
              기본 정보
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-body font-medium text-muted">
                  이름
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full border px-3 py-2 text-body focus:outline-none ${
                    errors.name ? "border-red-400 focus:border-red-500" : "border-rule focus:border-navy"
                  }`}
                />
                {errors.name && (
                  <p className="text-caption text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-body font-medium text-muted">
                  연락처
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  onChange={(e) => handlePhoneChange("phone", e)}
                  placeholder="010-0000-0000"
                  className={`w-full border px-3 py-2 text-body focus:outline-none ${
                    errors.phone ? "border-red-400 focus:border-red-500" : "border-rule focus:border-navy"
                  }`}
                />
                {errors.phone && (
                  <p className="text-caption text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>
              {member.role === "student" && (
                <>
                  <div>
                    <label className="mb-1 block text-body font-medium text-muted">
                      학교
                    </label>
                    <input
                      type="text"
                      {...register("school")}
                      className="w-full border border-rule px-3 py-2 text-body focus:border-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-body font-medium text-muted">
                      학년
                    </label>
                    <select
                      {...register("grade")}
                      className="w-full border border-rule px-3 py-2 text-body focus:border-navy focus:outline-none"
                    >
                      <option value="">선택</option>
                      <option value="1">1학년</option>
                      <option value="2">2학년</option>
                      <option value="3">3학년</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-body font-medium text-muted">
                      학부모 연락처
                    </label>
                    <input
                      type="tel"
                      {...register("parent_phone")}
                      onChange={(e) => handlePhoneChange("parent_phone", e)}
                      placeholder="010-0000-0000"
                      className={`w-full border px-3 py-2 text-body focus:outline-none ${
                        errors.parent_phone ? "border-red-400 focus:border-red-500" : "border-rule focus:border-navy"
                      }`}
                    />
                    {errors.parent_phone && (
                      <p className="text-caption text-red-500 mt-1">{errors.parent_phone.message}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </form>
        </div>

        {/* 상태 및 정보 */}
        <div className="space-y-6">
          {/* 계정 상태 */}
          <div className="border border-rule bg-white p-6">
            <h2 className="mb-4 font-serif text-subhead font-bold text-ink">
              계정 상태
            </h2>
            <div className="mb-4 flex items-center gap-3">
              <RoleBadge role={member.role} />
              {member.status && <StatusBadge status={member.status} />}
            </div>

            {member.role === "student" && (
              <div className="space-y-4">
                {member.status === "pending" && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200">
                    <p className="text-secondary text-yellow-700 mb-2">
                      가입 승인 대기 중입니다.
                    </p>
                    <button
                      onClick={() => openStatusModal("active")}
                      className="w-full bg-teal border border-teal px-3 py-2.5 text-body font-medium text-white hover:bg-teal-d cursor-pointer transition-colors duration-200"
                    >
                      가입 승인
                    </button>
                  </div>
                )}

                {member.status !== "pending" && (
                  <div className="space-y-2">
                    {member.status === "active" && (
                      <button
                        onClick={() => openStatusModal("inactive")}
                        className="w-full border border-rule px-3 py-2 text-body text-muted hover:bg-stone cursor-pointer transition-colors duration-200"
                      >
                        계정 비활성화
                      </button>
                    )}
                    {member.status === "inactive" && (
                      <button
                        onClick={() => openStatusModal("active")}
                        className="w-full border border-teal px-3 py-2 text-body text-teal hover:bg-teal/5 cursor-pointer transition-colors duration-200"
                      >
                        계정 재활성화
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 가입 정보 */}
          <div className="border border-rule bg-white p-6">
            <h2 className="mb-4 font-serif text-subhead font-bold text-ink">
              가입 정보
            </h2>
            <dl className="space-y-3 text-body">
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
        title={
          member?.status === "pending" && newStatus === "active"
            ? "가입 승인"
            : newStatus === "inactive"
            ? "계정 비활성화"
            : "계정 재활성화"
        }
        description={
          member?.status === "pending" && newStatus === "active"
            ? "이 재원생의 가입을 승인하시겠습니까? 승인 후 모든 기능을 이용할 수 있습니다."
            : newStatus === "inactive"
            ? "계정을 비활성화하시겠습니까? 비활성화된 재원생은 서비스 이용이 제한됩니다."
            : "계정을 재활성화하시겠습니까?"
        }
        confirmText={
          member?.status === "pending" && newStatus === "active"
            ? "승인"
            : "변경"
        }
        variant={newStatus === "inactive" ? "danger" : "warning"}
        isLoading={isStatusChanging}
      />
    </div>
  );
}
