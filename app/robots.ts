import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/api",
          "/api/",
          "/sign-in",
          "/sign-up",
          "/sso-callback",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
