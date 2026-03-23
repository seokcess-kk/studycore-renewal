"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Skeleton } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import {
  getPeriodList,
  getApplicationsByPeriod,
  getActiveStudents,
  createPeriod,
  updatePeriod,
  deletePeriod,
  generateExcelData,
  generateSummary,
  calcWeekdayMealCount,
} from "@/domains/meal/service";
import {
  type MealPeriod,
  type MealApplicationWithStudent,
  type CreateMealPeriodInput,
  type MealTypeValue,
  createMealPeriodSchema,
  MEAL_TYPE_LABELS,
  WEEKDAY_LABELS,
} from "@/domains/meal/model";
import { useToast } from "@/components/common/Toast";
import {
  Plus,
  Calendar,
  Users,
  Download,
  Pencil,
  Trash2,
  Check,
  X,
  UserX,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminLunchPage() {
  const [periods, setPeriods] = useState<MealPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<MealPeriod | null>(null);
  const [applications, setApplications] = useState<
    MealApplicationWithStudent[]
  >([]);
  const [activeStudents, setActiveStudents] = useState<
    { id: string; name: string; school: string | null; grade: number | null }[]
  >([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<MealPeriod | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MealPeriod | null>(null);
  const [showMobilePeriods, setShowMobilePeriods] = useState(false);
  const { showToast } = useToast();

  const fetchPeriods = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const result = await getPeriodList(supabase);

    if (result.success) {
      setPeriods(result.periods);
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

    const [appResult, studentResult] = await Promise.all([
      getApplicationsByPeriod(supabase, periodId),
      getActiveStudents(supabase),
    ]);

    if (appResult.success) setApplications(appResult.applications);
    if (studentResult.success) setActiveStudents(studentResult.students);

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

  // 미신청 학생 계산
  const unappliedStudents = useMemo(() => {
    const appliedIds = new Set(applications.map((a) => a.student_id));
    return activeStudents.filter((s) => !appliedIds.has(s.id));
  }, [applications, activeStudents]);

  const handleExportExcel = () => {
    if (!selectedPeriod) return;

    const data = generateExcelData(selectedPeriod, applications);

    // 요약 시트 데이터
    const summary = generateSummary(selectedPeriod, applications);
    const summaryData = summary.map((s) => ({
      "요일/날짜": s.label,
      중식: s.lunch,
      석식: s.dinner,
      합계: s.lunch + s.dinner,
    }));

    const wb = XLSX.utils.book_new();

    // 요약 시트
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "식수 합계");

    // 상세 시트
    const detailWs = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, detailWs, "신청 상세");

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

  const summary = selectedPeriod
    ? generateSummary(selectedPeriod, applications)
    : [];

  // 요일/날짜 키 목록 (매트릭스 열)
  const selectionKeys = useMemo(() => {
    if (!selectedPeriod) return [];
    if (selectedPeriod.selection_type === "weekday") {
      return [1, 2, 3, 4, 5].map((d) => d.toString());
    }
    // 날짜별: 모든 신청에서 사용된 날짜 수집
    const dateSet = new Set<string>();
    applications.forEach((app) => {
      const sel = app.selections as Record<string, string[]>;
      Object.keys(sel).forEach((k) => dateSet.add(k));
    });
    return Array.from(dateSet).sort();
  }, [selectedPeriod, applications]);

  const getKeyLabel = (key: string): string => {
    if (!selectedPeriod) return key;
    if (selectedPeriod.selection_type === "weekday") {
      return WEEKDAY_LABELS[parseInt(key)] || key;
    }
    // 날짜: MM/DD 형식
    const parts = key.split("-");
    return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
  };

  return (
    <>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 모바일: 기간 드롭다운 */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowMobilePeriods(!showMobilePeriods)}
              className="w-full flex items-center justify-between bg-white border border-rule px-4 py-3 text-body font-medium text-ink"
            >
              <span>
                {selectedPeriod ? selectedPeriod.title : "기간을 선택하세요"}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${showMobilePeriods ? "rotate-180" : ""}`}
              />
            </button>
            {showMobilePeriods && (
              <div className="bg-white border border-t-0 border-rule divide-y divide-rule">
                {periods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setShowMobilePeriods(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-body transition-colors duration-200 ${
                      selectedPeriod?.id === period.id
                        ? "bg-stone font-medium"
                        : "hover:bg-stone/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{period.title}</span>
                      <StatusBadge
                        status={period.is_active ? "active" : "inactive"}
                        labels={{ active: "활성", inactive: "비활성" }}
                      />
                    </div>
                    <p className="text-small text-muted mt-0.5">
                      접수 {period.apply_start_date} ~ {period.apply_end_date}
                    </p>
                    <p className="text-small text-muted">
                      도시락 {period.start_date} ~ {period.end_date}
                    </p>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setEditingPeriod(null);
                    setShowPeriodModal(true);
                    setShowMobilePeriods(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-secondary text-teal hover:bg-stone/50 transition-colors duration-200"
                >
                  <Plus size={14} />새 기간 추가
                </button>
              </div>
            )}
          </div>

          {/* 데스크톱: 기간 사이드바 */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white border border-rule">
              <div className="flex items-center justify-between px-4 py-3 border-b border-rule bg-stone">
                <h2 className="text-body font-bold text-ink">신청 기간</h2>
                <button
                  onClick={() => {
                    setEditingPeriod(null);
                    setShowPeriodModal(true);
                  }}
                  className="flex items-center gap-1 text-secondary text-teal hover:text-teal-d cursor-pointer transition-colors duration-200"
                >
                  <Plus size={14} />
                  추가
                </button>
              </div>

              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : periods.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-secondary">등록된 기간이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-rule max-h-[500px] overflow-y-auto">
                  {periods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPeriod(period)}
                      className={`w-full text-left p-3 hover:bg-stone/50 transition-colors cursor-pointer ${
                        selectedPeriod?.id === period.id ? "bg-stone" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-secondary font-medium text-ink leading-tight">
                          {period.title}
                        </p>
                        <StatusBadge
                          status={period.is_active ? "active" : "inactive"}
                          labels={{ active: "활성", inactive: "비활성" }}
                        />
                      </div>
                      <p className="text-caption text-muted mt-1">
                        접수 {period.apply_start_date} ~ {period.apply_end_date}
                      </p>
                      <p className="text-caption text-muted">
                        도시락 {period.start_date} ~ {period.end_date}
                      </p>
                      <div className="flex gap-1.5 mt-1.5">
                        {period.meal_types.map((type) => (
                          <span
                            key={type}
                            className="text-label px-1.5 py-0.5 bg-stone text-muted"
                          >
                            {
                              MEAL_TYPE_LABELS[
                                type as keyof typeof MEAL_TYPE_LABELS
                              ]
                            }
                          </span>
                        ))}
                        <span className="text-label px-1.5 py-0.5 bg-stone text-muted">
                          {period.selection_type === "weekday"
                            ? "요일별"
                            : "날짜별"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 우측: 신청 현황 */}
          <div className="lg:col-span-3">
            {selectedPeriod ? (
              <div className="space-y-6">
                {/* 기간 헤더 + 액션 */}
                <div className="bg-white border border-rule">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-rule bg-stone">
                    <div>
                      <h2 className="text-reading font-bold text-ink">
                        {selectedPeriod.title}
                      </h2>
                      <p className="text-small text-muted">
                        접수 {selectedPeriod.apply_start_date} ~{" "}
                        {selectedPeriod.apply_end_date}
                      </p>
                      <p className="text-small text-muted">
                        도시락 {selectedPeriod.start_date} ~{" "}
                        {selectedPeriod.end_date}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPeriod(selectedPeriod);
                          setShowPeriodModal(true);
                        }}
                        className="p-2 text-muted hover:text-navy transition-colors cursor-pointer"
                        title="수정"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(selectedPeriod)}
                        className="p-2 text-muted hover:text-red-500 transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={handleExportExcel}
                        disabled={applications.length === 0}
                        className="flex items-center gap-2 px-3 py-1.5 bg-teal text-white text-secondary font-medium hover:bg-teal-d transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Download size={14} />
                        엑셀
                      </button>
                    </div>
                  </div>

                  {/* 식수 합계 카드 — 핵심 정보 */}
                  <div className="px-4 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users size={14} className="text-muted" />
                      <span className="text-secondary font-medium text-ink">
                        신청 {applications.length}명
                        {unappliedStudents.length > 0 && (
                          <span className="text-muted font-normal">
                            {" "}
                            / 미신청 {unappliedStudents.length}명
                          </span>
                        )}
                      </span>
                    </div>

                    {summary.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-secondary">
                          <thead>
                            <tr className="border-b border-rule">
                              <th className="text-left py-2 pr-4 font-medium text-muted">
                                {selectedPeriod.selection_type === "weekday"
                                  ? "요일"
                                  : "날짜"}
                              </th>
                              {selectedPeriod.selection_type === "weekday" && (
                                <th className="text-center py-2 px-3 font-medium text-muted">
                                  횟수
                                </th>
                              )}
                              {selectedPeriod.meal_types.includes("lunch") && (
                                <th className="text-center py-2 px-3 font-medium text-muted">
                                  중식
                                </th>
                              )}
                              {selectedPeriod.meal_types.includes("dinner") && (
                                <th className="text-center py-2 px-3 font-medium text-muted">
                                  석식
                                </th>
                              )}
                              <th className="text-center py-2 px-3 font-bold text-ink">
                                인원 합계
                              </th>
                              {selectedPeriod.selection_type === "weekday" && (
                                <th className="text-center py-2 px-3 font-bold text-ink">
                                  총 식수
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {summary.map((s) => {
                              const personTotal = s.lunch + s.dinner;
                              const occ = s.occurrences || 0;
                              return (
                              <tr
                                key={s.label}
                                className="border-b border-rule last:border-b-0"
                              >
                                <td className="py-2 pr-4 font-medium text-ink">
                                  {s.label}
                                </td>
                                {selectedPeriod.selection_type === "weekday" && (
                                  <td className="text-center py-2 px-3 text-muted">
                                    {occ}회
                                  </td>
                                )}
                                {selectedPeriod.meal_types.includes(
                                  "lunch"
                                ) && (
                                  <td className="text-center py-2 px-3">
                                    <span
                                      className={
                                        s.lunch > 0
                                          ? "font-bold text-ink"
                                          : "text-muted"
                                      }
                                    >
                                      {s.lunch}
                                    </span>
                                  </td>
                                )}
                                {selectedPeriod.meal_types.includes(
                                  "dinner"
                                ) && (
                                  <td className="text-center py-2 px-3">
                                    <span
                                      className={
                                        s.dinner > 0
                                          ? "font-bold text-ink"
                                          : "text-muted"
                                      }
                                    >
                                      {s.dinner}
                                    </span>
                                  </td>
                                )}
                                <td className="text-center py-2 px-3 font-bold text-teal">
                                  {personTotal}
                                </td>
                                {selectedPeriod.selection_type === "weekday" && (
                                  <td className="text-center py-2 px-3 font-bold text-navy">
                                    {personTotal * occ}
                                  </td>
                                )}
                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* 신청자 매트릭스 테이블 */}
                <div className="bg-white border border-rule">
                  <div className="px-4 py-3 border-b border-rule bg-stone">
                    <h3 className="text-body font-bold text-ink">
                      신청자 현황
                    </h3>
                  </div>

                  {isLoadingApps ? (
                    <div className="p-4 space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="p-12 text-center text-muted">
                      <p className="text-body">아직 신청이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-secondary">
                        <thead className="bg-stone sticky top-0">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-medium text-muted whitespace-nowrap sticky left-0 bg-stone z-10">
                              이름
                            </th>
                            <th className="px-3 py-2.5 text-left font-medium text-muted whitespace-nowrap">
                              학교
                            </th>
                            {selectionKeys.map((key) => (
                              <th
                                key={key}
                                className="px-2 py-2.5 text-center font-medium text-muted whitespace-nowrap"
                              >
                                {getKeyLabel(key)}
                              </th>
                            ))}
                            <th className="px-3 py-2.5 text-center font-bold text-ink whitespace-nowrap">
                              합계
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rule">
                          {applications.map((app) => {
                            const sel = app.selections as Record<
                              string,
                              string[]
                            >;
                            const totalCount =
                              selectedPeriod.selection_type === "weekday"
                                ? calcWeekdayMealCount(
                                    sel,
                                    selectedPeriod.start_date,
                                    selectedPeriod.end_date
                                  )
                                : Object.values(sel).reduce(
                                    (acc, m) => acc + m.length,
                                    0
                                  );

                            return (
                              <tr
                                key={app.id}
                                className="hover:bg-stone/30 transition-colors duration-200"
                              >
                                <td className="px-4 py-2.5 font-medium text-ink whitespace-nowrap sticky left-0 bg-white z-10">
                                  {app.student?.name || "알 수 없음"}
                                </td>
                                <td className="px-3 py-2.5 text-muted whitespace-nowrap">
                                  {app.student?.school || "-"}
                                  {app.student?.grade
                                    ? ` ${app.student.grade}`
                                    : ""}
                                </td>
                                {selectionKeys.map((key) => {
                                  const meals = sel[key] || [];
                                  const hasLunch = meals.includes("lunch");
                                  const hasDinner = meals.includes("dinner");

                                  return (
                                    <td
                                      key={key}
                                      className="px-2 py-2.5 text-center"
                                    >
                                      {meals.length > 0 ? (
                                        <span className="inline-flex items-center gap-0.5 text-caption font-medium">
                                          {hasLunch && (
                                            <span className="px-1 py-0.5 bg-teal/10 text-teal">
                                              중
                                            </span>
                                          )}
                                          {hasDinner && (
                                            <span className="px-1 py-0.5 bg-navy/10 text-navy">
                                              석
                                            </span>
                                          )}
                                        </span>
                                      ) : (
                                        <span className="text-rule">-</span>
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="px-3 py-2.5 text-center font-bold text-ink">
                                  {totalCount}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 미신청 학생 */}
                {unappliedStudents.length > 0 && (
                  <div className="bg-white border border-rule">
                    <div className="px-4 py-3 border-b border-rule bg-stone flex items-center gap-2">
                      <UserX size={14} className="text-muted" />
                      <h3 className="text-body font-bold text-ink">
                        미신청 학생 ({unappliedStudents.length}명)
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {unappliedStudents.map((student) => (
                          <span
                            key={student.id}
                            className="text-small px-2.5 py-1 bg-stone text-ink"
                          >
                            {student.name}
                            {student.school && (
                              <span className="text-muted ml-1">
                                {student.school}
                                {student.grade ? ` ${student.grade}` : ""}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-rule p-12 text-center text-muted">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-reading">기간을 선택하세요</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 기간 생성/수정 모달 (RHF + Zod) */}
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

// ─────────────────────────────────────────────
// 기간 생성/수정 모달 (react-hook-form + zod)
// ─────────────────────────────────────────────
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateMealPeriodInput>({
    resolver: zodResolver(createMealPeriodSchema),
    defaultValues: {
      title: period?.title || "",
      apply_start_date: period?.apply_start_date || "",
      apply_end_date: period?.apply_end_date || "",
      start_date: period?.start_date || "",
      end_date: period?.end_date || "",
      meal_types: period?.meal_types || ["lunch", "dinner"],
      selection_type: period?.selection_type || "weekday",
      is_active: period?.is_active ?? true,
    },
  });

  const mealTypes = watch("meal_types");
  const selectionType = watch("selection_type");
  const isActive = watch("is_active");

  const toggleMealType = (type: "lunch" | "dinner") => {
    const current = mealTypes || [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setValue("meal_types", next as ("lunch" | "dinner")[], {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: CreateMealPeriodInput) => {
    const supabase = createClient();
    const result = period
      ? await updatePeriod(supabase, period.id, data)
      : await createPeriod(supabase, data);

    if (result.success) {
      showToast(
        period ? "기간이 수정되었습니다." : "기간이 생성되었습니다.",
        "success"
      );
      onSave();
    } else {
      showToast(result.error || "오류가 발생했습니다.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <h2 className="text-subhead font-bold text-ink">
            {period ? "기간 수정" : "새 기간 생성"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-ink transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* 기간명 */}
          <div>
            <label className="block text-secondary font-medium text-ink mb-1">
              기간명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="예: 2024년 1월 도시락"
              className={`w-full px-3 py-2 border text-body focus:border-navy focus:outline-none ${
                errors.title ? "border-red-500" : "border-rule"
              }`}
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 text-small text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* 접수 기간 */}
          <div>
            <label className="block text-secondary font-medium text-ink mb-2">
              접수 기간 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-caption text-muted mb-1">시작일</label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 border text-body focus:border-navy focus:outline-none ${
                    errors.apply_start_date ? "border-red-500" : "border-rule"
                  }`}
                  {...register("apply_start_date")}
                />
                {errors.apply_start_date && (
                  <p className="mt-1 text-small text-red-500">
                    {errors.apply_start_date.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-caption text-muted mb-1">종료일</label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 border text-body focus:border-navy focus:outline-none ${
                    errors.apply_end_date ? "border-red-500" : "border-rule"
                  }`}
                  {...register("apply_end_date")}
                />
                {errors.apply_end_date && (
                  <p className="mt-1 text-small text-red-500">
                    {errors.apply_end_date.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 도시락 기간 */}
          <div>
            <label className="block text-secondary font-medium text-ink mb-2">
              도시락 기간 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-caption text-muted mb-1">시작일</label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 border text-body focus:border-navy focus:outline-none ${
                    errors.start_date ? "border-red-500" : "border-rule"
                  }`}
                  {...register("start_date")}
                />
                {errors.start_date && (
                  <p className="mt-1 text-small text-red-500">
                    {errors.start_date.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-caption text-muted mb-1">종료일</label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 border text-body focus:border-navy focus:outline-none ${
                    errors.end_date ? "border-red-500" : "border-rule"
                  }`}
                  {...register("end_date")}
                />
                {errors.end_date && (
                  <p className="mt-1 text-small text-red-500">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 식사 유형 */}
          <div>
            <label className="block text-secondary font-medium text-ink mb-2">
              식사 유형 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => toggleMealType("lunch")}
                className={`flex items-center gap-2 px-4 py-2 border text-body transition-colors cursor-pointer ${
                  mealTypes?.includes("lunch")
                    ? "bg-teal/10 border-teal text-teal font-medium"
                    : "border-rule text-muted hover:border-teal"
                }`}
              >
                {mealTypes?.includes("lunch") && <Check size={14} />}
                중식
              </button>
              <button
                type="button"
                onClick={() => toggleMealType("dinner")}
                className={`flex items-center gap-2 px-4 py-2 border text-body transition-colors cursor-pointer ${
                  mealTypes?.includes("dinner")
                    ? "bg-navy/10 border-navy text-navy font-medium"
                    : "border-rule text-muted hover:border-navy"
                }`}
              >
                {mealTypes?.includes("dinner") && <Check size={14} />}
                석식
              </button>
            </div>
            {errors.meal_types && (
              <p className="mt-1 text-small text-red-500">
                {errors.meal_types.message}
              </p>
            )}
          </div>

          {/* 선택 방식 */}
          <div>
            <label className="block text-secondary font-medium text-ink mb-2">
              선택 방식
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValue("selection_type", "weekday")}
                className={`flex-1 py-2 border text-body text-center transition-colors cursor-pointer ${
                  selectionType === "weekday"
                    ? "bg-navy text-white border-navy font-medium"
                    : "border-rule text-muted hover:border-navy"
                }`}
              >
                요일별
              </button>
              <button
                type="button"
                onClick={() => setValue("selection_type", "date")}
                className={`flex-1 py-2 border text-body text-center transition-colors cursor-pointer ${
                  selectionType === "date"
                    ? "bg-navy text-white border-navy font-medium"
                    : "border-rule text-muted hover:border-navy"
                }`}
              >
                날짜별
              </button>
            </div>
          </div>

          {/* 활성화 */}
          <div>
            <button
              type="button"
              onClick={() => setValue("is_active", !isActive)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div
                className={`w-5 h-5 flex items-center justify-center border transition-colors ${
                  isActive
                    ? "bg-teal border-teal text-white"
                    : "border-rule"
                }`}
              >
                {isActive && <Check size={14} />}
              </div>
              <span className="text-body text-ink">
                활성화 (학생이 신청 가능)
              </span>
            </button>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-navy text-white text-body font-medium hover:bg-navy-d transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "저장 중..."
                : period
                  ? "수정"
                  : "생성"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-rule text-ink text-body hover:border-navy transition-colors cursor-pointer"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
