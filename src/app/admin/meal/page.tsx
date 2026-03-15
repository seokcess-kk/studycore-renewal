"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Skeleton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import {
  getPeriodList,
  getApplicationsByPeriod,
  createPeriod,
  updatePeriod,
  deletePeriod,
  generateExcelData,
  generateSummary,
} from "@/domains/meal/service";
import {
  type MealPeriod,
  type MealApplicationWithStudent,
  type CreateMealPeriodInput,
  MEAL_TYPE_LABELS,
} from "@/domains/meal/model";
import { useToast } from "@/components/common/Toast";
import {
  Plus,
  Calendar,
  Users,
  Download,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminLunchPage() {
  const [periods, setPeriods] = useState<MealPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<MealPeriod | null>(null);
  const [applications, setApplications] = useState<MealApplicationWithStudent[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<MealPeriod | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MealPeriod | null>(null);
  const { showToast } = useToast();

  const fetchPeriods = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const result = await getPeriodList(supabase);

    if (result.success) {
      setPeriods(result.periods);
      // 첫 번째 활성 기간 자동 선택
      const activePeriod = result.periods.find((p) => p.is_active);
      if (activePeriod && !selectedPeriod) {
        setSelectedPeriod(activePeriod);
      }
    }
    setIsLoading(false);
  };

  const fetchApplications = async (periodId: string) => {
    setIsLoadingApps(true);
    const supabase = createClient();
    const result = await getApplicationsByPeriod(supabase, periodId);

    if (result.success) {
      setApplications(result.applications);
    }
    setIsLoadingApps(false);
  };

  useEffect(() => {
    fetchPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      fetchApplications(selectedPeriod.id);
    }
  }, [selectedPeriod]);

  const handleExportExcel = () => {
    if (!selectedPeriod) return;

    const data = generateExcelData(selectedPeriod, applications);
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "도시락 신청");

    const fileName = `도시락신청_${selectedPeriod.title}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast("엑셀 파일이 다운로드되었습니다.", "success");
  };

  const handleDeletePeriod = async () => {
    if (!deleteTarget) return;

    const supabase = createClient();
    const result = await deletePeriod(supabase, deleteTarget.id);

    if (result.success) {
      showToast("기간이 삭제되었습니다.", "success");
      setDeleteTarget(null);
      if (selectedPeriod?.id === deleteTarget.id) {
        setSelectedPeriod(null);
        setApplications([]);
      }
      fetchPeriods();
    } else {
      showToast(result.error || "삭제에 실패했습니다.", "error");
    }
  };

  const summary = selectedPeriod ? generateSummary(selectedPeriod, applications) : [];

  return (
    <>
      <AdminHeader
        title="도시락 관리"
        breadcrumb={[
          { label: "대시보드", href: "/admin" },
          { label: "도시락 관리" },
        ]}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 기간 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-rule">
              <div className="flex items-center justify-between px-4 py-3 border-b border-rule">
                <h2 className="text-[15px] font-bold text-ink">신청 기간</h2>
                <button
                  onClick={() => {
                    setEditingPeriod(null);
                    setShowPeriodModal(true);
                  }}
                  className="flex items-center gap-1 text-[13px] text-teal hover:text-teal-d"
                >
                  <Plus size={14} />
                  새 기간
                </button>
              </div>

              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : periods.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-[14px]">등록된 기간이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-rule">
                  {periods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPeriod(period)}
                      className={`w-full text-left p-4 hover:bg-stone/50 transition-colors ${
                        selectedPeriod?.id === period.id ? "bg-stone" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[14px] font-medium text-ink">
                            {period.title}
                          </p>
                          <p className="text-[12px] text-muted mt-1">
                            {period.start_date} ~ {period.end_date}
                          </p>
                        </div>
                        <StatusBadge
                          status={period.is_active ? "active" : "inactive"}
                          labels={{ active: "활성", inactive: "비활성" }}
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        {period.meal_types.map((type) => (
                          <span
                            key={type}
                            className="text-[11px] px-1.5 py-0.5 bg-stone text-muted"
                          >
                            {MEAL_TYPE_LABELS[type as keyof typeof MEAL_TYPE_LABELS]}
                          </span>
                        ))}
                        <span className="text-[11px] px-1.5 py-0.5 bg-stone text-muted">
                          {period.selection_type === "weekday" ? "요일별" : "날짜별"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 우측: 신청 현황 */}
          <div className="lg:col-span-2">
            {selectedPeriod ? (
              <div className="bg-white border border-rule">
                {/* 기간 정보 헤더 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-rule">
                  <div>
                    <h2 className="text-[15px] font-bold text-ink">
                      {selectedPeriod.title}
                    </h2>
                    <p className="text-[12px] text-muted">
                      {selectedPeriod.start_date} ~ {selectedPeriod.end_date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPeriod(selectedPeriod);
                        setShowPeriodModal(true);
                      }}
                      className="p-2 text-muted hover:text-navy transition-colors"
                      title="수정"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(selectedPeriod)}
                      className="p-2 text-muted hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={handleExportExcel}
                      disabled={applications.length === 0}
                      className="flex items-center gap-2 px-3 py-1.5 bg-teal text-white text-[13px] font-medium hover:bg-teal-d transition-colors disabled:opacity-50"
                    >
                      <Download size={14} />
                      엑셀 다운로드
                    </button>
                  </div>
                </div>

                {/* 요약 통계 */}
                <div className="px-4 py-3 border-b border-rule bg-stone/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-muted" />
                    <span className="text-[13px] font-medium">
                      총 {applications.length}명 신청
                    </span>
                  </div>
                  {summary.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-[12px]">
                      {summary.map((s) => (
                        <div key={s.label} className="bg-white p-2 text-center">
                          <div className="font-medium text-ink">{s.label}</div>
                          <div className="text-muted mt-1">
                            중식 {s.lunch} / 석식 {s.dinner}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 신청 목록 */}
                {isLoadingApps ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="p-12 text-center text-muted">
                    <p className="text-[14px]">아직 신청이 없습니다.</p>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-stone sticky top-0">
                        <tr className="text-[13px] text-muted">
                          <th className="px-4 py-2 text-left font-medium">이름</th>
                          <th className="px-4 py-2 text-left font-medium">학교/학년</th>
                          <th className="px-4 py-2 text-left font-medium">선택</th>
                          <th className="px-4 py-2 text-center font-medium">신청일</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rule">
                        {applications.map((app) => (
                          <ApplicationRow
                            key={app.id}
                            application={app}
                            period={selectedPeriod}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-rule p-12 text-center text-muted">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-[15px]">기간을 선택하세요</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 기간 생성/수정 모달 */}
      {showPeriodModal && (
        <PeriodModal
          period={editingPeriod}
          onClose={() => {
            setShowPeriodModal(false);
            setEditingPeriod(null);
          }}
          onSave={() => {
            setShowPeriodModal(false);
            setEditingPeriod(null);
            fetchPeriods();
          }}
        />
      )}

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePeriod}
        title="기간 삭제"
        message={`"${deleteTarget?.title}" 기간을 삭제하시겠습니까? 관련된 모든 신청 내역도 함께 삭제됩니다.`}
        confirmText="삭제"
        confirmVariant="danger"
      />
    </>
  );
}

// 신청 행 컴포넌트
function ApplicationRow({
  application,
  period,
}: {
  application: MealApplicationWithStudent;
  period: MealPeriod;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const selections = application.selections as Record<string, string[]>;

  const selectionCount = Object.values(selections).reduce(
    (acc, meals) => acc + meals.length,
    0
  );

  return (
    <>
      <tr className="hover:bg-stone/30">
        <td className="px-4 py-3 text-[14px]">
          {application.student?.name || "알 수 없음"}
        </td>
        <td className="px-4 py-3 text-[13px] text-muted">
          {application.student?.school || "-"}{" "}
          {application.student?.grade ? `${application.student.grade}학년` : ""}
        </td>
        <td className="px-4 py-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[13px] text-teal hover:text-teal-d"
          >
            {selectionCount}개 선택
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </td>
        <td className="px-4 py-3 text-center text-[13px] text-muted">
          {new Date(application.created_at).toLocaleDateString("ko-KR")}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={4} className="px-4 py-3 bg-stone/30">
            <div className="flex flex-wrap gap-2">
              {Object.entries(selections).map(([key, meals]) => (
                <div key={key} className="text-[12px]">
                  <span className="font-medium">
                    {period.selection_type === "weekday"
                      ? ["일", "월", "화", "수", "목", "금", "토"][parseInt(key)]
                      : key}
                    :
                  </span>{" "}
                  {meals
                    .map((m) => MEAL_TYPE_LABELS[m as keyof typeof MEAL_TYPE_LABELS])
                    .join(", ")}
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// 기간 생성/수정 모달
function PeriodModal({
  period,
  onClose,
  onSave,
}: {
  period: MealPeriod | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateMealPeriodInput>({
    title: period?.title || "",
    start_date: period?.start_date || "",
    end_date: period?.end_date || "",
    meal_types: period?.meal_types || ["lunch", "dinner"],
    selection_type: period?.selection_type || "weekday",
    is_active: period?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const supabase = createClient();
    const result = period
      ? await updatePeriod(supabase, period.id, formData)
      : await createPeriod(supabase, formData);

    setIsSubmitting(false);

    if (result.success) {
      showToast(period ? "기간이 수정되었습니다." : "기간이 생성되었습니다.", "success");
      onSave();
    } else {
      showToast(result.error || "오류가 발생했습니다.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-rule">
          <h2 className="text-[17px] font-bold text-ink">
            {period ? "기간 수정" : "새 기간 생성"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-ink mb-1">
              기간명
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 2024년 1월 도시락"
              className="w-full px-3 py-2 border border-rule text-[14px] focus:border-navy focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1">
                시작일
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-rule text-[14px] focus:border-navy focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1">
                종료일
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-rule text-[14px] focus:border-navy focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink mb-1">
              식사 유형
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.meal_types.includes("lunch")}
                  onChange={(e) => {
                    const types = e.target.checked
                      ? [...formData.meal_types, "lunch"]
                      : formData.meal_types.filter((t) => t !== "lunch");
                    setFormData({ ...formData, meal_types: types as ("lunch" | "dinner")[] });
                  }}
                  className="w-4 h-4"
                />
                <span className="text-[14px]">중식</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.meal_types.includes("dinner")}
                  onChange={(e) => {
                    const types = e.target.checked
                      ? [...formData.meal_types, "dinner"]
                      : formData.meal_types.filter((t) => t !== "dinner");
                    setFormData({ ...formData, meal_types: types as ("lunch" | "dinner")[] });
                  }}
                  className="w-4 h-4"
                />
                <span className="text-[14px]">석식</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink mb-1">
              선택 방식
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="selection_type"
                  value="weekday"
                  checked={formData.selection_type === "weekday"}
                  onChange={() =>
                    setFormData({ ...formData, selection_type: "weekday" })
                  }
                  className="w-4 h-4"
                />
                <span className="text-[14px]">요일별</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="selection_type"
                  value="date"
                  checked={formData.selection_type === "date"}
                  onChange={() =>
                    setFormData({ ...formData, selection_type: "date" })
                  }
                  className="w-4 h-4"
                />
                <span className="text-[14px]">날짜별</span>
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-[14px]">활성화 (신청 가능)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-navy text-white text-[14px] font-medium hover:bg-navy-d transition-colors disabled:opacity-50"
            >
              {period ? "수정" : "생성"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-rule text-ink text-[14px] hover:border-navy transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
