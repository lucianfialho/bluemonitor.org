import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  categories,
  getCategoryBySlug,
} from "@/lib/services";

// Mock the DB module
vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "@/lib/db";
import {
  getServices,
  getServiceBySlug,
  getServicesByCategory,
  getRelatedServices,
} from "@/lib/services";

const mockSql = vi.fn();

beforeEach(() => {
  vi.mocked(getDb).mockReturnValue(mockSql as unknown as ReturnType<typeof getDb>);
  mockSql.mockReset();
});

const mockServiceRow = {
  id: 1,
  slug: "chatgpt",
  name: "ChatGPT",
  domain: "chat.openai.com",
  category: "ai",
  check_url: "https://chat.openai.com",
  keywords: ["is chatgpt down", "chatgpt not working", "chatgpt status"],
  created_at: "2024-01-01T00:00:00Z",
};

describe("categories (static)", () => {
  it("has categories defined", () => {
    expect(categories.length).toBeGreaterThan(0);
  });

  it("each category has required fields", () => {
    for (const cat of categories) {
      expect(cat.slug).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.description).toBeTruthy();
    }
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

describe("getServices", () => {
  it("returns mapped services from DB", async () => {
    mockSql.mockResolvedValue([mockServiceRow]);
    const services = await getServices();
    expect(services).toHaveLength(1);
    expect(services[0].slug).toBe("chatgpt");
    expect(services[0].checkUrl).toBe("https://chat.openai.com");
  });

  it("returns empty array when DB has no services", async () => {
    mockSql.mockResolvedValue([]);
    const services = await getServices();
    expect(services).toEqual([]);
  });
});

describe("getServiceBySlug", () => {
  it("returns service for valid slug", async () => {
    mockSql.mockResolvedValue([mockServiceRow]);
    const service = await getServiceBySlug("chatgpt");
    expect(service).toBeDefined();
    expect(service!.name).toBe("ChatGPT");
  });

  it("returns undefined for invalid slug", async () => {
    mockSql.mockResolvedValue([]);
    const service = await getServiceBySlug("nonexistent");
    expect(service).toBeUndefined();
  });
});

describe("getServicesByCategory", () => {
  it("returns services for a valid category", async () => {
    mockSql.mockResolvedValue([mockServiceRow]);
    const result = await getServicesByCategory("ai");
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].category).toBe("ai");
  });

  it("returns empty array for invalid category", async () => {
    mockSql.mockResolvedValue([]);
    const result = await getServicesByCategory("nonexistent");
    expect(result).toEqual([]);
  });
});

describe("getRelatedServices", () => {
  it("returns related services from DB", async () => {
    const relatedRow = { ...mockServiceRow, id: 2, slug: "claude", name: "Claude", domain: "claude.ai" };
    mockSql.mockResolvedValue([relatedRow]);
    const related = await getRelatedServices("chatgpt");
    expect(related.length).toBeGreaterThan(0);
    expect(related[0].slug).toBe("claude");
  });

  it("returns empty array when no related services", async () => {
    mockSql.mockResolvedValue([]);
    const related = await getRelatedServices("nonexistent");
    expect(related).toEqual([]);
  });
});
