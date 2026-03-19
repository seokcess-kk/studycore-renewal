/**
 * 스터디코어 1.0 상수 정의
 */

// 사이트 정보
export const SITE = {
  name: "스터디코어 1.0",
  tagline: "구조가 성적을 만든다",
  description:
    "광주 광산구 관리형 독서실 - 교시제, 수학 멘토 질문방, 원장 직접 관리",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const;

// 연락처 정보
export const CONTACT = {
  phone: "010-4408-3790",
  email: "studycore10@naver.com",
  address: "광주광역시 광산구 임방울대로 330 애플타워 10층",
  kakaoChannel: "http://pf.kakao.com/_execQn",
  kakaoChatChannel: "http://pf.kakao.com/_execQn/chat",
} as const;

// 계정 역할
export const ROLES = {
  STUDENT: "student",
  ASSISTANT: "assistant",
  MENTOR: "mentor",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// 역할 그룹
export const STAFF_ROLES = [
  ROLES.ADMIN,
  ROLES.MENTOR,
  ROLES.ASSISTANT,
] as const;

export const ADMIN_ACCESS_ROLES = [ROLES.ADMIN, ROLES.MENTOR] as const;

// 역할 체크 헬퍼 함수
export function isStaffRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return (STAFF_ROLES as readonly string[]).includes(role);
}

export function hasAdminAccess(role: string | null | undefined): boolean {
  if (!role) return false;
  return (ADMIN_ACCESS_ROLES as readonly string[]).includes(role);
}

export function isAdmin(role: string | null | undefined): boolean {
  return role === ROLES.ADMIN;
}

export function isMentor(role: string | null | undefined): boolean {
  return role === ROLES.MENTOR;
}

export function isAssistant(role: string | null | undefined): boolean {
  return role === ROLES.ASSISTANT;
}

export function isStudent(role: string | null | undefined): boolean {
  return role === ROLES.STUDENT;
}

// 계정 상태 (재원생만)
export const USER_STATUS = {
  PENDING: "pending", // 승인 대기
  ACTIVE: "active", // 활성
  INACTIVE: "inactive", // 비활성
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

// 상담 유형
export const CONSULT_TYPES = [
  { value: "admission", label: "입소 상담" },
  { value: "tour", label: "시설 견학" },
  { value: "program", label: "프로그램 문의" },
  { value: "etc", label: "기타" },
] as const;

// 공지 카테고리
export const NOTICE_CATEGORIES = {
  GENERAL: "general",
  URGENT: "urgent",
  MATERIAL: "material",
  SCHEDULE: "schedule",
  EVENT: "event",
} as const;

// 질문 상태
export const QUESTION_STATUS = {
  PENDING: "pending",
  ANSWERED: "answered",
} as const;

// 상담 기록 유형
export const COUNSELING_TYPES = {
  ADMISSION: "admission", // 진학
  CAREER: "career", // 진로
  ETC: "etc", // 기타
} as const;

// 라우트 경로
export const ROUTES = {
  // 공개
  HOME: "/",
  SYSTEM: "/system",
  BLOG: "/blog",
  CONSULT: "/consult",
  ABOUT: "/about",
  REVIEWS: "/reviews",
  TERMS: "/terms",
  PRIVACY: "/privacy",

  // 로그인 필요
  LOGIN: "/login",
  GUIDE: "/guide",
  MANUAL: "/manual",
  NOTICES: "/notices",
  QUESTIONS: "/questions",
  MEAL: "/meal",
  MY: "/my",

  // 어드민
  ADMIN: "/admin",
  ADMIN_MEMBERS: "/admin/members",
  ADMIN_NOTICES: "/admin/notices",
  ADMIN_QUESTIONS: "/admin/questions",
  ADMIN_BLOG: "/admin/blog",
  ADMIN_MEAL: "/admin/meal",
  ADMIN_KAKAO: "/admin/kakao",
  ADMIN_GUIDE: "/admin/guide",
  ADMIN_SETTINGS: "/admin/settings",
} as const;

// 보호된 라우트 (로그인 필요)
export const PROTECTED_ROUTES = [
  "/guide",
  "/manual",
  "/notices",
  "/questions",
  "/meal",
  "/my",
] as const;

// 어드민 라우트 (admin 역할 필요)
export const ADMIN_ROUTES = ["/admin"] as const;

// 조교 온보딩 라우트 (assistant 또는 admin 역할 필요)
export const ASSISTANT_ROUTES = [] as const;

// 카카오 API
export const KAKAO = {
  MAP_API_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "",
  CHANNEL_URL: CONTACT.kakaoChannel,
} as const;

// 학원 위치 정보
export const LOCATION = {
  lat: 35.189430,
  lng: 126.824053,
  name: "스터디코어 1.0",
  address: "광주광역시 광산구 임방울대로 330 애플타워 10층",
} as const;

// 세션 설정
export const SESSION = {
  WARNING_BEFORE_EXPIRY: 10 * 60 * 1000, // 만료 10분 전 경고
  CHECK_INTERVAL: 60 * 1000, // 1분마다 체크
} as const;
