export interface BotInfo {
  name: string;
  displayName: string;
  category: BotCategory;
}

export type BotCategory =
  | "search_engine"
  | "ai_crawler"
  | "social"
  | "seo"
  | "monitoring";

interface BotPattern {
  pattern: RegExp;
  name: string;
  displayName: string;
  category: BotCategory;
}

const BOT_PATTERNS: BotPattern[] = [
  // Search engines
  { pattern: /Googlebot/i, name: "googlebot", displayName: "Googlebot", category: "search_engine" },
  { pattern: /bingbot/i, name: "bingbot", displayName: "Bingbot", category: "search_engine" },
  { pattern: /YandexBot/i, name: "yandexbot", displayName: "YandexBot", category: "search_engine" },
  { pattern: /Baiduspider/i, name: "baiduspider", displayName: "Baiduspider", category: "search_engine" },
  { pattern: /DuckDuckBot/i, name: "duckduckbot", displayName: "DuckDuckBot", category: "search_engine" },
  { pattern: /Applebot/i, name: "applebot", displayName: "Applebot", category: "search_engine" },
  { pattern: /PetalBot/i, name: "petalbot", displayName: "PetalBot", category: "search_engine" },
  { pattern: /Sogou/i, name: "sogoubot", displayName: "Sogou", category: "search_engine" },
  { pattern: /NaverBot/i, name: "naverbot", displayName: "NaverBot", category: "search_engine" },
  { pattern: /Seznambot/i, name: "seznambot", displayName: "Seznambot", category: "search_engine" },

  // AI crawlers
  { pattern: /GPTBot/i, name: "gptbot", displayName: "GPTBot", category: "ai_crawler" },
  { pattern: /ChatGPT-User/i, name: "chatgpt-user", displayName: "ChatGPT-User", category: "ai_crawler" },
  { pattern: /OAI-SearchBot/i, name: "oai-searchbot", displayName: "OAI-SearchBot", category: "ai_crawler" },
  { pattern: /ClaudeBot/i, name: "claudebot", displayName: "ClaudeBot", category: "ai_crawler" },
  { pattern: /anthropic-ai/i, name: "anthropic-ai", displayName: "Anthropic AI", category: "ai_crawler" },
  { pattern: /PerplexityBot/i, name: "perplexitybot", displayName: "PerplexityBot", category: "ai_crawler" },
  { pattern: /Bytespider/i, name: "bytespider", displayName: "Bytespider", category: "ai_crawler" },
  { pattern: /CCBot/i, name: "ccbot", displayName: "CCBot", category: "ai_crawler" },
  { pattern: /Meta-ExternalAgent/i, name: "meta-externalagent", displayName: "Meta-ExternalAgent", category: "ai_crawler" },
  { pattern: /Google-Extended/i, name: "google-extended", displayName: "Google-Extended", category: "ai_crawler" },
  { pattern: /Amazonbot/i, name: "amazonbot", displayName: "Amazonbot", category: "ai_crawler" },
  { pattern: /cohere-ai/i, name: "cohere-ai", displayName: "Cohere AI", category: "ai_crawler" },
  { pattern: /DeepSeekBot/i, name: "deepseekbot", displayName: "DeepSeekBot", category: "ai_crawler" },
  { pattern: /YouBot/i, name: "youbot", displayName: "YouBot", category: "ai_crawler" },
  { pattern: /AI2Bot/i, name: "ai2bot", displayName: "AI2Bot", category: "ai_crawler" },
  { pattern: /Timpibot/i, name: "timpibot", displayName: "Timpibot", category: "ai_crawler" },

  // Social
  { pattern: /Twitterbot/i, name: "twitterbot", displayName: "Twitterbot", category: "social" },
  { pattern: /facebookexternalhit/i, name: "facebookbot", displayName: "Facebook", category: "social" },
  { pattern: /LinkedInBot/i, name: "linkedinbot", displayName: "LinkedInBot", category: "social" },
  { pattern: /Slackbot/i, name: "slackbot", displayName: "Slackbot", category: "social" },
  { pattern: /Discordbot/i, name: "discordbot", displayName: "Discordbot", category: "social" },
  { pattern: /TelegramBot/i, name: "telegrambot", displayName: "TelegramBot", category: "social" },
  { pattern: /WhatsApp/i, name: "whatsapp", displayName: "WhatsApp", category: "social" },
  { pattern: /Pinterestbot/i, name: "pinterestbot", displayName: "Pinterest", category: "social" },

  // SEO
  { pattern: /AhrefsBot/i, name: "ahrefsbot", displayName: "AhrefsBot", category: "seo" },
  { pattern: /SemrushBot/i, name: "semrushbot", displayName: "SemrushBot", category: "seo" },
  { pattern: /DotBot/i, name: "dotbot", displayName: "DotBot", category: "seo" },
  { pattern: /MJ12bot/i, name: "mj12bot", displayName: "MJ12bot", category: "seo" },
  { pattern: /DataForSeoBot/i, name: "dataforseobot", displayName: "DataForSeoBot", category: "seo" },
  { pattern: /Screaming Frog/i, name: "screamingfrog", displayName: "Screaming Frog", category: "seo" },
  { pattern: /BLEXBot/i, name: "blexbot", displayName: "BLEXBot", category: "seo" },

  // Monitoring
  { pattern: /UptimeRobot/i, name: "uptimerobot", displayName: "UptimeRobot", category: "monitoring" },
  { pattern: /Pingdom/i, name: "pingdom", displayName: "Pingdom", category: "monitoring" },
  { pattern: /NewRelicPinger/i, name: "newrelicpinger", displayName: "New Relic", category: "monitoring" },
  { pattern: /Datadog/i, name: "datadoghq", displayName: "Datadog", category: "monitoring" },
  { pattern: /Site24x7/i, name: "site24x7", displayName: "Site24x7", category: "monitoring" },
];

export const AI_CRAWLER_BOTS = BOT_PATTERNS
  .filter((b) => b.category === "ai_crawler")
  .map((b) => b.name);

const KNOWN_BOT_NAMES = new Set(BOT_PATTERNS.map((b) => b.name));

export function identifyBot(userAgent: string): BotInfo | null {
  for (const bot of BOT_PATTERNS) {
    if (bot.pattern.test(userAgent)) {
      return { name: bot.name, displayName: bot.displayName, category: bot.category };
    }
  }
  return null;
}

export function isKnownBotName(name: string): boolean {
  return KNOWN_BOT_NAMES.has(name) || name === "other";
}

export const CATEGORY_LABELS: Record<BotCategory, string> = {
  search_engine: "Search Engines",
  ai_crawler: "AI Crawlers",
  social: "Social",
  seo: "SEO",
  monitoring: "Monitoring",
};

export const CATEGORY_COLORS: Record<BotCategory, string> = {
  search_engine: "#3b82f6",
  ai_crawler: "#8b5cf6",
  social: "#f59e0b",
  seo: "#10b981",
  monitoring: "#6b7280",
};

export const BOT_ICONS: Record<string, string> = {
  // Search engines
  googlebot: "https://www.google.com/favicon.ico",
  bingbot: "https://www.bing.com/favicon.ico",
  yandexbot: "https://yandex.com/favicon.ico",
  baiduspider: "https://www.baidu.com/favicon.ico",
  duckduckbot: "https://duckduckgo.com/favicon.ico",
  applebot: "https://www.apple.com/favicon.ico",
  petalbot: "https://www.huawei.com/favicon.ico",
  sogoubot: "https://www.sogou.com/favicon.ico",
  naverbot: "https://www.naver.com/favicon.ico",
  seznambot: "https://www.seznam.cz/favicon.ico",
  // AI crawlers
  gptbot: "https://chat.openai.com/favicon.ico",
  "chatgpt-user": "https://chat.openai.com/favicon.ico",
  "oai-searchbot": "https://chat.openai.com/favicon.ico",
  claudebot: "https://claude.ai/favicon.ico",
  "anthropic-ai": "https://claude.ai/favicon.ico",
  perplexitybot: "https://www.perplexity.ai/favicon.ico",
  bytespider: "https://www.tiktok.com/favicon.ico",
  ccbot: "https://commoncrawl.org/favicon.ico",
  "meta-externalagent": "https://www.meta.com/favicon.ico",
  "google-extended": "https://www.google.com/favicon.ico",
  amazonbot: "https://www.amazon.com/favicon.ico",
  "cohere-ai": "https://cohere.com/favicon.ico",
  deepseekbot: "https://www.deepseek.com/favicon.ico",
  youbot: "https://you.com/favicon.ico",
  ai2bot: "https://allenai.org/favicon.ico",
  timpibot: "https://timpi.io/favicon.ico",
  // Social
  twitterbot: "https://x.com/favicon.ico",
  facebookbot: "https://www.facebook.com/favicon.ico",
  linkedinbot: "https://www.linkedin.com/favicon.ico",
  slackbot: "https://slack.com/favicon.ico",
  discordbot: "https://discord.com/favicon.ico",
  telegrambot: "https://telegram.org/favicon.ico",
  whatsapp: "https://www.whatsapp.com/favicon.ico",
  pinterestbot: "https://www.pinterest.com/favicon.ico",
  // SEO
  ahrefsbot: "https://ahrefs.com/favicon.ico",
  semrushbot: "https://www.semrush.com/favicon.ico",
  dotbot: "https://moz.com/favicon.ico",
  mj12bot: "https://majestic.com/favicon.ico",
  dataforseobot: "https://dataforseo.com/favicon.ico",
  screamingfrog: "https://www.screamingfrog.co.uk/favicon.ico",
  blexbot: "https://webmeup.com/favicon.ico",
  // Monitoring
  uptimerobot: "https://uptimerobot.com/favicon.ico",
  pingdom: "https://www.pingdom.com/favicon.ico",
  newrelicpinger: "https://newrelic.com/favicon.ico",
  datadoghq: "https://www.datadoghq.com/favicon.ico",
  site24x7: "https://www.site24x7.com/favicon.ico",
};
