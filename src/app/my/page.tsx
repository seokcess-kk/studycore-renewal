"use client";

import { useState, useEffect } from "react";
import { Nav, Footer, Button, useToast, Skeleton, AvatarUploader } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { signOut, updateAvatar } from "@/domains/user/service";
import { useUserStore } from "@/stores/useUserStore";
import { ROUTES, CONTACT } from "@/lib/constants";
import {
  User,
  Phone,
  School,
  LogOut,
  Bell,
  HelpCircle,
  ChevronRight,
  Shield,
  MessageCircle,
  Clock,
  CheckCircle,
  Globe,
  Lock,
  Pencil,
  X,
  Save,
} from "lucide-react";
import Link from "next/link";
import { PasswordChangeForm } from "@/components/my/PasswordChangeForm";
import { getMyQuestions, fetchUnansweredCount } from "@/domains/question/service";
import { type QuestionWithAuthor } from "@/domains/question/model";

export default function MyPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "questions">("profile");
  const { success, error: showError } = useToast();
  const { profile, isActive, isStaff, logout: logoutStore, setProfile } = useUserStore();

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
    const supabase = createClient();
    await signOut(supabase);
    logoutStore();
    window.location.href = "/";
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
          </div>

          {/* 탭 컨텐츠 */}
          {activeTab === "profile" ? (
            <>
              {/* 스태프 질문 관리 바로가기 */}
              {isStaff && <StaffQuestionSummary />}

              {/* 내 정보 */}
              <ContactInfoSection />

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

              {/* 비밀번호 변경 (스태프 전용) */}
              {isStaff && <PasswordChangeForm />}

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
          ) : (
            <MyQuestionsTab />
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

// 연락처 정보 수정 섹션
function ContactInfoSection() {
  const { profile, setProfile } = useUserStore();
  const { success: showSuccess, error: showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || "");
  const [parentPhone, setParentPhone] = useState(profile?.parent_phone || "");

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        phone: phone.replace(/-/g, "") || null,
        parent_phone: parentPhone.replace(/-/g, "") || null,
      })
      .eq("id", profile?.id)
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      showError("연락처 수정에 실패했습니다.");
    } else {
      setProfile(data);
      showSuccess("연락처가 수정되었습니다.");
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white border border-rule mb-6">
      <div className="flex items-center justify-between p-4 border-b border-rule">
        <h2 className="font-bold text-ink">내 정보</h2>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPhone(profile?.phone || "");
                setParentPhone(profile?.parent_phone || "");
                setIsEditing(false);
              }}
              className="flex items-center gap-1 text-xs text-muted hover:text-ink"
            >
              <X size={14} />
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1 text-xs text-teal hover:text-teal-d font-medium disabled:opacity-50"
            >
              <Save size={14} />
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-xs text-muted hover:text-ink"
          >
            <Pencil size={14} />
            수정
          </button>
        )}
      </div>
      <div className="divide-y divide-rule">
        <InfoRow icon={<User size={18} />} label="이름" value={profile?.name || "-"} />

        {isEditing ? (
          <div className="flex items-center gap-4 px-4 py-3">
            <span className="text-muted"><Phone size={18} /></span>
            <span className="text-[13px] text-muted w-24">연락처</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="flex-1 border border-rule px-3 py-1.5 text-[14px] focus:border-navy focus:outline-none"
            />
          </div>
        ) : (
          <InfoRow icon={<Phone size={18} />} label="연락처" value={formatPhone(profile?.phone) || "-"} />
        )}

        <InfoRow
          icon={<School size={18} />}
          label="학교"
          value={profile?.school ? `${profile.school} ${profile.grade || ""}학년` : "-"}
        />

        {isEditing ? (
          <div className="flex items-center gap-4 px-4 py-3">
            <span className="text-muted"><Phone size={18} /></span>
            <span className="text-[13px] text-muted w-24">학부모 연락처</span>
            <input
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="flex-1 border border-rule px-3 py-1.5 text-[14px] focus:border-navy focus:outline-none"
            />
          </div>
        ) : (
          <InfoRow icon={<Phone size={18} />} label="학부모 연락처" value={formatPhone(profile?.parent_phone) || "-"} />
        )}
      </div>
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

// 스태프 전용: 미답변 질문 요약
function StaffQuestionSummary() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const result = await fetchUnansweredCount(supabase);
      setCount(result);
    }
    load();
  }, []);

  return (
    <Link
      href={ROUTES.QUESTIONS}
      className="block bg-white border border-rule p-4 mb-6 hover:border-navy transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal/10 flex items-center justify-center">
            <MessageCircle size={20} className="text-teal" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-ink">질문방 관리</p>
            <p className="text-[12px] text-muted">
              {count > 0
                ? `미답변 질문 ${count}개`
                : "모든 질문에 답변 완료"}
            </p>
          </div>
        </div>
        {count > 0 && (
          <span className="min-w-[24px] h-[24px] flex items-center justify-center bg-teal text-white text-[12px] font-bold px-2">
            {count}
          </span>
        )}
      </div>
    </Link>
  );
}
