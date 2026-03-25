"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/common/Button";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import { useUserStore } from "@/stores/useUserStore";
import { formatDate } from "@/lib/utils";
import {
  CreateCounselingInputSchema,
  CreateCounselingInput,
  COUNSELING_TYPE_LABELS,
  CounselingType,
} from "@/domains/counseling/model";
import type { CounselingRecordWithProfiles } from "@/domains/counseling/model";
import type { Profile } from "@/domains/user/model";
import {
  getStudentCounselings,
  recordCounseling,
} from "@/domains/counseling/service";

export default function AdminMemberConsultPage() {
  const params = useParams();
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const { user } = useUserStore();

  const [member, setMember] = useState<Profile | null>(null);
  const [records, setRecords] = useState<CounselingRecordWithProfiles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const memberId = params.id as string;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCounselingInput>({
    resolver: zodResolver(CreateCounselingInputSchema),
    defaultValues: {
      student_id: memberId,
      date: new Date().toISOString().split("T")[0],
      type: "admission",
      content: "",
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // 회원 정보
        const { data: memberData, error: memberError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", memberId)
          .single();

        if (memberError) throw memberError;
        setMember(memberData);

        // 상담 기록
        const recordsData = await getStudentCounselings(supabase, memberId);
        setRecords(recordsData);
      } catch (error) {
        console.error("데이터 조회 실패:", error);
        toast({
          variant: "error",
          title: "오류",
          description: "데이터를 불러올 수 없습니다.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [supabase, memberId, toast]);

  const onSubmit = async (data: CreateCounselingInput) => {
    if (!user) return;

    try {
      await recordCounseling(supabase, user.id, data);

      toast({
        variant: "success",
        title: "저장 완료",
        description: "상담 기록이 저장되었습니다.",
      });

      // 목록 새로고침
      const newRecords = await getStudentCounselings(supabase, memberId);
      setRecords(newRecords);
      setShowForm(false);
      reset();
    } catch (error) {
      console.error("상담 기록 저장 실패:", error);
      toast({
        variant: "error",
        title: "오류",
        description: "상담 기록 저장에 실패했습니다.",
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

  return (
    <div className="space-y-6">
      {/* 상단 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/members/${memberId}`}
            className="flex items-center gap-2 text-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            회원 상세로
          </Link>
          {member && (
            <span className="font-serif text-subhead font-bold text-ink">
              {member.name} 상담 기록
            </span>
          )}
        </div>

        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          상담 기록 추가
        </Button>
      </div>

      {/* 상담 기록 작성 폼 */}
      {showForm && (
        <div className="border border-rule bg-white p-6">
          <h3 className="mb-4 font-serif text-subhead font-bold text-ink">
            새 상담 기록
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("student_id")} value={memberId} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-body font-medium text-muted">
                  상담 일자
                </label>
                <input
                  type="date"
                  {...register("date")}
                  className="w-full border border-rule px-3 py-2 text-body focus:border-navy focus:outline-none"
                />
                {errors.date && (
                  <p className="mt-1 text-caption text-red-500">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-body font-medium text-muted">
                  상담 유형
                </label>
                <select
                  {...register("type")}
                  className="w-full border border-rule px-3 py-2 text-body focus:border-navy focus:outline-none"
                >
                  {Object.entries(COUNSELING_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-body font-medium text-muted">
                상담 내용
              </label>
              <textarea
                {...register("content")}
                rows={5}
                placeholder="상담 내용을 입력하세요"
                className="w-full border border-rule px-3 py-2 text-body focus:border-navy focus:outline-none"
              />
              {errors.content && (
                <p className="mt-1 text-caption text-red-500">
                  {errors.content.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-body font-medium text-muted">
                  다음 상담 예정일 (선택)
                </label>
                <input
                  type="date"
                  {...register("next_date")}
                  className="w-full border border-rule px-3 py-2 text-body focus:border-navy focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  reset();
                }}
              >
                취소
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 상담 기록 목록 */}
      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="border border-rule bg-white py-12 text-center">
            <p className="text-muted">상담 기록이 없습니다.</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="border border-rule bg-white p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex items-center border px-2.5 py-1 text-body font-medium ${
                      record.type === "admission"
                        ? "border-blue-200 bg-blue-100 text-blue-800"
                        : record.type === "career"
                        ? "border-purple-200 bg-purple-100 text-purple-800"
                        : "border-gray-200 bg-gray-100 text-gray-800"
                    }`}
                  >
                    {COUNSELING_TYPE_LABELS[record.type as CounselingType]}
                  </span>
                  <div className="flex items-center gap-1 text-body text-muted">
                    <Calendar className="h-4 w-4" />
                    {formatDate(record.date)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-body text-muted">
                  <User className="h-4 w-4" />
                  {record.counselor?.name || "알 수 없음"}
                </div>
              </div>

              <p className="whitespace-pre-wrap text-ink">{record.content}</p>

              {record.next_date && (
                <p className="mt-4 text-body text-teal">
                  다음 상담 예정: {formatDate(record.next_date)}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
