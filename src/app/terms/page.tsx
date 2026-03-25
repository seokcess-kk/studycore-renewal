import { Metadata } from "next";
import { Nav, Footer, SectionHeader } from "@/components/common";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "이용약관",
  description: "스터디코어 1.0 서비스 이용약관",
  alternates: {
    canonical: "https://studycore.kr/terms",
  },
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="page-body">
        {/* 헤더 */}
        <section className="bg-stone section-sm px-6 md:px-13 border-b border-rule">
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              title="이용약관"
              as="h1"
              titleSize="h2"
              align="center"
            />
            <p className="text-muted text-body text-center mt-4">
              최종 수정일: 2025년 1월 1일
            </p>
          </div>
        </section>

        {/* 본문 */}
        <section className="section-md px-6 md:px-13">
          <div className="max-w-3xl mx-auto prose prose-sm">
            <TermsSection title="제1조 (목적)">
              <p>
                이 약관은 스터디코어 1.0(이하 &quot;회사&quot;)이 제공하는
                관리형 독서실 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여
                회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로
                합니다.
              </p>
            </TermsSection>

            <TermsSection title="제2조 (용어의 정의)">
              <ol>
                <li>
                  &quot;서비스&quot;란 회사가 제공하는 관리형 독서실 이용,
                  온라인 공지, 질문방 등 일체의 서비스를 의미합니다.
                </li>
                <li>
                  &quot;회원&quot;이란 본 약관에 동의하고 서비스 이용 계약을
                  체결한 자를 의미합니다.
                </li>
                <li>
                  &quot;재원생&quot;이란 독서실 이용 계약을 체결하고 실제로
                  독서실을 이용하는 학생 회원을 의미합니다.
                </li>
              </ol>
            </TermsSection>

            <TermsSection title="제3조 (약관의 효력 및 변경)">
              <ol>
                <li>
                  본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게
                  공지함으로써 효력을 발생합니다.
                </li>
                <li>
                  회사는 필요한 경우 관련 법령을 위반하지 않는 범위 내에서 본
                  약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로
                  공지합니다.
                </li>
              </ol>
            </TermsSection>

            <TermsSection title="제4조 (서비스의 제공)">
              <p>회사는 다음과 같은 서비스를 제공합니다.</p>
              <ol>
                <li>관리형 독서실 이용 서비스</li>
                <li>온라인 공지사항 서비스</li>
                <li>수학 질문방 서비스 (재원생 전용)</li>
                <li>기타 회사가 정하는 서비스</li>
              </ol>
            </TermsSection>

            <TermsSection title="제5조 (회원의 의무)">
              <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
              <ol>
                <li>타인의 정보를 도용하는 행위</li>
                <li>회사가 정한 규정을 위반하는 행위</li>
                <li>다른 이용자의 학습을 방해하는 행위</li>
                <li>기타 관련 법령에 위반되는 행위</li>
              </ol>
            </TermsSection>

            <TermsSection title="제6조 (서비스 이용의 제한)">
              <p>
                회사는 회원이 본 약관 또는 관련 법령을 위반하는 경우 서비스
                이용을 제한하거나 계약을 해지할 수 있습니다.
              </p>
            </TermsSection>

            <TermsSection title="제7조 (면책조항)">
              <ol>
                <li>
                  회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등
                  불가항력으로 인해 서비스를 제공할 수 없는 경우 책임을 지지
                  않습니다.
                </li>
                <li>
                  회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대해서는
                  책임을 지지 않습니다.
                </li>
              </ol>
            </TermsSection>

            <TermsSection title="제8조 (분쟁해결)">
              <p>
                본 약관에 명시되지 않은 사항은 관련 법령 및 상관례에 따릅니다.
                서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 회원은 성실히
                협의하여 해결하도록 합니다.
              </p>
            </TermsSection>

            <div className="mt-12 card-md bg-stone">
              <p className="text-body text-muted">
                본 약관에 대한 문의사항이 있으시면 아래 연락처로 문의해 주세요.
              </p>
              <p className="mt-2 text-body">
                <strong>스터디코어 1.0</strong>
                <br />
                전화: {CONTACT.phone}
                <br />
                이메일: {CONTACT.email}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function TermsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-subhead font-bold text-ink mb-3">{title}</h2>
      <div className="text-reading text-ink/70 leading-prose space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_li]:text-body">
        {children}
      </div>
    </div>
  );
}
