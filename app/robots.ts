import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.bluemonitor.org";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/badge/", "/api/og/"],
        disallow: ["/api/", "/admin/", "/dashboard/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
