"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES, CONTACT, LOCATION, KAKAO } from "@/lib/constants";
import { ArrowRight, MapPin, Navigation } from "lucide-react";

const MAP_LINKS = [
  {
    label: "카카오맵",
    href: `https://map.kakao.com/link/map/${encodeURIComponent(LOCATION.name)},${LOCATION.lat},${LOCATION.lng}`,
    color: "bg-[#FEE500] text-[#191919]",
  },
  {
    label: "네이버지도",
    href: `https://map.naver.com/v5/search/${encodeURIComponent(LOCATION.address)}`,
    color: "bg-[#03C75A] text-white",
  },
  {
    label: "구글맵",
    href: `https://www.google.com/maps/search/?api=1&query=${LOCATION.lat},${LOCATION.lng}`,
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
            <h2 className="font-serif text-[clamp(44px,7vw,96px)] font-black text-white leading-[0.92] tracking-[-0.04em] mb-13">
              상담
              <br />
              신청
            </h2>

            {/* 연락처 정보 */}
            <div className="flex flex-col">
              <ContactRow label="Location">
                광주 광산구 임방울대로 330
                <br />
                애플타워 10층
              </ContactRow>
              <ContactRow label="Phone">{CONTACT.phone}</ContactRow>
              <ContactRow label="Kakao">@스터디코어 1.0</ContactRow>
              <ContactRow label="Email">{CONTACT.email}</ContactRow>
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

            {/* 카카오 맵 */}
            <div className="border border-white/[0.08] overflow-hidden">
              <KakaoMap />
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
          <div className="border-t border-white/[0.08] pt-10">
            <p className="text-white/60 text-[15px] leading-[1.8] mb-8">
              입소 상담, 시설 견학, 프로그램 문의 등<br />
              무엇이든 편하게 문의해 주세요.
              <br />
              <br />
              <strong className="text-white font-medium">
                원장님이 직접 확인하고 연락드립니다.
              </strong>
            </p>

            <Link
              href={ROUTES.CONSULT}
              className="cta-fill cta-fill-teal group inline-flex items-center gap-3 px-15 py-[18px] text-navy text-[14px] font-bold tracking-[0.05em] border-[1.5px] border-teal hover:text-teal transition-colors duration-300"
            >
              상담 신청하기
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !KAKAO.MAP_API_KEY) return;

    const win = window as unknown as { kakao?: { maps: { load: (cb: () => void) => void; LatLng: new (lat: number, lng: number) => unknown; Map: new (el: HTMLElement, opts: object) => unknown; Marker: new (opts: object) => void } } };

    const initMap = () => {
      if (!win.kakao || !mapRef.current) return;
      win.kakao.maps.load(() => {
        if (!mapRef.current) return;
        const position = new win.kakao!.maps.LatLng(LOCATION.lat, LOCATION.lng);
        const map = new win.kakao!.maps.Map(mapRef.current, {
          center: position,
          level: 3,
        });
        new win.kakao!.maps.Marker({ map, position });
      });
    };

    // 이미 로드된 경우
    if (win.kakao) {
      initMap();
      return;
    }

    // 이미 스크립트 태그가 있는 경우
    const existing = document.querySelector('script[src*="dapi.kakao.com/v2/maps"]');
    if (existing) {
      existing.addEventListener("load", initMap);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO.MAP_API_KEY}&autoload=false`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
  }, []);

  if (!KAKAO.MAP_API_KEY) {
    return (
      <div className="w-full aspect-[16/9] bg-white/[0.03] flex items-center justify-center">
        <span className="text-[13px] text-white/30">지도를 불러올 수 없습니다</span>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full aspect-[16/9]" />;
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
