import { cn } from "@/lib/utils";

const titleSizeMap = {
  display: "text-fluid-display",
  h1: "text-fluid-h1",
  h2: "text-fluid-h2",
  h3: "text-fluid-h3",
} as const;

interface SectionHeaderProps {
  /** 상단 라벨 (mono, uppercase) */
  label?: string;
  /** 제목 텍스트 */
  title: string;
  /** 설명 텍스트 */
  description?: string;
  /** 다크(navy/navy-dark) 배경 위 = "dark", 라이트(white/stone) 배경 위 = "light" */
  theme?: "dark" | "light";
  /** 텍스트 정렬 */
  align?: "left" | "center";
  /** 렌더링할 HTML 태그 */
  as?: "h1" | "h2" | "h3";
  /** 제목 크기 토큰 */
  titleSize?: keyof typeof titleSizeMap;
  /** 우측(또는 하단) 액션 영역 — 버튼, 필터 등 */
  actions?: React.ReactNode;
  /** 추가 className */
  className?: string;
}

/**
 * 통일된 섹션 헤더 컴포넌트
 *
 * 라벨 + 제목 + 설명 블록을 표준화합니다.
 * 배경색/패딩은 부모 섹션이 담당합니다.
 *
 * @example
 * // 다크 배경 페이지 헤더
 * <section className="bg-navy section-sm px-6 md:px-13">
 *   <SectionHeader
 *     label="공지사항"
 *     title="스터디코어 소식"
 *     description="중요한 안내사항을 확인하세요"
 *     theme="dark"
 *     as="h1"
 *   />
 * </section>
 *
 * @example
 * // 라이트 배경 센터 정렬
 * <SectionHeader
 *   label="팀 소개"
 *   title="함께하는 사람들"
 *   theme="light"
 *   align="center"
 * />
 */
export function SectionHeader({
  label,
  title,
  description,
  theme = "light",
  align = "left",
  as: Tag = "h2",
  titleSize = "h1",
  actions,
  className,
}: SectionHeaderProps) {
  const isDark = theme === "dark";

  const content = (
    <div className={cn(align === "center" && "text-center")}>
      {label && (
        <span
          className={cn(
            "font-mono text-label font-bold tracking-label uppercase block",
            "text-teal"
          )}
        >
          {label}
        </span>
      )}
      <Tag
        className={cn(
          "font-serif font-black leading-heading tracking-heading",
          titleSizeMap[titleSize],
          isDark ? "text-on-dark" : "text-ink",
          label && "mt-4"
        )}
      >
        {title}
      </Tag>
      {description && (
        <p
          className={cn(
            "text-reading leading-prose mt-3",
            isDark ? "text-on-dark-muted" : "text-muted"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );

  if (actions) {
    return (
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-end md:justify-between gap-6",
          className
        )}
      >
        {content}
        <div className="shrink-0">{actions}</div>
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}
