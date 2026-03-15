"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Nav, Footer, Button, useToast, Skeleton, AvatarUploader } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { signOut, updateAvatar } from "@/domains/user/service";
import { useUserStore } from "@/stores/useUserStore";
import { ROUTES, CONTACT } from "@/lib/constants";
import { getStudentMealPlan, submitApplication } from "@/domains/meal/service";
import {
  type MealPeriod,
  type MealApplication,
  MEAL_TYPE_LABELS,
  WEEKDAY_LABELS,
} from "@/domains/meal/model";
import {
  User,
  Phone,
  School,
  LogOut,
  Bell,
  HelpCircle,
  ChevronRight,
  Shield,
  UtensilsCrossed,
  Calendar,
  Check,
  MessageCircle,
  Clock,
  CheckCircle,
  Globe,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { getMyQuestions } from "@/domains/question/service";
import { type QuestionWithAuthor } from "@/domains/question/model";

export default function MyPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "lunch" | "questions">("profile");
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { profile, isActive, logout: logoutStore, setProfile } = useUserStore();

  // 아바타 업데이트 핸들러
  const handleAvatarUpload = async (url: string | null) => {
    if (!profile?.id) return;

    const supabase = createClient();
    const result = await updateAvatar(supabase, profile.id, url);

    if (result.success && result.profile) {
      setProfile(result.profile);
      success(url ? "프로필 이미지가 변경되었습니다." : "프로필 이미지가 삭제되었습니다.");
    } else {
      showError(result.error || "프로필 이미지 변경에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      const result = await signOut(supabase);

      if (result.success) {
        logoutStore();
        success("로그아웃되었습니다.");
        router.push(ROUTES.HOME);
      } else {
        showError(result.error || "로그아웃에 실패했습니다.");
      }
    } catch {
      showError("로그아웃 중 오류가 발생했습니다.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const statusLabel = {
    pending: "승인 대기",
    active: "활성",
    inactive: "비활성",
  };

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    active: "bg-teal/10 text-teal",
    inactive: "bg-red-100 text-red-600",
  };

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20 bg-stone min-h-screen">
        <div className="max-w-lg mx-auto px-6 py-8">
          {/* 프로필 헤더 */}
          <div className="bg-white border border-rule p-6 mb-6">
            <div className="flex items-center gap-4">
              {/* 아바타 */}
              <AvatarUploader
                userId={profile?.id || ""}
                currentUrl={profile?.avatar_url}
                onUpload={handleAvatarUpload}
                size="sm"
              />

              {/* 정보 */}
              <div className="flex-1">
                <h1 className="font-serif text-xl font-bold text-ink">
                  {profile?.name || "사용자"}
                </h1>
                <p className="text-[13px] text-muted mt-1">
                  {profile?.school || "학교 미등록"}
                  {profile?.grade && ` ${profile.grade}학년`}
                </p>
                <span
                  className={`inline-block mt-2 text-[11px] font-medium px-2 py-0.5 ${
                    statusColor[profile?.status as keyof typeof statusColor] ||
                    statusColor.pending
                  }`}
                >
                  {statusLabel[profile?.status as keyof typeof statusLabel] ||
                    "알 수 없음"}
                </span>
              </div>
            </div>

            {/* 승인 대기 안내 */}
            {!isActive && (
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                <p className="text-[13px] text-yellow-700">
                  관리자 승인 후 모든 기능을 이용하실 수 있습니다.
                </p>
              </div>
            )}
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex border-b border-rule mb-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[14px] font-medium border-b-2 transition-colors ${
                activeTab === "profile"
                  ? "border-navy text-navy"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <User size={16} />
              내 정보
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              disabled={!isActive}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[14px] font-medium border-b-2 transition-colors ${
                activeTab === "questions"
                  ? "border-navy text-navy"
                  : "border-transparent text-muted hover:text-ink"
              } ${!isActive ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <MessageCircle size={16} />
              내 질문
            </button>
            <button
              onClick={() => setActiveTab("lunch")}
              disabled={!isActive}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[14px] font-medium border-b-2 transition-colors ${
                activeTab === "lunch"
                  ? "border-navy text-navy"
                  : "border-transparent text-muted hover:text-ink"
              } ${!isActive ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <UtensilsCrossed size={16} />
              도시락
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          {activeTab === "profile" ? (
            <>
              {/* 내 정보 */}
              <div className="bg-white border border-rule mb-6">
                <div className="p-4 border-b border-rule">
                  <h2 className="font-bold text-ink">내 정보</h2>
                </div>
                <div className="divide-y divide-rule">
                  <InfoRow
                    icon={<User size={18} />}
                    label="이름"
                    value={profile?.name || "-"}
                  />
                  <InfoRow
                    icon={<Phone size={18} />}
                    label="연락처"
                    value={formatPhone(profile?.phone) || "-"}
                  />
                  <InfoRow
                    icon={<School size={18} />}
                    label="학교"
                    value={
                      profile?.school
                        ? `${profile.school} ${profile.grade || ""}학년`
                        : "-"
                    }
                  />
                  <InfoRow
                    icon={<Phone size={18} />}
                    label="학부모 연락처"
                    value={formatPhone(profile?.parent_phone) || "-"}
                  />
                </div>
              </div>

              {/* 메뉴 */}
              <div className="bg-white border border-rule mb-6">
                <MenuItem
                  icon={<Bell size={18} />}
                  label="알림 설정"
                  href="#"
                  disabled
                />
                <MenuItem
                  icon={<HelpCircle size={18} />}
                  label="문의하기"
                  href={CONTACT.kakaoChannel}
                  external
                />
                <MenuItem
                  icon={<Shield size={18} />}
                  label="개인정보처리방침"
                  href={ROUTES.PRIVACY}
                />
              </div>

              {/* 로그아웃 */}
              <Button
                variant="ghost"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleLogout}
                isLoading={isLoggingOut}
              >
                <LogOut size={16} />
                로그아웃
              </Button>
            </>
          ) : activeTab === "questions" ? (
            <MyQuestionsTab />
          ) : (
            <LunchTab userId={profile?.id} />
          )}

          {/* 버전 정보 */}
          <p className="text-center text-[12px] text-muted/50 mt-8">
            스터디코어 1.0 v1.0.0
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <span className="text-muted">{icon}</span>
      <span className="text-[13px] text-muted w-24">{label}</span>
      <span className="text-[14px] text-ink flex-1">{value}</span>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  href,
  external,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  external?: boolean;
  disabled?: boolean;
}) {
  const className =
    "flex items-center gap-4 px-4 py-4 border-b border-rule last:border-b-0 hover:bg-stone/50 transition-colors";

  if (disabled) {
    return (
      <div className={`${className} opacity-50 cursor-not-allowed`}>
        <span className="text-muted">{icon}</span>
        <span className="text-[14px] text-ink flex-1">{label}</span>
        <span className="text-[11px] text-muted">준비 중</span>
      </div>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <span className="text-muted">{icon}</span>
        <span className="text-[14px] text-ink flex-1">{label}</span>
        <ChevronRight size={16} className="text-rule" />
      </a>
    );
  }

  return (
    <a href={href} className={className}>
      <span className="text-muted">{icon}</span>
      <span className="text-[14px] text-ink flex-1">{label}</span>
      <ChevronRight size={16} className="text-rule" />
    </a>
  );
}

function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// 도시락 신청 탭 컴포넌트
function LunchTab({ userId }: { userId?: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<MealPeriod | null>(null);
  const [application, setApplication] = useState<MealApplication | null>(null);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    async function fetchLunchData() {
      if (!userId) return;

      setIsLoading(true);
      const supabase = createClient();
      const result = await getStudentMealPlan(supabase, userId);

      if (result.success && result.period) {
        setPeriod(result.period);
        if (result.application) {
          setApplication(result.application);
          setSelections(result.application.selections as Record<string, string[]>);
        }
      }
      setIsLoading(false);
    }

    fetchLunchData();
  }, [userId]);

  const handleToggleMeal = (key: string, mealType: string) => {
    setSelections((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(mealType)
        ? current.filter((m) => m !== mealType)
        : [...current, mealType];

      // 빈 배열이면 키 삭제
      if (updated.length === 0) {
        const { [key]: removed, ...rest } = prev;
        void removed;
        return rest;
      }

      return { ...prev, [key]: updated };
    });
  };

  const handleSave = async () => {
    if (!userId || !period) return;

    setIsSaving(true);
    const supabase = createClient();
    const result = await submitApplication(supabase, period.id, userId, selections);

    setIsSaving(false);

    if (result.success) {
      setApplication(result.application || null);
      showSuccess("도시락 신청이 저장되었습니다.");
    } else {
      showError(result.error || "저장에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!period) {
    return (
      <div className="bg-white border border-rule p-8 text-center">
        <Calendar size={48} className="mx-auto mb-4 text-muted opacity-50" />
        <p className="text-[15px] text-muted">
          현재 도시락 신청 기간이 아닙니다.
        </p>
      </div>
    );
  }

  const isWeekday = period.selection_type === "weekday";

  return (
    <div className="space-y-4">
      {/* 기간 정보 */}
      <div className="bg-white border border-rule p-4">
        <div className="flex items-center gap-2 text-[14px] font-medium text-ink">
          <Calendar size={16} className="text-teal" />
          {period.title}
        </div>
        <p className="text-[13px] text-muted mt-1">
          {period.start_date} ~ {period.end_date}
        </p>
        {application && (
          <div className="mt-2 flex items-center gap-1 text-[12px] text-teal">
            <Check size={12} />
            신청 완료 ({new Date(application.updated_at).toLocaleDateString("ko-KR")} 수정)
          </div>
        )}
      </div>

      {/* 선택 UI */}
      <div className="bg-white border border-rule">
        <div className="p-4 border-b border-rule">
          <h3 className="font-bold text-ink">
            {isWeekday ? "요일별 선택" : "날짜별 선택"}
          </h3>
          <p className="text-[12px] text-muted mt-1">
            원하는 {isWeekday ? "요일" : "날짜"}과 식사를 선택하세요.
          </p>
        </div>

        {isWeekday ? (
          // 요일별 선택
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => (
              <div
                key={day}
                className="flex items-center gap-4 py-2 border-b border-rule last:border-b-0"
              >
                <span className="w-8 text-[14px] font-medium text-ink">
                  {WEEKDAY_LABELS[day]}
                </span>
                <div className="flex gap-2 flex-1">
                  {period.meal_types.map((type) => {
                    const isSelected = selections[day.toString()]?.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => handleToggleMeal(day.toString(), type)}
                        className={`flex-1 py-2 text-[13px] font-medium border transition-colors ${
                          isSelected
                            ? "bg-teal border-teal text-white"
                            : "border-rule text-muted hover:border-teal hover:text-teal"
                        }`}
                      >
                        {MEAL_TYPE_LABELS[type as keyof typeof MEAL_TYPE_LABELS]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 날짜별 선택 (간단한 날짜 목록)
          <div className="p-4">
            <DateSelector
              startDate={period.start_date}
              endDate={period.end_date}
              mealTypes={period.meal_types}
              selections={selections}
              onToggle={handleToggleMeal}
            />
          </div>
        )}
      </div>

      {/* 저장 버튼 */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleSave}
        isLoading={isSaving}
      >
        {application ? "수정하기" : "신청하기"}
      </Button>
    </div>
  );
}

// 날짜별 선택 컴포넌트
function DateSelector({
  startDate,
  endDate,
  mealTypes,
  selections,
  onToggle,
}: {
  startDate: string;
  endDate: string;
  mealTypes: string[];
  selections: Record<string, string[]>;
  onToggle: (date: string, mealType: string) => void;
}) {
  // 날짜 목록 생성
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      {dates.map((date) => {
        const dayOfWeek = new Date(date).getDay();
        const formattedDate = new Date(date).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        });

        return (
          <div
            key={date}
            className="flex items-center gap-4 py-2 border-b border-rule last:border-b-0"
          >
            <span className="w-20 text-[13px] text-ink">
              {formattedDate} ({WEEKDAY_LABELS[dayOfWeek]})
            </span>
            <div className="flex gap-2 flex-1">
              {mealTypes.map((type) => {
                const isSelected = selections[date]?.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => onToggle(date, type)}
                    className={`flex-1 py-2 text-[12px] font-medium border transition-colors ${
                      isSelected
                        ? "bg-teal border-teal text-white"
                        : "border-rule text-muted hover:border-teal hover:text-teal"
                    }`}
                  >
                    {MEAL_TYPE_LABELS[type as keyof typeof MEAL_TYPE_LABELS]}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 내 질문 탭 컴포넌트
function MyQuestionsTab() {
  const [questions, setQuestions] = useState<QuestionWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMyQuestions() {
      setIsLoading(true);
      const supabase = createClient();
      const result = await getMyQuestions(supabase);

      if (result.success) {
        setQuestions(result.questions);
      }
      setIsLoading(false);
    }

    fetchMyQuestions();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-rule p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white border border-rule p-8 text-center">
        <MessageCircle size={48} className="mx-auto mb-4 text-muted opacity-50" />
        <p className="text-[15px] text-muted mb-4">
          작성한 질문이 없습니다.
        </p>
        <Link href={ROUTES.QUESTIONS + "/new"}>
          <Button variant="primary" size="sm">
            질문하기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] text-muted">
          총 {questions.length}개
        </span>
        <Link
          href={ROUTES.QUESTIONS}
          className="text-[13px] text-teal hover:underline"
        >
          질문방 바로가기
        </Link>
      </div>

      {questions.map((question) => {
        const isAnswered = question.status === "answered";
        const isPublic = question.is_public;

        return (
          <Link
            key={question.id}
            href={`${ROUTES.QUESTIONS}/${question.id}`}
            className="block bg-white border border-rule p-4 hover:border-navy transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              {/* 상태 뱃지 */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 ${
                  isAnswered
                    ? "bg-teal/10 text-teal"
                    : "bg-stone text-muted"
                }`}
              >
                {isAnswered ? (
                  <>
                    <CheckCircle size={10} />
                    답변 완료
                  </>
                ) : (
                  <>
                    <Clock size={10} />
                    답변 대기
                  </>
                )}
              </span>
              {/* 공개/비공개 뱃지 */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 ${
                  isPublic
                    ? "bg-navy/5 text-navy"
                    : "bg-stone text-muted"
                }`}
              >
                {isPublic ? (
                  <>
                    <Globe size={10} />
                    공개
                  </>
                ) : (
                  <>
                    <Lock size={10} />
                    비공개
                  </>
                )}
              </span>
            </div>
            <h3 className="text-[14px] font-medium text-ink truncate">
              {question.title}
            </h3>
            <p className="text-[12px] text-muted mt-1">
              {new Date(question.created_at).toLocaleDateString("ko-KR")}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
