"use client";

import Link from "next/link";
import { Nav, Footer, Button } from "@/components/common";
import { ROUTES, CONTACT } from "@/lib/constants";
import { useUserStore } from "@/stores/useUserStore";

export default function PendingApprovalPage() {
  const profile = useUserStore((state) => state.profile);
  // 접근 제어는 middleware에서 서버 판정 (클라이언트 리다이렉트 불필요)

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20 min-h-screen bg-stone">
        <div className="max-w-md mx-auto px-6 py-12">
          <div className="bg-white border border-rule p-8 text-center">
            {/* 아이콘 */}
            <div className="w-16 h-16 mx-auto mb-6 bg-teal/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-teal"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* 제목 */}
            <h1 className="font-serif text-2xl font-bold text-ink mb-4">
              승인 대기 중
            </h1>

            {/* 설명 */}
            <p className="text-muted text-body leading-relaxed mb-6">
              재원생 등록 신청이 접수되었습니다.
              <br />
              관리자 승인 후 서비스 이용이 가능합니다.
            </p>

            {/* 안내 박스 */}
            <div className="bg-stone p-4 mb-6 text-left">
              <p className="text-secondary text-muted mb-2">
                <strong className="text-ink">이름:</strong> {profile?.name || "-"}
              </p>
              <p className="text-secondary text-muted mb-2">
                <strong className="text-ink">연락처:</strong> {profile?.phone || "-"}
              </p>
              <p className="text-secondary text-muted">
                <strong className="text-ink">상태:</strong>{" "}
                <span className="text-teal">승인 대기</span>
              </p>
            </div>

            {/* 안내 */}
            <p className="text-secondary text-muted mb-6">
              승인은 보통 1~2일 내에 완료됩니다.
              <br />
              문의사항은 아래 채널로 연락해 주세요.
            </p>

            {/* 버튼 */}
            <div className="space-y-3">
              <a
                href={CONTACT.kakaoChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="primary" size="lg" className="w-full">
                  카카오 채널 문의
                </Button>
              </a>
              <Link href={ROUTES.HOME}>
                <Button variant="ghost" size="lg" className="w-full">
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
