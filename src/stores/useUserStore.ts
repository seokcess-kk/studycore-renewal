/**
 * 사용자 상태 관리 (Zustand)
 *
 * 전역 사용자 세션, 프로필, 역할 상태 관리
 * ⚠️ persist 제거 - Supabase 세션을 Single Source of Truth로 사용
 */

import { create } from "zustand";
import type { Profile, UserRoleType, UserStatusType } from "@/domains/user/model";
import { isStaffRole, hasAdminAccess, isAdmin, isMentor, USER_STATUS } from "@/lib/constants";

// 프로필에서 역할 관련 상태 계산
function computeRoleState(profile: Profile | null) {
  return {
    role: profile?.role ?? null,
    status: profile?.status ?? null,
    isStaff: isStaffRole(profile?.role),
    isAdmin: isAdmin(profile?.role),
    isMentor: isMentor(profile?.role),
    canAccessAdmin: hasAdminAccess(profile?.role),
    isActive: profile?.status === USER_STATUS.ACTIVE,
  };
}

interface UserState {
  // 상태
  isLoading: boolean;
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
  } | null;
  profile: Profile | null;

  // 계산된 값
  role: UserRoleType | null;
  status: UserStatusType | null;
  isStaff: boolean;
  isAdmin: boolean;
  isMentor: boolean;
  canAccessAdmin: boolean; // admin 또는 mentor
  isActive: boolean;

  // 액션
  setLoading: (loading: boolean) => void;
  setUser: (user: { id: string; email: string } | null) => void;
  setProfile: (profile: Profile | null) => void;
  login: (user: { id: string; email: string }, profile: Profile) => void;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
  // 초기 상태
  isLoading: true,
  isAuthenticated: false,
  user: null,
  profile: null,
  role: null,
  status: null,
  isStaff: false,
  isAdmin: false,
  isMentor: false,
  canAccessAdmin: false,
  isActive: false,

  // 액션
  setLoading: (loading) => set({ isLoading: loading }),

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setProfile: (profile) =>
    set({
      profile,
      ...computeRoleState(profile),
    }),

  login: (user, profile) =>
    set({
      isLoading: false,
      isAuthenticated: true,
      user,
      profile,
      ...computeRoleState(profile),
    }),

  logout: () =>
    set({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      profile: null,
      role: null,
      status: null,
      isStaff: false,
      isAdmin: false,
      isMentor: false,
      canAccessAdmin: false,
      isActive: false,
    }),

  updateProfile: (updates) => {
    const currentProfile = get().profile;
    if (!currentProfile) return;

    const newProfile = { ...currentProfile, ...updates };
    set({
      profile: newProfile,
      ...computeRoleState(newProfile),
    });
  },
}));
