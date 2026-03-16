export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "스터디코어 1.0",
    alternateName: "STUDYCORE 1.0",
    description:
      "광주 광산구 관리형 독서실. 교시제 시스템, 수학 멘토 질문방, 원장 직접 관리로 학생들의 자기주도학습을 체계적으로 지원합니다.",
    url: "https://studycore.kr",
    logo: "https://studycore.kr/logo/Artboard%204@2x_정사각.png",
    image: "https://studycore.kr/logo/Artboard%204@2x.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "광주광역시",
      addressRegion: "광산구",
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.1595,
      longitude: 126.7942,
    },
    areaServed: {
      "@type": "City",
      name: "광주광역시",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "관리형 독서실 프로그램",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "교시제 관리형 독서실",
            description: "시간표 기반 체계적 학습 관리 시스템",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "수학 멘토 질문방",
            description: "실시간 수학 질문 답변 서비스",
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "스터디코어 1.0",
    alternateName: "STUDYCORE",
    url: "https://studycore.kr",
    inLanguage: "ko",
    publisher: {
      "@type": "Organization",
      name: "스터디코어 1.0",
      logo: {
        "@type": "ImageObject",
        url: "https://studycore.kr/logo/Artboard%204@2x_정사각.png",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
