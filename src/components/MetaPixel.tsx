"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * PageView 1건 발사 — 픽셀(브라우저)과 서버 CAPI를 같은 event_id로 전송해 중복 제거.
 * 서버 PageView를 함께 보내 CAPI 커버리지 격차를 메운다. fbq 로드를 잠시 대기(차단 시 skip),
 * _fbp 쿠키 설정을 짧게 기다려 매칭 품질을 높인 뒤 서버로 전송.
 */
function trackPageView(retry = 0) {
  if (typeof window === "undefined") return;
  if (!window.fbq) {
    if (retry < 20) setTimeout(() => trackPageView(retry + 1), 100);
    return;
  }

  const eventId =
    window.crypto && "randomUUID" in window.crypto
      ? window.crypto.randomUUID()
      : `${Date.now()}.${Math.random().toString(36).slice(2)}`;

  window.fbq("track", "PageView", {}, { eventID: eventId });

  let sent = false;
  const send = () => {
    if (sent) return;
    sent = true;
    try {
      fetch("/api/meta/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, eventSourceUrl: window.location.href }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* 추적 실패는 무시 */
    }
  };

  let tries = 0;
  const waitFbp = () => {
    if (document.cookie.indexOf("_fbp=") >= 0 || tries >= 10) {
      send();
      return;
    }
    tries += 1;
    setTimeout(waitFbp, 200);
  };
  waitFbp();
}

export function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!PIXEL_ID) return;
    // init 스크립트는 fbq('init')만 수행 → 첫 진입·라우트 변경 모두 여기서 PageView 1건 발사
    trackPageView();
  }, [pathname]);

  if (!PIXEL_ID) return null;

  const initScript = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');`;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {initScript}
      </Script>
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1" alt="" />`,
        }}
      />
    </>
  );
}
