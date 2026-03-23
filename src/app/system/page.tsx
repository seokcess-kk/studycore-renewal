import { Metadata } from "next";
import { Nav, Footer } from "@/components/common";

export const metadata: Metadata = {
  title: "운영 시스템",
  description:
    "스터디코어 1.0 운영 시스템 - 교시제, 생활 규정, 벌점 제도 안내",
};

export default function SystemPage() {
  return (
    <>
      <Nav />
      <main className="page-body">
        {/* 헤더 */}
        <section className="bg-navy-dark py-20 px-6 md:px-13">
          <div className="max-w-4xl mx-auto">
            <span className="font-mono text-label font-bold text-teal tracking-label uppercase block mb-4">
              System / 운영 시스템
            </span>
            <h1 className="font-serif text-[clamp(36px,5vw,56px)] font-black text-white leading-tight tracking-heading">
              구조가 성적을 만든다
            </h1>
            <p className="mt-6 text-white/50 text-reading leading-relaxed max-w-xl">
              스터디코어 1.0은 교시제 시스템을 기반으로 운영됩니다. 명확한
              규칙과 일관된 관리가 학생의 집중력을 극대화합니다.
            </p>
          </div>
        </section>

        {/* 교시제 시스템 */}
        <section className="section-sm px-6 md:px-13 border-b border-rule">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-mono text-[48px] font-bold text-navy/10">
                01
              </span>
              <h2 className="font-serif text-2xl font-bold text-ink">
                교시제 시스템
              </h2>
            </div>
            <div className="space-y-6 text-reading text-ink/70 leading-relaxed">
              <p>
                하루 일과는 <strong className="text-ink">교시 단위</strong>로
                운영됩니다. 시작 종이 울리면 자리에 앉아 학습을 시작하고, 정해진
                쉬는 시간에만 이동이 허용됩니다.
              </p>
              <div className="bg-stone p-6">
                <h3 className="font-bold text-ink mb-4">운영 시간표 예시</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body">
                  <div className="border-l-2 border-teal pl-3">
                    <span className="text-muted block">1교시</span>
                    <span className="font-medium">09:00 - 10:30</span>
                  </div>
                  <div className="border-l-2 border-teal pl-3">
                    <span className="text-muted block">2교시</span>
                    <span className="font-medium">10:40 - 12:10</span>
                  </div>
                  <div className="border-l-2 border-teal pl-3">
                    <span className="text-muted block">3교시</span>
                    <span className="font-medium">13:00 - 14:30</span>
                  </div>
                  <div className="border-l-2 border-teal pl-3">
                    <span className="text-muted block">4교시</span>
                    <span className="font-medium">14:40 - 16:10</span>
                  </div>
                </div>
                <p className="mt-4 text-secondary text-muted">
                  * 실제 운영 시간표는 상담 시 안내드립니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 생활 규정 */}
        <section className="section-sm px-6 md:px-13 border-b border-rule">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-mono text-[48px] font-bold text-navy/10">
                02
              </span>
              <h2 className="font-serif text-2xl font-bold text-ink">
                생활 규정
              </h2>
            </div>
            <div className="space-y-4">
              <RuleItem
                title="휴대폰 수거"
                description="교시 시작 시 휴대폰을 수거하여 보관합니다. 쉬는 시간에 사용 가능합니다."
              />
              <RuleItem
                title="출결 관리"
                description="모든 출석은 기록되며, 무단 결석 및 지각은 벌점 대상입니다."
              />
              <RuleItem
                title="자습실 정숙"
                description="자습실 내에서는 대화, 전화, 음식 섭취가 금지됩니다."
              />
              <RuleItem
                title="지정석 사용"
                description="배정된 자리에서만 학습하며, 좌석 변경은 관리자 승인이 필요합니다."
              />
            </div>
          </div>
        </section>

        {/* 벌점 제도 */}
        <section className="section-sm px-6 md:px-13">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-mono text-[48px] font-bold text-navy/10">
                03
              </span>
              <h2 className="font-serif text-2xl font-bold text-ink">
                벌점 제도
              </h2>
            </div>
            <p className="text-reading text-ink/70 leading-relaxed mb-6">
              모든 재원생의 집중 환경을 위해 명확한 페널티 시스템을 운영합니다.
            </p>
            <div className="bg-stone p-6 space-y-4">
              <PenaltyItem
                category="지각 및 무단 결석"
                items={[
                  { rule: "교시 시작 후 5분 이상 지각", point: 1 },
                  { rule: "사전 연락 없는 무단 결석", point: 3 },
                ]}
              />
              <PenaltyItem
                category="학습 방해 및 소음"
                items={[
                  { rule: "자습실 내 전자기기 소음 (진동 포함)", point: 2 },
                  { rule: "교시 중 무단 이동 및 잡담", point: 2 },
                ]}
              />
            </div>
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500">
              <p className="text-body font-bold text-red-700">
                누적 벌점 10점 초과 시 강제 퇴소 조치됩니다.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function RuleItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-4 bg-white border border-rule">
      <div className="w-1 bg-teal flex-shrink-0" />
      <div>
        <h3 className="font-bold text-ink mb-1">{title}</h3>
        <p className="text-body text-ink/60">{description}</p>
      </div>
    </div>
  );
}

function PenaltyItem({
  category,
  items,
}: {
  category: string;
  items: { rule: string; point: number }[];
}) {
  return (
    <div>
      <h4 className="font-bold text-ink mb-2 text-body">{category}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex justify-between text-body text-ink/70"
          >
            <span>{item.rule}</span>
            <span className="font-mono font-bold text-red-500">
              벌점 {item.point}점
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
