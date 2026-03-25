"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";

// 임시 강사진 데이터
const team = [
  {
    id: 1,
    name: "김영수",
    role: "원장",
    subject: "수학",
    bio: "서울대학교 수학교육과 졸업. 15년 경력의 수학 전문 강사.",
    avatar: null,
  },
  {
    id: 2,
    name: "이수진",
    role: "멘토",
    subject: "영어",
    bio: "연세대학교 영어영문학과 졸업. 영어 회화 및 문법 전문.",
    avatar: null,
  },
  {
    id: 3,
    name: "박준호",
    role: "멘토",
    subject: "국어",
    bio: "고려대학교 국어국문학과 졸업. 비문학 및 문학 분석 전문.",
    avatar: null,
  },
  {
    id: 4,
    name: "최민지",
    role: "멘토",
    subject: "과학",
    bio: "KAIST 물리학과 졸업. 물리/화학 통합 과학 전문.",
    avatar: null,
  },
];

export function TeamSection() {
  return (
    <section className="section-md bg-white">
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
            Our Team
          </span>
          <h2 className="font-serif text-fluid-h2 font-bold text-ink mt-3">
            전문 멘토진
          </h2>
          <p className="text-muted text-body mt-4 max-w-xl mx-auto">
            각 과목 전문가로 구성된 멘토진이 학생들의 학습을 돕습니다.
          </p>
        </motion.div>

        {/* 팀 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-stone border border-rule p-6 text-center"
            >
              {/* 아바타 */}
              <div className="w-20 h-20 mx-auto bg-navy/10 flex items-center justify-center mb-4">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-navy" />
                )}
              </div>

              {/* 정보 */}
              <h3 className="font-bold text-ink text-subhead">{member.name}</h3>
              <p className="text-teal text-secondary font-medium mt-1">
                {member.subject} {member.role}
              </p>
              <p className="text-muted text-small mt-3 leading-prose">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
