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

export function FAQJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "스터디코어 이용 요금은 얼마인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "정확한 요금은 상담을 통해 안내드립니다. 등록 기간과 이용 시간대에 따라 차이가 있을 수 있습니다. 부담 없이 무료 상담 신청을 먼저 이용해 주세요.",
        },
      },
      {
        "@type": "Question",
        name: "정원이 있나요? 대기는 어떻게 하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "원장님이 모든 학생을 직접 관리하기 때문에 정원이 정해져 있습니다. 대기 등록이 가능하며, 자리가 생기면 순서대로 연락드립니다.",
        },
      },
      {
        "@type": "Question",
        name: "수학 질문방은 어떻게 이용하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "등록 후 별도 안내를 통해 이용할 수 있습니다. 모르는 문제를 사진으로 찍거나 직접 적어 올리면 국희재 수학학원 멘토가 풀이와 개념을 직접 설명해 드립니다.",
        },
      },
      {
        "@type": "Question",
        name: "교시제는 어떻게 운영되나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "하루 일과가 교시 단위로 운영됩니다. 교시가 시작되면 자리에 앉아 공부하고, 정해진 쉬는 시간에만 이동이 허용됩니다. 스스로 집중을 유지하는 것보다 훨씬 효율적입니다.",
        },
      },
      {
        "@type": "Question",
        name: "학부모님도 학습 현황을 알 수 있나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "공지사항과 주요 안내는 학부모님께 카카오톡으로 전달됩니다. 원장님이 직접 내용을 확인하고 발송하기 때문에 오발송 없이 정확한 정보만 전달됩니다.",
        },
      },
      {
        "@type": "Question",
        name: "등록 후 적응 기간이 있나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "등록 첫날 생활 규정, 교시 시간표, 벌점 제도 전반을 안내드립니다. 규칙이 명확할수록 오히려 편하다는 이야기를 많이 듣습니다. 첫 주 안에 충분히 적응합니다.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ArticleJsonLdProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  authorName?: string | null;
  tags?: string[];
}

export function ArticleJsonLd({
  title,
  slug,
  excerpt,
  thumbnailUrl,
  publishedAt,
  updatedAt,
  authorName,
  tags,
}: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt ?? undefined,
    image: thumbnailUrl ?? undefined,
    url: `https://studycore.kr/blog/${slug}`,
    datePublished: publishedAt ?? undefined,
    dateModified: updatedAt ?? publishedAt ?? undefined,
    author: {
      "@type": "Person",
      name: authorName ?? "스터디코어 1.0",
    },
    publisher: {
      "@type": "Organization",
      name: "스터디코어 1.0",
      logo: {
        "@type": "ImageObject",
        url: "https://studycore.kr/logo/Artboard%204@2x_정사각.png",
      },
    },
    keywords: tags?.join(", ") ?? undefined,
    inLanguage: "ko",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://studycore.kr/blog/${slug}`,
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
