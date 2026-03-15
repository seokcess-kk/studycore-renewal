"use client";

import { useState } from "react";
import { Nav, Footer } from "@/components/common";
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ChevronDown,
  Download,
} from "lucide-react";

// 신입생 안내 섹션 타입
interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function GuidePage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["intro"]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const sections: GuideSection[] = [
    {
      id: "intro",
      title: "스터디코어 1.0 소개",
      icon: <FileText size={20} />,
      content: (
        <div className="prose prose-sm max-w-none">
          <p>
            스터디코어 1.0은 광산구에 위치한 관리형 독서실입니다.
            단순한 자습 공간을 넘어, 학생 개개인의 학습 계획 수립과 실천을
            체계적으로 관리하여 최상의 학습 환경을 제공합니다.
          </p>
          <h4>주요 특징</h4>
          <ul>
            <li>1:1 맞춤 학습 관리</li>
            <li>질문방을 통한 실시간 멘토링</li>
            <li>체계적인 학습 플래너 시스템</li>
            <li>쾌적한 개인 좌석 및 학습 환경</li>
          </ul>
        </div>
      ),
    },
    {
      id: "schedule",
      title: "운영 시간",
      icon: <Clock size={20} />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-stone">
              <p className="text-[13px] text-muted mb-1">평일</p>
              <p className="text-[15px] font-medium text-ink">
                07:00 - 24:00
              </p>
            </div>
            <div className="p-4 bg-stone">
              <p className="text-[13px] text-muted mb-1">주말/공휴일</p>
              <p className="text-[15px] font-medium text-ink">
                08:00 - 22:00
              </p>
            </div>
          </div>
          <div className="text-[13px] text-muted">
            * 시험 기간 연장 운영 가능 (사전 공지)
          </div>
        </div>
      ),
    },
    {
      id: "rules",
      title: "이용 규칙",
      icon: <Calendar size={20} />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-ink">준수 사항</h4>
            <ul className="list-disc list-inside text-[14px] text-ink space-y-1">
              <li>개인 좌석 청결 유지</li>
              <li>음식물 반입 금지 (음료만 허용)</li>
              <li>휴대폰 무음 설정</li>
              <li>큰 소리로 통화 금지</li>
              <li>공용 시설 정리정돈</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-ink">도시락 이용 안내</h4>
            <p className="text-[14px] text-ink">
              도시락은 마이페이지에서 신청할 수 있습니다.
              신청 기간 내에 원하는 요일/날짜를 선택해 주세요.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "location",
      title: "오시는 길",
      icon: <MapPin size={20} />,
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-[15px] font-medium text-ink mb-1">주소</p>
            <p className="text-[14px] text-muted">
              광주광역시 광산구 수완로 123, 4층
            </p>
          </div>
          <div className="aspect-[16/9] bg-stone flex items-center justify-center">
            <p className="text-[13px] text-muted">지도 로딩 중...</p>
          </div>
          <div>
            <p className="text-[15px] font-medium text-ink mb-1">대중교통</p>
            <ul className="text-[14px] text-muted space-y-1">
              <li>버스: 000번, 000번 (스터디코어 정류장 하차)</li>
              <li>지하철: 0호선 00역 0번 출구 (도보 5분)</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      title: "문의 안내",
      icon: <Phone size={20} />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-stone">
              <p className="text-[13px] text-muted mb-1">전화</p>
              <p className="text-[15px] font-medium text-ink">
                062-000-0000
              </p>
            </div>
            <div className="p-4 bg-stone">
              <p className="text-[13px] text-muted mb-1">카카오톡</p>
              <a
                href="http://pf.kakao.com/_execQn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] font-medium text-teal hover:text-teal-d"
              >
                채널 바로가기
              </a>
            </div>
          </div>
          <div>
            <p className="text-[15px] font-medium text-ink mb-1">상담 시간</p>
            <p className="text-[14px] text-muted">
              평일 10:00 - 18:00 (점심시간 12:00 - 13:00 제외)
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20">
        {/* 헤더 */}
        <section className="bg-navy py-16 px-6 md:px-13">
          <div className="max-w-3xl mx-auto">
            <span className="font-mono text-[10px] font-bold text-teal tracking-[0.28em] uppercase block mb-4">
              Guide / 신입생 안내
            </span>
            <h1 className="font-serif text-[clamp(32px,5vw,48px)] font-black text-white leading-tight">
              신입생 안내
            </h1>
            <p className="mt-4 text-white/50 text-[15px]">
              스터디코어 1.0 이용에 필요한 정보를 안내해 드립니다.
            </p>
          </div>
        </section>

        {/* 콘텐츠 */}
        <section className="px-6 md:px-13 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
                {sections.map((section) => {
                  const isExpanded = expandedSections.includes(section.id);
                  return (
                    <div
                      key={section.id}
                      className="border border-rule bg-white"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center gap-4 p-5 text-left hover:bg-stone/50 transition-colors"
                      >
                        <span className="text-teal">{section.icon}</span>
                        <span className="flex-1 text-[16px] font-medium text-ink">
                          {section.title}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`text-muted transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0 border-t border-rule">
                          <div className="pt-4">{section.content}</div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 다운로드 섹션 */}
                <div className="border border-rule bg-white p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-teal">
                      <Download size={20} />
                    </span>
                    <span className="text-[16px] font-medium text-ink">
                      자료 다운로드
                    </span>
                  </div>
                  <div className="space-y-2">
                    <DownloadItem
                      name="신입생 오리엔테이션 자료"
                      filename="orientation.pdf"
                      disabled
                    />
                    <DownloadItem
                      name="학습 플래너 양식"
                      filename="planner.pdf"
                      disabled
                    />
                    <DownloadItem
                      name="이용 규칙 안내문"
                      filename="rules.pdf"
                      disabled
                    />
                  </div>
                  <p className="text-[12px] text-muted mt-4">
                    * 자료 준비 중입니다.
                  </p>
                </div>
              </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function DownloadItem({
  name,
  filename,
  url,
  disabled,
}: {
  name: string;
  filename: string;
  url?: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex items-center justify-between p-3 bg-stone opacity-50">
        <div>
          <p className="text-[14px] text-ink">{name}</p>
          <p className="text-[12px] text-muted">{filename}</p>
        </div>
        <span className="text-[12px] text-muted">준비 중</span>
      </div>
    );
  }

  return (
    <a
      href={url}
      download
      className="flex items-center justify-between p-3 bg-stone hover:bg-rule transition-colors"
    >
      <div>
        <p className="text-[14px] text-ink">{name}</p>
        <p className="text-[12px] text-muted">{filename}</p>
      </div>
      <Download size={16} className="text-teal" />
    </a>
  );
}
