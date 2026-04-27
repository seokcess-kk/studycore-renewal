"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function MetaPixel() {
  const pathname = usePathname();
  const hasFiredInitialPageView = useRef(false);

  useEffect(() => {
    if (!PIXEL_ID) return;
    // init script가 첫 PageView를 이미 전송하므로 두 번째 호출부터만 track
    if (!hasFiredInitialPageView.current) {
      hasFiredInitialPageView.current = true;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  if (!PIXEL_ID) {
    return (
      <meta name="meta-pixel-debug" content="PIXEL_ID is empty at build time" />
    );
  }

  const initScript = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`;

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
