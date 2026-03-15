import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR, Noto_Sans_KR, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#103050",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "스터디코어 1.0 | 관리형 독서실",
    template: "%s | 스터디코어 1.0",
  },
  description:
    "구조가 성적을 만든다. 광주 광산구 관리형 독서실 스터디코어 1.0 - 교시제 시스템, 수학 멘토 질문방, 원장 직접 관리",
  keywords: [
    "광주 독서실",
    "광산구 독서실",
    "관리형 독서실",
    "스터디코어",
    "교시제",
    "수학 질문방",
  ],
  authors: [{ name: "스터디코어 1.0" }],
  creator: "스터디코어 1.0",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "스터디코어",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "스터디코어 1.0",
    title: "스터디코어 1.0 | 관리형 독서실",
    description:
      "구조가 성적을 만든다. 광주 광산구 관리형 독서실 - 교시제, 수학 멘토 질문방, 원장 직접 관리",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSerifKR.variable} ${notoSansKR.variable} ${ibmPlexMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
