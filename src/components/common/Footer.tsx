import Link from "next/link";
import Image from "next/image";
import { CONTACT, ROUTES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-navy-dark px-6 md:px-13 py-13 border-t border-teal/10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* 브랜드 */}
        <div className="text-center md:text-left">
          <div className="font-mono text-label text-on-dark-muted tracking-label uppercase mb-1">
            Managed Study Hall · Since 2026
          </div>
          <div className="font-mono text-body font-bold text-on-dark-muted tracking-label">
            STUDYCORE 1.0
          </div>
        </div>

        {/* 로고 (중앙) */}
        <div className="flex justify-center">
          <Image
            src="/logo-light.png"
            alt="STUDYCORE"
            width={160}
            height={42}
            className="h-8 w-auto opacity-40"
          />
        </div>

        {/* 링크 및 연락처 */}
        <div className="text-center md:text-right">
          <div className="flex justify-center md:justify-end gap-5 mb-2.5">
            <Link
              href={ROUTES.TERMS}
              className="text-caption text-on-dark-muted hover:text-white/80 transition-colors"
            >
              이용약관
            </Link>
            <Link
              href={ROUTES.PRIVACY}
              className="text-caption text-on-dark-muted hover:text-white/80 transition-colors"
            >
              개인정보처리방침
            </Link>
          </div>
          <div className="text-caption text-on-dark-muted font-light leading-prose">
            {CONTACT.phone} · {CONTACT.email}
            <br />
            대표자: 정원석 · 사업자등록번호: 488-29-01855
            <br />© 2026 STUDYCORE 1.0. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
