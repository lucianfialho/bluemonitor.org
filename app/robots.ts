import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/badge/"],
      disallow: ["/api/", "/admin/", "/dashboard/"],
    },
    sitemap: "https://www.bluemonitor.org/sitemap.xml",
  };
}
