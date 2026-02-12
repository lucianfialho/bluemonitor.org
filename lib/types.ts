export interface Service {
  id?: number;
  slug: string;
  name: string;
  domain: string;
  category: Category;
  checkUrl: string;
  keywords: string[];
  created_at?: string;
}

export type Category =
  | "ai"
  | "social-media"
  | "gaming"
  | "streaming"
  | "productivity"
  | "cloud"
  | "finance"
  | "communication"
  | "ecommerce"
  | "developer"
  | "education"
  | "delivery"
  | "vpn"
  | "entertainment"
  | "isp"
  | "dating"
  | "logistics"
  | "travel";

export interface CategoryInfo {
  slug: Category;
  name: string;
  description: string;
}

export interface StatusCheckResult {
  status: "up" | "down" | "slow";
  responseTime: number;
  statusCode: number;
  checkedAt: string;
}
