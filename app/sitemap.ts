import { MetadataRoute } from "next";
import { services, categories } from "@/lib/services";

const BASE_URL = "https://bluemonitor.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const statusPages = services.map((service) => ({
    url: `${BASE_URL}/status/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  const categoryPages = categories.map((cat) => ({
    url: `${BASE_URL}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...statusPages,
    ...categoryPages,
  ];
}
