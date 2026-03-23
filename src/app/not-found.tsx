import Link from "next/link";
import { Nav, Footer } from "@/components/common";
import { ROUTES, CONTACT } from "@/lib/constants";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="page-body min-h-screen flex items-center justify-center bg-stone">
        <div className="text-center px-6 max-w-md">
          {/* 404 숫자 */}
          <div className="font-mono text-[120px] font-bold text-navy/10 leading-none mb-4">
            404
          </div>

          {/* 제목 */}
          <h1 className="font-serif text-2xl font-bold text-ink mb-4">
            페이지를 찾을 수 없습니다
          </h1>

          {/* 설명 */}
          <p className="text-muted text-reading leading-relaxed mb-8">
            요청하신 페이지가 존재하지 않거나
            <br />
            주소가 변경되었을 수 있습니다.
          </p>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center justify-center bg-navy text-white text-body font-bold px-6 py-3 hover:bg-navy-dark transition-colors"
            >
              홈으로 돌아가기
            </Link>
            <Link
              href={ROUTES.CONSULT}
              className="inline-flex items-center justify-center border border-rule text-ink text-body font-medium px-6 py-3 hover:border-navy transition-colors"
            >
              상담 신청하기
            </Link>
          </div>

          {/* 문의 안내 */}
          <p className="mt-8 text-secondary text-muted">
            찾으시는 정보가 있다면{" "}
            <a
              href={CONTACT.kakaoChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal underline"
            >
              카카오 채널
            </a>
            로 문의해 주세요.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
