import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "STUDYCORE 블로그";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, tags")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  const title = post?.title || "STUDYCORE 블로그";
  const tags = (post?.tags as string[]) || [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          backgroundColor: "#0A1F35",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* 로고 */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 40,
            opacity: 0.6,
          }}
        >
          STUDYCORE 1.0
        </div>

        {/* 제목 */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: 30,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </div>

        {/* 태그 */}
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 12 }}>
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 20,
                  color: "#57ADB1",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 하단 URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 80,
            fontSize: 16,
            opacity: 0.4,
          }}
        >
          studycore.kr/blog/{slug}
        </div>
      </div>
    ),
    { ...size }
  );
}
