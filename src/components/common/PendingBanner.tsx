"use client";

import { useUserStore } from "@/stores/useUserStore";
import { CONTACT } from "@/lib/constants";

export function PendingBanner() {
  const profile = useUserStore((state) => state.profile);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  if (!isAuthenticated || !profile || profile.status !== "pending") return null;

  return (
    <div className="bg-navy text-white px-6 py-3 text-center text-secondary">
      가입 신청이 접수되었습니다. 관리자 승인 후 서비스를 이용하실 수 있습니다.{" "}
      <a
        href={CONTACT.kakaoChannel}
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal underline ml-2 cursor-pointer"
      >
        문의하기
      </a>
    </div>
  );
}
