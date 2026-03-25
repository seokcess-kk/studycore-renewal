"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 임시 시설 데이터 (실제 이미지 URL로 교체 필요)
const facilities = [
  {
    id: 1,
    title: "독서실 공간",
    description: "쾌적한 개인 좌석과 집중할 수 있는 조명 환경",
    image: "/images/facility-1.jpg",
  },
  {
    id: 2,
    title: "질의응답실",
    description: "1:1 질문 및 상담이 가능한 개별 공간",
    image: "/images/facility-2.jpg",
  },
  {
    id: 3,
    title: "휴게 공간",
    description: "편안한 휴식과 간식을 즐길 수 있는 라운지",
    image: "/images/facility-3.jpg",
  },
  {
    id: 4,
    title: "자습 공간",
    description: "조용하고 집중하기 좋은 개인 자습 공간",
    image: "/images/facility-4.jpg",
  },
];

export function FacilitySection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? facilities.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === facilities.length - 1 ? 0 : prev + 1
    );
  };

  const currentFacility = facilities[currentIndex];

  return (
    <section className="section-md bg-stone">
      <div className="max-w-6xl mx-auto px-6">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-teal text-secondary font-medium tracking-label uppercase">
            Facilities
          </span>
          <h2 className="font-serif text-fluid-h2 font-bold text-ink mt-3">
            학습에 최적화된 공간
          </h2>
        </motion.div>

        {/* 슬라이더 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-white border border-rule overflow-hidden">
            {/* 이미지 영역 */}
            <div className="aspect-video bg-navy/10 flex items-center justify-center">
              {/* 실제 이미지가 있으면 표시, 없으면 플레이스홀더 */}
              <div className="text-center text-muted">
                <p className="text-body">이미지 준비 중</p>
                <p className="text-small mt-1">{currentFacility.title}</p>
              </div>
            </div>

            {/* 캡션 */}
            <div className="p-6">
              <h3 className="font-bold text-ink text-subhead mb-2">
                {currentFacility.title}
              </h3>
              <p className="text-muted text-body">
                {currentFacility.description}
              </p>
            </div>
          </div>

          {/* 네비게이션 버튼 */}
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-rule flex items-center justify-center hover:bg-stone transition-colors"
          >
            <ChevronLeft size={20} className="text-ink" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-rule flex items-center justify-center hover:bg-stone transition-colors"
          >
            <ChevronRight size={20} className="text-ink" />
          </button>
        </motion.div>

        {/* 인디케이터 */}
        <div className="flex justify-center gap-2 mt-6">
          {facilities.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 transition-colors ${
                index === currentIndex ? "bg-navy" : "bg-rule"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
