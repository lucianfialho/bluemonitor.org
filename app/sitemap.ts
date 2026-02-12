import { MetadataRoute } from "next";
import { getServices, categories } from "@/lib/services";

const BASE_URL = "https://www.bluemonitor.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allServices = await getServices();

  const statusPages = allServices.map((service) => ({
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
    {
      url: `${BASE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/developers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...statusPages,
    ...categoryPages,
  ];
}
