import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import StatusBadge from "@/components/StatusBadge";
import ServiceCard from "@/components/ServiceCard";
import { Service } from "@/lib/types";

afterEach(() => {
  cleanup();
});

const mockService: Service = {
  slug: "test-service",
  name: "Test Service",
  domain: "test.com",
  category: "ai",
  checkUrl: "https://test.com",
  keywords: ["is test service down"],
};

describe("StatusBadge", () => {
  it("renders operational status", () => {
    render(<StatusBadge status="up" />);
    expect(screen.getByText("Operational")).toBeInTheDocument();
  });

  it("renders down status", () => {
    render(<StatusBadge status="down" />);
    expect(screen.getByText("Down")).toBeInTheDocument();
  });

  it("renders slow status", () => {
    render(<StatusBadge status="slow" />);
    expect(screen.getByText("Slow")).toBeInTheDocument();
  });

  it("renders checking status", () => {
    render(<StatusBadge status="checking" />);
    expect(screen.getByText("Checking...")).toBeInTheDocument();
  });

  it("renders unknown status", () => {
    render(<StatusBadge status="unknown" />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});

describe("ServiceCard", () => {
  it("renders service name and domain", () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByText("Test Service")).toBeInTheDocument();
    expect(screen.getByText("test.com")).toBeInTheDocument();
  });

  it("links to the service status page", () => {
    render(<ServiceCard service={mockService} />);
    const link = screen.getByRole("link", { name: /Test Service/i });
    expect(link).toHaveAttribute("href", "/status/test-service");
  });
});
