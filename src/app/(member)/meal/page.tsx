"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Nav, Footer, Button, Skeleton, useToast } from "@/components/common";
import { WeekdaySelector, DateSelector } from "@/components/meal";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import {
  getStudentMealPlan,
  submitApplication,
  calcWeekdayMealCount,
} from "@/domains/meal/service";
import {
  type MealPeriod,
  type MealApplication,
  type MealTypeValue,
  MEAL_TYPE_LABELS,
} from "@/domains/meal/model";
import { UtensilsCrossed, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function LunchPage() {
  const router = useRouter();
  const { user, profile, isLoading: isAuthLoading } = useUserStore();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<MealPeriod | null>(null);
  const [application, setApplication] = useState<MealApplication | null>(null);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // 로그인 체크
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthLoading, user, router]);

  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);
      const supabase = createClient();
      const result = await getStudentMealPlan(supabase, user.id);

      if (result.success) {
        setPeriod(result.period || null);
        setApplication(result.application || null);
        if (result.application?.selections) {
          setSelections(result.application.selections as Record<string, string[]>);
        }
      } else {
        setError(result.error || "데이터를 불러올 수 없습니다.");
      }
      setIsLoading(false);
    }

    loadData();
  }, [user?.id]);

  // 변경 사항 감지
  useEffect(() => {
    if (!application) {
      // 신규 신청: 선택이 있으면 변경됨
      setHasChanges(Object.keys(selections).length > 0);
    } else {
      // 수정: 기존 선택과 비교
      const original = application.selections as Record<string, string[]>;
      const changed = JSON.stringify(original) !== JSON.stringify(selections);
      setHasChanges(changed);
    }
  }, [selections, application]);

  // 신청 제출
  const handleSubmit = async () => {
    if (!user?.id || !period) return;

    setIsSubmitting(true);
    const supabase = createClient();
    const result = await submitApplication(
      supabase,
      period.id,
      user.id,
      selections
    );

    setIsSubmitting(false);

    if (result.success) {
      setApplication(result.application || null);
      success(application ? "신청이 수정되었습니다." : "도시락 신청이 완료되었습니다.");
      setHasChanges(false);
    } else {
      showError(result.error || "신청에 실패했습니다.");
    }
  };

  // 선택 개수 계산 (메모이제이션)
  // 요일별: 도시락 기간 내 실제 식수, 날짜별: 선택한 날짜 수
  const selectionCount = useMemo(() => {
    if (period?.selection_type === "weekday" && period.start_date && period.end_date) {
      return calcWeekdayMealCount(selections, period.start_date, period.end_date);
    }
    return Object.values(selections).reduce((acc, meals) => acc + meals.length, 0);
  }, [selections, period]);

  // 비활성 사용자 체크
  if (profile?.status !== "active") {
    return (
      <>
        <Nav />
        <main className="pt-24 pb-20 min-h-screen bg-stone">
          <div className="max-w-2xl mx-auto px-6 py-12 text-center">
            <UtensilsCrossed size={48} className="mx-auto mb-4 text-muted opacity-50" />
            <h1 className="font-serif text-2xl font-bold text-ink mb-2">
              도시락 신청
            </h1>
            <p className="text-muted">
              도시락 신청은 승인된 재원생만 이용 가능합니다.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20 bg-stone">
        {/* 헤더 */}
        <section className="bg-navy py-12 px-6 md:px-13">
          <div className="max-w-3xl">
            <span className="font-mono text-label font-bold text-teal tracking-label uppercase block mb-3">
              Meal / 도시락 신청
            </span>
            <h1 className="font-serif text-[clamp(24px,4vw,36px)] font-bold text-white">
              도시락 신청
            </h1>
            <p className="mt-3 text-white/50 text-reading">
              원하는 요일과 식사를 선택해주세요.
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6 py-8">

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : error ? (
            /* 에러 상태 */
            <div className="bg-white border border-red-200 p-12 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
              <h2 className="text-subhead font-bold text-ink mb-2">
                오류가 발생했습니다
              </h2>
              <p className="text-body text-muted mb-4">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                다시 시도
              </Button>
            </div>
          ) : !period ? (
            /* 활성 기간 없음 */
            <div className="bg-white border border-rule p-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-muted opacity-50" />
              <h2 className="text-subhead font-bold text-ink mb-2">
                현재 신청 가능한 기간이 없습니다
              </h2>
              <p className="text-body text-muted">
                새로운 신청 기간이 열리면 공지사항을 통해 안내드리겠습니다.
              </p>
            </div>
          ) : (
            <>
              {/* 신청 완료 배너 */}
              {application && !hasChanges && (
                <div className="bg-teal/10 border border-teal p-4 mb-6 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-teal flex-shrink-0" />
                  <div>
                    <p className="text-body font-bold text-ink">
                      신청 완료 ({selectionCount}끼)
                    </p>
                    <p className="text-small text-muted">
                      {new Date(application.created_at).toLocaleDateString("ko-KR")} 신청
                      {application.updated_at !== application.created_at &&
                        ` · ${new Date(application.updated_at).toLocaleDateString("ko-KR")} 수정`}
                      {" · "}아래에서 변경할 수 있습니다.
                    </p>
                  </div>
                </div>
              )}

              {/* 기간 정보 */}
              <div className="bg-white border border-rule p-4 md:p-6 mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-subhead font-bold text-ink mb-1">
                      {period.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-secondary text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        도시락 {period.start_date} ~ {period.end_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        접수 {period.apply_start_date} ~ {period.apply_end_date}
                      </span>
                      <span>
                        {period.selection_type === "weekday" ? "요일별 선택" : "날짜별 선택"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {period.meal_types.map((type) => (
                      <span
                        key={type}
                        className="text-small px-2 py-1 bg-stone text-ink"
                      >
                        {MEAL_TYPE_LABELS[type as MealTypeValue]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 선택 UI */}
              <div className="mb-6">
                {period.selection_type === "weekday" ? (
                  <WeekdaySelector
                    mealTypes={period.meal_types as MealTypeValue[]}
                    value={selections}
                    onChange={setSelections}
                    disabled={isSubmitting}
                  />
                ) : (
                  <DateSelector
                    mealTypes={period.meal_types as MealTypeValue[]}
                    startDate={period.start_date}
                    endDate={period.end_date}
                    value={selections}
                    onChange={setSelections}
                    disabled={isSubmitting}
                  />
                )}
              </div>

              {/* 선택 상세 (inline) */}
              {selectionCount > 0 && (
                <div className="bg-white border border-rule p-4 mb-6">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selections)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([key, meals]) => (
                        <span
                          key={key}
                          className="text-small px-2 py-1 bg-stone text-ink"
                        >
                          {period.selection_type === "weekday"
                            ? ["일", "월", "화", "수", "목", "금", "토"][parseInt(key)]
                            : key}
                          : {meals.map((m) => MEAL_TYPE_LABELS[m as MealTypeValue]).join(", ")}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* 안내 */}
              <div className="p-4 bg-navy/5 border border-navy/10 mb-24">
                <h3 className="text-secondary font-bold text-ink mb-2">안내사항</h3>
                <ul className="text-small text-muted space-y-1">
                  <li>• 신청 기간 내에는 언제든 수정 가능합니다.</li>
                  <li>• 신청 기간이 종료되면 수정이 불가합니다.</li>
                  <li>• 문의사항은 관리실로 연락해주세요.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Sticky 하단 제출 바 */}
      {period && !isLoading && !error && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-rule px-6 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-body text-muted">선택</span>
              <span className="text-[18px] font-bold text-ink">
                {selectionCount}끼
              </span>
              {application && !hasChanges && (
                <span className="text-small text-teal font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  저장됨
                </span>
              )}
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!hasChanges || selectionCount === 0}
              className="min-w-[120px]"
            >
              {isSubmitting
                ? "저장 중..."
                : application
                ? hasChanges
                  ? "수정하기"
                  : "저장됨"
                : "신청하기"}
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
