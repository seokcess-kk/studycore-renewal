"use client";

import { motion } from "framer-motion";
import { Target, Users, BookOpen, Clock } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "목표 중심 학습",
    description: "개인별 목표 설정과 맞춤형 학습 관리로 효율적인 성장을 지원합니다.",
  },
  {
    icon: Users,
    title: "1:1 밀착 관리",
    description: "전담 멘토가 학습 진도와 생활 패턴을 세심하게 관리합니다.",
  },
  {
    icon: BookOpen,
    title: "즉시 질문 해결",
    description: "모르는 문제는 질문방을 통해 빠르게 해결할 수 있습니다.",
  },
  {
    icon: Clock,
    title: "체계적인 시간 관리",
    description: "학습 시간 분석과 피드백으로 최적의 학습 루틴을 만들어갑니다.",
  },
];

export function IntroSection() {
  return (
    <section className="section-md bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-teal text-secondary font-medium tracking-label uppercase">
            About STUDYCORE
          </span>
          <h1 className="font-serif text-fluid-h1 font-bold text-ink mt-3">
            학생의 성장을 위한
            <br />
            <span className="text-teal">관리형 학습공간</span>
          </h1>
          <p className="text-muted text-reading mt-6 max-w-2xl mx-auto leading-prose">
            스터디코어는 단순한 공부 공간이 아닙니다.
            <br />
            학생 개개인의 목표와 성장을 함께 고민하는 파트너입니다.
          </p>
        </motion.div>

        {/* 미션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-navy-d text-white p-8 md:p-12 mb-16"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-fluid-h2 font-bold mb-4">
              Our Mission
            </h2>
            <p className="text-on-dark-muted text-reading leading-prose">
              &ldquo;모든 학생이 자신만의 속도로 성장할 수 있는 환경을 만듭니다.
              체계적인 관리와 따뜻한 관심으로 학생들이 스스로 공부하는 힘을 기르고,
              목표를 향해 나아갈 수 있도록 돕습니다.&rdquo;
            </p>
          </div>
        </motion.div>

        {/* 특징 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-stone p-6"
            >
              <feature.icon size={32} className="text-teal mb-4" />
              <h3 className="font-bold text-ink text-subhead mb-2">
                {feature.title}
              </h3>
              <p className="text-muted text-secondary leading-prose">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
