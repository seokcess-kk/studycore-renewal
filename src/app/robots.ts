import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/my/",
          "/register",
          "/pending-approval",
          "/account-inactive",
          "/login",
          "/questions/",
          "/notices/",
          "/api/",
        ],
      },
    ],
    sitemap: "https://studycore.kr/sitemap.xml",
    host: "https://studycore.kr",
  };
}
