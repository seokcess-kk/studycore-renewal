"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Bus, Loader2 } from "lucide-react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import { CONTACT, KAKAO, LOCATION } from "@/lib/constants";

const info = [
  {
    icon: MapPin,
    label: "주소",
    value: CONTACT.address,
  },
  {
    icon: Phone,
    label: "전화",
    value: CONTACT.phone,
  },
  {
    icon: Clock,
    label: "운영시간",
    value: "평일 07:00 - 23:00 / 주말 08:00 - 22:00",
  },
  {
    icon: Bus,
    label: "대중교통",
    value: "광주송정역에서 차량 10분 / 수완지구 인근",
  },
];

// 카카오맵 로딩 컴포넌트
function MapLoading() {
  return (
    <div className="aspect-square bg-navy/10 flex items-center justify-center">
      <div className="text-center text-muted">
        <Loader2 size={32} className="mx-auto mb-2 animate-spin" />
        <p className="text-body">지도 로딩 중...</p>
      </div>
    </div>
  );
}

// 카카오맵 에러/미설정 컴포넌트
function MapFallback({ message }: { message: string }) {
  return (
    <div className="aspect-square bg-navy/10 flex items-center justify-center">
      <div className="text-center text-muted">
        <MapPin size={48} className="mx-auto mb-2 opacity-50" />
        <p className="text-body">{message}</p>
        <p className="text-small mt-2 max-w-[200px]">{CONTACT.address}</p>
      </div>
    </div>
  );
}

// 카카오맵 컴포넌트
function KakaoMapView() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // 카카오맵 SDK 로드 확인
    if (window.kakao && window.kakao.maps) {
      setIsLoaded(true);
      return;
    }

    // SDK 로드
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO.MAP_API_KEY}&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (isMounted) {
          setIsLoaded(true);
        }
      });
    };

    script.onerror = () => {
      if (isMounted) {
        setIsError(true);
      }
    };

    document.head.appendChild(script);

    return () => {
      isMounted = false;
    };
  }, []);

  if (isError) {
    return <MapFallback message="지도를 불러올 수 없습니다" />;
  }

  if (!isLoaded) {
    return <MapLoading />;
  }

  return (
    <Map
      center={{ lat: LOCATION.lat, lng: LOCATION.lng }}
      style={{ width: "100%", height: "100%" }}
      level={3}
    >
      <MapMarker position={{ lat: LOCATION.lat, lng: LOCATION.lng }}>
        <div className="p-2 min-w-[150px]">
          <p className="font-bold text-secondary text-ink">{LOCATION.name}</p>
          <p className="text-caption text-muted mt-0.5">애플타워 10층</p>
        </div>
      </MapMarker>
    </Map>
  );
}

export function LocationSection() {
  const hasApiKey = !!KAKAO.MAP_API_KEY;

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
            Location
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink mt-3">
            오시는 길
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 지도 영역 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white border border-rule overflow-hidden"
          >
            <div className="aspect-square">
              {hasApiKey ? (
                <KakaoMapView />
              ) : (
                <MapFallback message="카카오맵 API 키를 설정해주세요" />
              )}
            </div>
          </motion.div>

          {/* 정보 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white border border-rule p-6"
          >
            <h3 className="font-bold text-ink text-subhead mb-6">연락처 정보</h3>

            <div className="space-y-5">
              {info.map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className="w-10 h-10 bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-teal" />
                  </div>
                  <div>
                    <p className="text-small text-muted uppercase tracking-label">
                      {item.label}
                    </p>
                    <p className="text-body text-ink mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 pt-6 border-t border-rule">
              <a
                href={CONTACT.kakaoChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-navy text-white text-center text-body font-medium hover:bg-navy-d transition-colors"
              >
                카카오톡 상담하기
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
