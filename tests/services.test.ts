import { describe, it, expect } from "vitest";
import {
  services,
  categories,
  getServiceBySlug,
  getServicesByCategory,
  getCategoryBySlug,
  getRelatedServices,
} from "@/lib/services";

describe("services data", () => {
  it("has services defined", () => {
    expect(services.length).toBeGreaterThan(0);
  });

  it("has categories defined", () => {
    expect(categories.length).toBeGreaterThan(0);
  });

  it("every service has required fields", () => {
    for (const service of services) {
      expect(service.slug).toBeTruthy();
      expect(service.name).toBeTruthy();
      expect(service.domain).toBeTruthy();
      expect(service.category).toBeTruthy();
      expect(service.checkUrl).toBeTruthy();
      expect(service.keywords.length).toBeGreaterThan(0);
    }
  });

  it("every service slug is unique", () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every service category references a valid category", () => {
    const categorySlugs = new Set(categories.map((c) => c.slug));
    for (const service of services) {
      expect(categorySlugs.has(service.category)).toBe(true);
    }
  });

  it("every service checkUrl starts with https://", () => {
    for (const service of services) {
      expect(service.checkUrl.startsWith("https://")).toBe(true);
    }
  });
});

describe("getServiceBySlug", () => {
  it("returns service for valid slug", () => {
    const service = getServiceBySlug("chatgpt");
    expect(service).toBeDefined();
    expect(service!.name).toBe("ChatGPT");
  });

  it("returns undefined for invalid slug", () => {
    expect(getServiceBySlug("nonexistent")).toBeUndefined();
  });
});

describe("getServicesByCategory", () => {
  it("returns services for a valid category", () => {
    const result = getServicesByCategory("ai");
    expect(result.length).toBeGreaterThan(0);
    for (const s of result) {
      expect(s.category).toBe("ai");
    }
  });

  it("returns empty array for invalid category", () => {
    expect(getServicesByCategory("nonexistent")).toEqual([]);
  });
});

describe("getCategoryBySlug", () => {
  it("returns category for valid slug", () => {
    const cat = getCategoryBySlug("gaming");
    expect(cat).toBeDefined();
    expect(cat!.name).toBe("Gaming");
  });

  it("returns undefined for invalid slug", () => {
    expect(getCategoryBySlug("nonexistent")).toBeUndefined();
  });
});

describe("getRelatedServices", () => {
  it("returns related services in the same category", () => {
    const related = getRelatedServices("chatgpt");
    expect(related.length).toBeGreaterThan(0);
    for (const s of related) {
      expect(s.category).toBe("ai");
      expect(s.slug).not.toBe("chatgpt");
    }
  });

  it("respects limit parameter", () => {
    const related = getRelatedServices("chatgpt", 2);
    expect(related.length).toBeLessThanOrEqual(2);
  });

  it("returns empty array for invalid slug", () => {
    expect(getRelatedServices("nonexistent")).toEqual([]);
  });
});
