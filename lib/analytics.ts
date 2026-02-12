declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, string | number>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// Macro conversion
export const trackWaitlistJoin = () => trackEvent("generate_lead", { event_category: "conversion", event_label: "pro_waitlist" });

// Micro conversions
export const trackSignUp = () => trackEvent("sign_up");
export const trackWebhookCreate = () => trackEvent("webhook_create", { event_category: "engagement" });
export const trackWebhookTest = () => trackEvent("webhook_test", { event_category: "engagement" });
export const trackApiKeyCreate = () => trackEvent("api_key_create", { event_category: "engagement" });
export const trackWatchlistAdd = () => trackEvent("watchlist_add", { event_category: "engagement" });
