"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { CONTACT } from "@/lib/constants";

const faqs = [
  {
    question: "이용 요금은 얼마인가요?",
    answer:
      '정확한 요금은 상담을 통해 안내드립니다. 등록 기간과 이용 시간대에 따라 차이가 있을 수 있습니다. 부담 없이 <strong>무료 상담 신청</strong>을 먼저 이용해 주세요.',
  },
  {
    question: "정원이 있나요? 대기는 어떻게 하나요?",
    answer:
      '원장님이 모든 학생을 직접 관리하기 때문에 정원이 정해져 있습니다. <strong>대기 등록</strong>이 가능하며, 자리가 생기면 순서대로 연락드립니다.',
  },
  {
    question: "수학 질문방은 어떻게 이용하나요?",
    answer:
      '등록 후 별도 안내를 통해 이용할 수 있습니다. 모르는 문제를 사진으로 찍거나 직접 적어 올리면 <strong>국희재 수학학원 멘토가 풀이와 개념을 직접 설명</strong>해 드립니다.',
  },
  {
    question: "교시제는 어떻게 운영되나요?",
    answer:
      '하루 일과가 교시 단위로 운영됩니다. 교시가 시작되면 자리에 앉아 공부하고, 정해진 쉬는 시간에만 이동이 허용됩니다. <strong>스스로 집중을 유지하는 것보다 훨씬 효율적</strong>입니다.',
  },
  {
    question: "학부모님도 학습 현황을 알 수 있나요?",
    answer:
      '공지사항과 주요 안내는 학부모님께 카카오톡으로 전달됩니다. 원장님이 직접 내용을 확인하고 발송하기 때문에 <strong>정확한 정보</strong>를 전달드립니다.',
  },
  {
    question: "적응 기간이 있나요?",
    answer:
      '생활 규정, 교시 시간표, 벌점 제도 전반을 안내드립니다. 규칙이 명확할수록 오히려 편하다는 이야기를 많이 듣습니다. <strong>첫 주 안에 충분히 적응</strong>합니다.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white section-lg px-6 md:px-13 border-t border-rule">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 lg:gap-24">
        {/* 좌측: 타이틀 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="lg:sticky lg:top-24"
        >
          <div className="font-mono text-label font-bold text-teal tracking-label uppercase mb-5">
            FAQ / 04
          </div>
          <h2 className="font-serif text-fluid-h1 font-black tracking-heading leading-heading mb-6">
            자주
            <br />
            묻는
            <br />
            질문
          </h2>
          <p className="text-body leading-prose text-muted font-light mb-9">
            더 궁금한 점은 카카오 채널로 바로 문의해 주세요.<br />
            원장님이 직접 답변드립니다.
          </p>
          <a
            href={CONTACT.kakaoChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-kakao text-kakao-dark text-secondary font-bold px-5 py-3 hover:opacity-85 transition-opacity"
          >
            {/* 원형 아이콘 예외: 글로벌 border-radius:0 override */}
            <span className="w-[18px] h-[18px] bg-kakao-dark flex items-center justify-center text-label text-kakao" style={{ borderRadius: '50%' }}>
              K
            </span>
            카카오 채널 문의하기
          </a>
        </motion.div>

        {/* 우측: 아코디언 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="flex flex-col"
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              isLast={index === faqs.length - 1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  isLast,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  return (
    <div className={`border-t border-rule overflow-hidden ${isLast ? "border-b" : ""}`}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full py-7 flex justify-between items-center text-left gap-6"
      >
        <span className="font-serif text-subhead font-bold text-ink tracking-heading leading-ui">
          {question}
        </span>
        <span
          className={`w-9 h-9 border-[1.5px] border-rule flex-shrink-0 flex items-center justify-center text-muted transition-all duration-300 ${isOpen ? "bg-navy border-navy text-white rotate-45" : ""
            }`}
        >
          <Plus size={16} />
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p
            className="pb-7 text-body leading-prose text-ink/70 font-light [&_strong]:text-ink [&_strong]:font-medium"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        </div>
      </div>
    </div>
  );
}
