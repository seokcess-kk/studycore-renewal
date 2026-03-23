import { Metadata } from "next";
import { Nav, Footer } from "@/components/common";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "스터디코어 1.0 개인정보처리방침",
  alternates: {
    canonical: "https://studycore.kr/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="page-body">
        {/* 헤더 */}
        <section className="bg-stone section-sm px-6 md:px-13 border-b border-rule">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl font-bold text-ink mb-4">
              개인정보처리방침
            </h1>
            <p className="text-muted text-body">
              최종 수정일: 2025년 1월 1일
            </p>
          </div>
        </section>

        {/* 본문 */}
        <section className="py-12 px-6 md:px-13">
          <div className="max-w-3xl mx-auto">
            <PrivacySection title="1. 개인정보의 수집 및 이용 목적">
              <p>
                스터디코어 1.0(이하 &quot;회사&quot;)은 다음의 목적을 위하여
                개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적
                이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는
                별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul>
                <li>서비스 제공 및 회원 관리</li>
                <li>상담 신청 처리 및 연락</li>
                <li>공지사항 및 학습 관련 정보 전달</li>
                <li>서비스 개선 및 통계 분석</li>
              </ul>
            </PrivacySection>

            <PrivacySection title="2. 수집하는 개인정보 항목">
              <p>회사는 다음의 개인정보 항목을 수집합니다.</p>
              <div className="bg-stone p-4 my-4">
                <h4 className="font-bold text-body mb-2">
                  [상담 신청 시 수집 항목]
                </h4>
                <p className="text-body">이름, 연락처, 상담 유형, 문의 내용</p>
              </div>
              <div className="bg-stone p-4">
                <h4 className="font-bold text-body mb-2">
                  [재원생 등록 시 수집 항목]
                </h4>
                <p className="text-body">
                  이름, 연락처, 학교, 학년, 학부모 연락처
                </p>
              </div>
            </PrivacySection>

            <PrivacySection title="3. 개인정보의 보유 및 이용기간">
              <p>
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
                개인정보 수집 시에 동의 받은 개인정보 보유·이용기간 내에서
                개인정보를 처리·보유합니다.
              </p>
              <ul>
                <li>회원 탈퇴 시까지 (단, 관계 법령에 따라 보존이 필요한 경우 해당 기간까지)</li>
                <li>상담 신청 정보: 상담 완료 후 1년</li>
              </ul>
            </PrivacySection>

            <PrivacySection title="4. 개인정보의 제3자 제공">
              <p>
                회사는 원칙적으로 정보주체의 개인정보를 수집·이용 목적으로
                명시한 범위 내에서 처리하며, 정보주체의 사전 동의 없이는
                본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.
              </p>
            </PrivacySection>

            <PrivacySection title="5. 개인정보의 파기">
              <p>
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
                불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
              </p>
            </PrivacySection>

            <PrivacySection title="6. 정보주체의 권리·의무 및 행사방법">
              <p>
                정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호
                관련 권리를 행사할 수 있습니다.
              </p>
              <ul>
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리정지 요구</li>
              </ul>
            </PrivacySection>

            <PrivacySection title="7. 개인정보 보호책임자">
              <div className="bg-stone p-4">
                <p className="text-body">
                  <strong>개인정보 보호책임자</strong>
                  <br />
                  성명: 정원석
                  <br />
                  연락처: {CONTACT.phone}
                  <br />
                  이메일: {CONTACT.email}
                </p>
              </div>
            </PrivacySection>

            <PrivacySection title="8. 개인정보 처리방침 변경">
              <p>
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에
                따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의
                시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
              <p className="mt-4 text-body text-muted">
                본 방침은 2025년 1월 1일부터 시행됩니다.
              </p>
            </PrivacySection>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PrivacySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-ink mb-4">{title}</h2>
      <div className="text-reading text-ink/70 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-body">
        {children}
      </div>
    </div>
  );
}
