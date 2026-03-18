"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES, CONTACT } from "@/lib/constants";
import { ArrowRight, MapPin, Navigation, Phone } from "lucide-react";

const MAP_QUERY = encodeURIComponent("광주광역시 광산구 임방울대로 330 애플타워");

const MAP_LINKS = [
  {
    label: "카카오맵",
    href: `https://map.kakao.com/?q=${MAP_QUERY}`,
    color: "bg-[#FEE500] text-[#191919]",
  },
  {
    label: "네이버지도",
    href: `https://map.naver.com/p/search/${MAP_QUERY}`,
    color: "bg-[#03C75A] text-white",
  },
  {
    label: "구글맵",
    href: `https://maps.google.com/maps?q=${MAP_QUERY}`,
    color: "bg-[#4285F4] text-white",
  },
];

export function CTASection() {
  return (
    <section className="bg-navy py-28 px-6 md:px-13 relative overflow-hidden">
      {/* 격자 배경 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(87,173,177,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(87,173,177,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* 좌측: 타이틀 + 연락처 */}
        <div className="lg:pr-24 lg:border-r lg:border-white/[0.08]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
          >
            <div className="font-mono text-[10px] font-bold text-teal tracking-[0.28em] uppercase flex items-center gap-3 mb-8">
              <span className="w-8 h-0.5 bg-teal" />
              Contact / 05
            </div>
            <h2 className="font-serif text-[clamp(44px,7vw,96px)] font-black text-white leading-[0.92] tracking-[-0.04em] mb-6">
              상담
              <br />
              신청
            </h2>

            <p className="text-[15px] text-white/40 leading-[1.8] mb-13">
              입소 상담, 시설 견학, 프로그램 문의 등
              <br />
              무엇이든 편하게 문의해 주세요.
            </p>

            {/* 연락처 정보 */}
            <div className="flex flex-col">
              <ContactRow label="Location">
                광주 광산구 임방울대로 330
                <br />
                애플타워 10층
              </ContactRow>
              <ContactRow label="Phone">
                <a
                  href={`tel:${CONTACT.phone.replace(/-/g, "")}`}
                  className="hover:text-teal transition-colors duration-200 cursor-pointer"
                >
                  {CONTACT.phone}
                </a>
              </ContactRow>
              <ContactRow label="Kakao">
                <a
                  href={CONTACT.kakaoChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal transition-colors duration-200 cursor-pointer"
                >
                  @스터디코어 1.0
                </a>
              </ContactRow>
              <ContactRow label="Email">
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="hover:text-teal transition-colors duration-200 cursor-pointer"
                >
                  {CONTACT.email}
                </a>
              </ContactRow>
            </div>
          </motion.div>
        </div>

        {/* 우측: 지도 + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.1 }}
          className="lg:pl-24 mt-16 lg:mt-0 flex flex-col"
        >
          {/* 상단: 지도 */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={14} className="text-teal" />
              <span className="font-mono text-[10px] text-white/40 tracking-[0.18em] uppercase">
                Location
              </span>
            </div>

            {/* 구글 맵 */}
            <div className="border border-white/[0.08] overflow-hidden">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent("광주광역시 광산구 임방울대로 330 애플타워")}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
                className="w-full aspect-[16/9]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="스터디코어 1.0 위치"
              />
            </div>

            {/* 지도 앱 바로가기 */}
            <div className="flex gap-2 mt-3">
              {MAP_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium ${link.color} hover:opacity-80 transition-opacity cursor-pointer`}
                >
                  <Navigation size={10} />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* 하단: CTA */}
          <div className="border-t border-white/[0.08] pt-10 flex flex-col flex-1 justify-end">
            <p className="text-white/50 text-[13px] leading-[1.7] mb-3">
              원장님이 직접 확인하고 연락드립니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={ROUTES.CONSULT}
                className="cta-fill cta-fill-teal group inline-flex items-center justify-center gap-3 px-13 py-[18px] text-navy text-[14px] font-bold tracking-[0.05em] border-[1.5px] border-teal hover:text-teal transition-colors duration-300 cursor-pointer"
              >
                상담 신청하기
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </Link>

              <a
                href={`tel:${CONTACT.phone.replace(/-/g, "")}`}
                className="group inline-flex items-center justify-center gap-2 px-8 py-[18px] text-white/60 text-[14px] font-medium tracking-[0.02em] border-[1.5px] border-white/[0.12] hover:border-white/30 hover:text-white transition-all duration-300 cursor-pointer"
              >
                <Phone
                  size={15}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                전화 문의
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ContactRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-baseline py-4 border-b border-white/[0.07]">
      <span className="font-mono text-[10px] text-teal tracking-[0.18em] uppercase">
        {label}
      </span>
      <span className="text-[14px] text-white/60 text-right leading-[1.7]">
        {children}
      </span>
    </div>
  );
}
