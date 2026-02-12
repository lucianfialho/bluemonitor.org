export interface Service {
  id?: number;
  slug: string;
  name: string;
  domain: string;
  category: Category;
  checkUrl: string;
  keywords: string[];
  created_at?: string;
  current_status?: "up" | "down" | "slow" | "dead" | null;
  current_response_time?: number | null;
  last_checked_at?: string | null;
  status_page_url?: string | null;
  feed_url?: string | null;
  feed_api_url?: string | null;
  feed_provider?: string | null;
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

export interface HealthEndpointResponse {
  status: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface StatusCheckResult {
  status: "up" | "down" | "slow";
  responseTime: number;
  statusCode: number;
  checkedAt: string;
  healthEndpoint?: boolean;
  healthData?: HealthEndpointResponse | null;
}

export interface StatusCheck {
  status: "up" | "down" | "slow";
  response_time: number;
  status_code: number;
  checked_at: string;
}

export interface Incident {
  id: number;
  service_id: number;
  source_id: string;
  title: string;
  description: string;
  severity: "minor" | "major" | "critical";
  status: "investigating" | "identified" | "monitoring" | "resolved";
  started_at: string;
  resolved_at: string | null;
  source_url: string | null;
  created_at: string;
  // Joined fields
  service_name?: string;
  service_slug?: string;
}
