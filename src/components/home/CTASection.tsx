"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ROUTES, CONTACT } from "@/lib/constants";
import {
  ArrowRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

const MAP_QUERY = encodeURIComponent(
  "광주광역시 광산구 임방울대로 330 애플타워"
);

const MAP_APPS = [
  {
    label: "카카오맵",
    href: `https://map.kakao.com/?q=${MAP_QUERY}`,
    icon: "K",
    bg: "bg-[#FEE500]",
    text: "text-[#191919]",
  },
  {
    label: "네이버지도",
    href: `https://map.naver.com/p/search/${MAP_QUERY}`,
    icon: "N",
    bg: "bg-[#03C75A]",
    text: "text-white",
  },
  {
    label: "구글맵",
    href: `https://maps.google.com/maps?q=${MAP_QUERY}`,
    icon: "G",
    bg: "bg-[#4285F4]",
    text: "text-white",
  },
];

export function CTASection() {
  return (
    <section className="bg-navy section-lg px-6 md:px-13 relative overflow-hidden">
      {/* 격자 배경 */}
      <div className="absolute inset-0 pointer-events-none bg-grid-teal-lg" />

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* ── 좌측: 타이틀 + 연락처 + CTA + QR ── */}
        <div className="lg:pr-24 lg:border-r lg:border-white/[0.08]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            className="flex flex-col h-full"
          >
            {/* 섹션 라벨 */}
            <div className="font-mono text-label font-bold text-teal tracking-label uppercase flex items-center gap-3 mb-8">
              <span className="w-8 h-0.5 bg-teal" />
              Contact / 05
            </div>

            {/* 타이틀 + 설명 */}
            <h2 className="font-serif text-fluid-display font-black text-white leading-heading tracking-heading mb-6">
              상담
              <br />
              신청
            </h2>
            <p className="text-reading text-white/60 leading-prose mb-10">
              입소 상담, 시설 견학, 프로그램 문의 등
              <br />
              무엇이든 편하게 문의해 주세요.
            </p>

            {/* 연락처 */}
            <div className="space-y-4 mb-10">
              <ContactItem
                icon={<MapPin size={16} className="text-teal" />}
                label="Location"
              >
                광주 광산구 임방울대로 330, 애플타워 10층
              </ContactItem>

              <ContactItem
                icon={<Phone size={16} className="text-teal" />}
                label="Phone"
              >
                <a
                  href={`tel:${CONTACT.phone.replace(/-/g, "")}`}
                  className="hover:text-teal transition-colors duration-200 cursor-pointer"
                >
                  {CONTACT.phone}
                </a>
              </ContactItem>

              <ContactItem
                icon={<Mail size={16} className="text-teal" />}
                label="Email"
              >
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="hover:text-teal transition-colors duration-200 cursor-pointer"
                >
                  {CONTACT.email}
                </a>
              </ContactItem>
            </div>

            {/* CTA + 카카오 + QR */}
            <div className="border-t border-white/[0.08] pt-8 mt-auto">
              <p className="text-white/60 text-secondary leading-prose mb-4">
                원장님이 직접 확인하고 연락드립니다.
              </p>

              {/* 버튼 행 */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={ROUTES.CONSULT}
                  className="cta-fill cta-fill-teal group inline-flex items-center justify-center gap-3 px-10 py-4 text-navy text-body font-bold tracking-cta border-[1.5px] border-teal hover:text-teal transition-colors duration-300 cursor-pointer"
                >
                  상담 신청하기
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </Link>

                <a
                  href={`tel:${CONTACT.phone.replace(/-/g, "")}`}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-4 text-white/60 text-body font-medium tracking-cta border-[1.5px] border-white/[0.12] hover:border-white/30 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  <Phone size={14} />
                  전화 문의
                </a>

              </div>

              {/* 카카오톡 QR + 안내 */}
              <div className="flex items-center gap-5 mt-6 pt-6 border-t border-white/[0.06]">
                <a
                  href={CONTACT.kakaoChatChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 block border border-white/[0.08] p-1.5 bg-white hover:border-teal/40 transition-colors duration-200 cursor-pointer"
                >
                  <Image
                    src="/images/kakao-qr.png.jpg"
                    alt="카카오톡 채널 QR코드"
                    width={96}
                    height={96}
                    className="block"
                  />
                </a>
                <div>
                  <span className="flex items-center gap-1.5 text-[#FEE500] text-small font-bold tracking-cta mb-1.5">
                    <MessageCircle size={13} />
                    카카오톡 문의
                  </span>
                  <p className="text-secondary text-white/60 leading-prose font-light">
                    카카오톡 채널로 문의 주시면
                    <br />
                    가장 빠르고 정확하게 안내드릴 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── 우측: 지도 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.1 }}
          className="lg:pl-24 mt-16 lg:mt-0 flex flex-col"
        >
          {/* 지도 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-teal" />
              <span className="font-mono text-label text-white/60 tracking-label uppercase">
                Location
              </span>
            </div>
            <div className="flex items-center gap-2">
              {MAP_APPS.map((app) => (
                <a
                  key={app.label}
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={app.label}
                  className={`flex items-center justify-center w-7 h-7 ${app.bg} ${app.text} text-caption font-bold hover:opacity-80 transition-opacity cursor-pointer`}
                >
                  {app.icon}
                </a>
              ))}
            </div>
          </div>

          {/* 구글 맵 */}
          <div className="border border-white/[0.08] overflow-hidden flex-1">
            <iframe
              src="https://maps.google.com/maps?q=35.189430,126.824053&z=17&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full min-h-[400px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="스터디코어 1.0 위치"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ContactItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <span className="block font-mono text-label font-bold text-teal/60 tracking-label uppercase mb-1">
          {label}
        </span>
        <span className="text-body text-white/70 leading-prose">
          {children}
        </span>
      </div>
    </div>
  );
}
