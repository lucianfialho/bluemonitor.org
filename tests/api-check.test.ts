import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/check/[domain]/route";
import { NextRequest } from "next/server";

describe("GET /api/check/[domain]", () => {
  it("returns status check result for valid domain", async () => {
    const request = new NextRequest("http://localhost:3000/api/check/google.com");
    const response = await GET(request, {
      params: Promise.resolve({ domain: "google.com" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("responseTime");
    expect(data).toHaveProperty("statusCode");
    expect(data).toHaveProperty("checkedAt");
    expect(["up", "down", "slow"]).toContain(data.status);
    expect(typeof data.responseTime).toBe("number");
  }, 15000);

  it("returns error for empty domain", async () => {
    const request = new NextRequest("http://localhost:3000/api/check/");
    const response = await GET(request, {
      params: Promise.resolve({ domain: "" }),
    });

    expect(response.status).toBe(400);
  });

  it("returns down status for unreachable domain", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/check/this-domain-definitely-does-not-exist-12345.com"
    );
    const response = await GET(request, {
      params: Promise.resolve({ domain: "this-domain-definitely-does-not-exist-12345.com" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("down");
  }, 15000);
});
