import { Service, CategoryInfo } from "./types";

export const categories: CategoryInfo[] = [
  { slug: "ai", name: "AI Services", description: "Artificial intelligence and machine learning platforms" },
  { slug: "social-media", name: "Social Media", description: "Social networking and media sharing platforms" },
  { slug: "gaming", name: "Gaming", description: "Gaming platforms and online games" },
  { slug: "streaming", name: "Streaming", description: "Video and music streaming services" },
  { slug: "productivity", name: "Productivity", description: "Productivity and collaboration tools" },
  { slug: "cloud", name: "Cloud Services", description: "Cloud computing and hosting platforms" },
  { slug: "finance", name: "Finance", description: "Banking and financial services" },
  { slug: "communication", name: "Communication", description: "Messaging and communication platforms" },
  { slug: "ecommerce", name: "E-Commerce", description: "Online shopping and marketplace platforms" },
  { slug: "developer", name: "Developer Tools", description: "Development platforms and tools" },
  { slug: "education", name: "Education", description: "Learning and education platforms" },
  { slug: "delivery", name: "Delivery", description: "Food and package delivery services" },
  { slug: "vpn", name: "VPN & Security", description: "VPN and security services" },
  { slug: "entertainment", name: "Entertainment", description: "Entertainment and media services" },
  { slug: "isp", name: "Internet Providers", description: "Internet service providers and telecom companies" },
  { slug: "dating", name: "Dating", description: "Dating apps and matchmaking platforms" },
  { slug: "logistics", name: "Logistics & Shipping", description: "Shipping and logistics tracking platforms" },
];

export const services: Service[] = [
  // AI Services
  { slug: "chatgpt", name: "ChatGPT", domain: "chat.openai.com", category: "ai", checkUrl: "https://chat.openai.com", keywords: ["is chatgpt down", "chatgpt not working", "chatgpt status"] },
  { slug: "claude", name: "Claude", domain: "claude.ai", category: "ai", checkUrl: "https://claude.ai", keywords: ["is claude down", "claude not working", "claude status"] },
  { slug: "gemini", name: "Gemini", domain: "gemini.google.com", category: "ai", checkUrl: "https://gemini.google.com", keywords: ["is gemini down", "gemini not working", "gemini status"] },
  { slug: "midjourney", name: "Midjourney", domain: "midjourney.com", category: "ai", checkUrl: "https://www.midjourney.com", keywords: ["is midjourney down", "midjourney not working", "midjourney status"] },
  { slug: "copilot", name: "Microsoft Copilot", domain: "copilot.microsoft.com", category: "ai", checkUrl: "https://copilot.microsoft.com", keywords: ["is copilot down", "copilot not working", "copilot status"] },
  { slug: "perplexity", name: "Perplexity", domain: "perplexity.ai", category: "ai", checkUrl: "https://www.perplexity.ai", keywords: ["is perplexity down", "perplexity not working", "perplexity status"] },
  { slug: "cursor", name: "Cursor", domain: "cursor.com", category: "ai", checkUrl: "https://www.cursor.com", keywords: ["is cursor down", "cursor not working", "cursor status"] },

  // Social Media
  { slug: "instagram", name: "Instagram", domain: "instagram.com", category: "social-media", checkUrl: "https://www.instagram.com", keywords: ["is instagram down", "instagram not working", "instagram status"] },
  { slug: "facebook", name: "Facebook", domain: "facebook.com", category: "social-media", checkUrl: "https://www.facebook.com", keywords: ["is facebook down", "facebook not working", "facebook status"] },
  { slug: "twitter", name: "X (Twitter)", domain: "x.com", category: "social-media", checkUrl: "https://x.com", keywords: ["is twitter down", "is x down", "twitter not working"] },
  { slug: "reddit", name: "Reddit", domain: "reddit.com", category: "social-media", checkUrl: "https://www.reddit.com", keywords: ["is reddit down", "reddit not working", "reddit status"] },
  { slug: "tiktok", name: "TikTok", domain: "tiktok.com", category: "social-media", checkUrl: "https://www.tiktok.com", keywords: ["is tiktok down", "tiktok not working", "tiktok status"] },
  { slug: "snapchat", name: "Snapchat", domain: "snapchat.com", category: "social-media", checkUrl: "https://www.snapchat.com", keywords: ["is snapchat down", "snapchat not working", "snapchat status"] },
  { slug: "linkedin", name: "LinkedIn", domain: "linkedin.com", category: "social-media", checkUrl: "https://www.linkedin.com", keywords: ["is linkedin down", "linkedin not working", "linkedin status"] },
  { slug: "pinterest", name: "Pinterest", domain: "pinterest.com", category: "social-media", checkUrl: "https://www.pinterest.com", keywords: ["is pinterest down", "pinterest not working", "pinterest status"] },
  { slug: "threads", name: "Threads", domain: "threads.net", category: "social-media", checkUrl: "https://www.threads.net", keywords: ["is threads down", "threads not working", "threads status"] },
  { slug: "bluesky", name: "Bluesky", domain: "bsky.app", category: "social-media", checkUrl: "https://bsky.app", keywords: ["is bluesky down", "bluesky not working", "bluesky status"] },
  { slug: "deviantart", name: "DeviantArt", domain: "deviantart.com", category: "social-media", checkUrl: "https://www.deviantart.com", keywords: ["is deviantart down", "deviantart not working", "deviantart status"] },
  { slug: "letterboxd", name: "Letterboxd", domain: "letterboxd.com", category: "social-media", checkUrl: "https://letterboxd.com", keywords: ["is letterboxd down", "letterboxd not working", "letterboxd status"] },

  // Gaming
  { slug: "roblox", name: "Roblox", domain: "roblox.com", category: "gaming", checkUrl: "https://www.roblox.com", keywords: ["is roblox down", "roblox not working", "roblox status"] },
  { slug: "steam", name: "Steam", domain: "store.steampowered.com", category: "gaming", checkUrl: "https://store.steampowered.com", keywords: ["is steam down", "steam not working", "steam status"] },
  { slug: "fortnite", name: "Fortnite", domain: "fortnite.com", category: "gaming", checkUrl: "https://www.fortnite.com", keywords: ["is fortnite down", "fortnite not working", "fortnite status"] },
  { slug: "xbox-live", name: "Xbox Live", domain: "xbox.com", category: "gaming", checkUrl: "https://www.xbox.com", keywords: ["is xbox live down", "xbox live not working", "xbox status"] },
  { slug: "playstation-network", name: "PlayStation Network", domain: "playstation.com", category: "gaming", checkUrl: "https://www.playstation.com", keywords: ["is psn down", "playstation network not working", "psn status"] },
  { slug: "epic-games", name: "Epic Games", domain: "epicgames.com", category: "gaming", checkUrl: "https://www.epicgames.com", keywords: ["is epic games down", "epic games not working", "epic games status"] },
  { slug: "minecraft", name: "Minecraft", domain: "minecraft.net", category: "gaming", checkUrl: "https://www.minecraft.net", keywords: ["is minecraft down", "minecraft not working", "minecraft status"] },
  { slug: "valorant", name: "Valorant", domain: "playvalorant.com", category: "gaming", checkUrl: "https://playvalorant.com", keywords: ["is valorant down", "valorant not working", "valorant status"] },
  { slug: "league-of-legends", name: "League of Legends", domain: "leagueoflegends.com", category: "gaming", checkUrl: "https://www.leagueoflegends.com", keywords: ["is league of legends down", "lol not working", "lol status"] },
  { slug: "warzone", name: "Call of Duty: Warzone", domain: "callofduty.com", category: "gaming", checkUrl: "https://www.callofduty.com", keywords: ["is warzone down", "warzone not working", "warzone status"] },
  { slug: "world-of-warcraft", name: "World of Warcraft", domain: "worldofwarcraft.blizzard.com", category: "gaming", checkUrl: "https://worldofwarcraft.blizzard.com", keywords: ["is world of warcraft down", "wow not working", "wow status"] },
  { slug: "clash-royale", name: "Clash Royale", domain: "supercell.com", category: "gaming", checkUrl: "https://supercell.com/en/games/clashroyale/", keywords: ["is clash royale down", "clash royale not working", "clash royale status"] },
  { slug: "cs2", name: "Counter-Strike 2", domain: "counter-strike.net", category: "gaming", checkUrl: "https://www.counter-strike.net", keywords: ["is cs2 down", "cs2 not working", "counter-strike 2 status"] },

  // Streaming
  { slug: "youtube", name: "YouTube", domain: "youtube.com", category: "streaming", checkUrl: "https://www.youtube.com", keywords: ["is youtube down", "youtube not working", "youtube status"] },
  { slug: "netflix", name: "Netflix", domain: "netflix.com", category: "streaming", checkUrl: "https://www.netflix.com", keywords: ["is netflix down", "netflix not working", "netflix status"] },
  { slug: "twitch", name: "Twitch", domain: "twitch.tv", category: "streaming", checkUrl: "https://www.twitch.tv", keywords: ["is twitch down", "twitch not working", "twitch status"] },
  { slug: "spotify", name: "Spotify", domain: "spotify.com", category: "streaming", checkUrl: "https://www.spotify.com", keywords: ["is spotify down", "spotify not working", "spotify status"] },
  { slug: "disney-plus", name: "Disney+", domain: "disneyplus.com", category: "streaming", checkUrl: "https://www.disneyplus.com", keywords: ["is disney plus down", "disney plus not working", "disney plus status"] },
  { slug: "hbo-max", name: "Max (HBO)", domain: "max.com", category: "streaming", checkUrl: "https://www.max.com", keywords: ["is hbo max down", "max not working", "hbo max status"] },
  { slug: "prime-video", name: "Prime Video", domain: "primevideo.com", category: "streaming", checkUrl: "https://www.primevideo.com", keywords: ["is prime video down", "prime video not working", "prime video status"] },
  { slug: "kick", name: "Kick", domain: "kick.com", category: "streaming", checkUrl: "https://kick.com", keywords: ["is kick down", "kick not working", "kick status"] },
  { slug: "fubo", name: "Fubo", domain: "fubo.tv", category: "streaming", checkUrl: "https://www.fubo.tv", keywords: ["is fubo down", "fubo not working", "fubo status"] },
  { slug: "aniwatch", name: "Aniwatch", domain: "aniwatch.to", category: "streaming", checkUrl: "https://aniwatch.to", keywords: ["is aniwatch down", "aniwatch not working", "aniwatch status"] },

  // Productivity
  { slug: "outlook", name: "Outlook", domain: "outlook.live.com", category: "productivity", checkUrl: "https://outlook.live.com", keywords: ["is outlook down", "outlook not working", "outlook status"] },
  { slug: "gmail", name: "Gmail", domain: "mail.google.com", category: "productivity", checkUrl: "https://mail.google.com", keywords: ["is gmail down", "gmail not working", "gmail status"] },
  { slug: "google-drive", name: "Google Drive", domain: "drive.google.com", category: "productivity", checkUrl: "https://drive.google.com", keywords: ["is google drive down", "google drive not working", "google drive status"] },
  { slug: "notion", name: "Notion", domain: "notion.so", category: "productivity", checkUrl: "https://www.notion.so", keywords: ["is notion down", "notion not working", "notion status"] },
  { slug: "slack", name: "Slack", domain: "slack.com", category: "productivity", checkUrl: "https://slack.com", keywords: ["is slack down", "slack not working", "slack status"] },
  { slug: "teams", name: "Microsoft Teams", domain: "teams.microsoft.com", category: "productivity", checkUrl: "https://teams.microsoft.com", keywords: ["is teams down", "teams not working", "microsoft teams status"] },
  { slug: "zoom", name: "Zoom", domain: "zoom.us", category: "productivity", checkUrl: "https://zoom.us", keywords: ["is zoom down", "zoom not working", "zoom status"] },
  { slug: "grammarly", name: "Grammarly", domain: "grammarly.com", category: "productivity", checkUrl: "https://www.grammarly.com", keywords: ["is grammarly down", "grammarly not working", "grammarly status"] },
  { slug: "monday", name: "Monday.com", domain: "monday.com", category: "productivity", checkUrl: "https://monday.com", keywords: ["is monday.com down", "monday not working", "monday.com status"] },
  { slug: "shipstation", name: "ShipStation", domain: "shipstation.com", category: "productivity", checkUrl: "https://www.shipstation.com", keywords: ["is shipstation down", "shipstation not working", "shipstation status"] },
  { slug: "box", name: "Box", domain: "box.com", category: "productivity", checkUrl: "https://www.box.com", keywords: ["is box down", "box not working", "box status"] },

  // Education
  { slug: "canvas", name: "Canvas", domain: "instructure.com", category: "education", checkUrl: "https://www.instructure.com", keywords: ["is canvas down", "canvas not working", "canvas status"] },
  { slug: "ap-classroom", name: "AP Classroom", domain: "apclassroom.collegeboard.org", category: "education", checkUrl: "https://apclassroom.collegeboard.org", keywords: ["is ap classroom down", "ap classroom not working", "ap classroom status"] },
  { slug: "collegeboard", name: "College Board", domain: "collegeboard.org", category: "education", checkUrl: "https://www.collegeboard.org", keywords: ["is collegeboard down", "collegeboard not working", "college board status"] },

  // Cloud & Developer
  { slug: "aws", name: "AWS", domain: "aws.amazon.com", category: "cloud", checkUrl: "https://aws.amazon.com", keywords: ["is aws down", "aws not working", "aws status"] },
  { slug: "github", name: "GitHub", domain: "github.com", category: "developer", checkUrl: "https://github.com", keywords: ["is github down", "github not working", "github status"] },
  { slug: "cloudflare", name: "Cloudflare", domain: "cloudflare.com", category: "cloud", checkUrl: "https://www.cloudflare.com", keywords: ["is cloudflare down", "cloudflare not working", "cloudflare status"] },
  { slug: "vercel", name: "Vercel", domain: "vercel.com", category: "developer", checkUrl: "https://vercel.com", keywords: ["is vercel down", "vercel not working", "vercel status"] },
  { slug: "openai-api", name: "OpenAI API", domain: "api.openai.com", category: "developer", checkUrl: "https://api.openai.com", keywords: ["is openai api down", "openai api not working", "openai api status"] },

  // Communication
  { slug: "discord", name: "Discord", domain: "discord.com", category: "communication", checkUrl: "https://discord.com", keywords: ["is discord down", "discord not working", "discord status"] },
  { slug: "whatsapp", name: "WhatsApp", domain: "web.whatsapp.com", category: "communication", checkUrl: "https://web.whatsapp.com", keywords: ["is whatsapp down", "whatsapp not working", "whatsapp status"] },
  { slug: "telegram", name: "Telegram", domain: "telegram.org", category: "communication", checkUrl: "https://telegram.org", keywords: ["is telegram down", "telegram not working", "telegram status"] },
  { slug: "signal", name: "Signal", domain: "signal.org", category: "communication", checkUrl: "https://signal.org", keywords: ["is signal down", "signal not working", "signal status"] },
  { slug: "kik", name: "Kik", domain: "kik.com", category: "communication", checkUrl: "https://www.kik.com", keywords: ["is kik down", "kik not working", "kik status"] },

  // E-Commerce
  { slug: "amazon", name: "Amazon", domain: "amazon.com", category: "ecommerce", checkUrl: "https://www.amazon.com", keywords: ["is amazon down", "amazon not working", "amazon status"] },
  { slug: "shopify", name: "Shopify", domain: "shopify.com", category: "ecommerce", checkUrl: "https://www.shopify.com", keywords: ["is shopify down", "shopify not working", "shopify status"] },
  { slug: "ebay", name: "eBay", domain: "ebay.com", category: "ecommerce", checkUrl: "https://www.ebay.com", keywords: ["is ebay down", "ebay not working", "ebay status"] },
  { slug: "paypal", name: "PayPal", domain: "paypal.com", category: "finance", checkUrl: "https://www.paypal.com", keywords: ["is paypal down", "paypal not working", "paypal status"] },
  { slug: "airbnb", name: "Airbnb", domain: "airbnb.com", category: "ecommerce", checkUrl: "https://www.airbnb.com", keywords: ["is airbnb down", "airbnb not working", "airbnb status"] },

  // Delivery
  { slug: "doordash", name: "DoorDash", domain: "doordash.com", category: "delivery", checkUrl: "https://www.doordash.com", keywords: ["is doordash down", "doordash not working", "doordash status"] },
  { slug: "uber-eats", name: "Uber Eats", domain: "ubereats.com", category: "delivery", checkUrl: "https://www.ubereats.com", keywords: ["is uber eats down", "uber eats not working", "uber eats status"] },
  { slug: "grubhub", name: "Grubhub", domain: "grubhub.com", category: "delivery", checkUrl: "https://www.grubhub.com", keywords: ["is grubhub down", "grubhub not working", "grubhub status"] },

  // Internet Providers
  { slug: "cox", name: "Cox", domain: "cox.com", category: "isp", checkUrl: "https://www.cox.com", keywords: ["is cox down", "is cox cable down", "is cox wifi down", "cox status"] },
  { slug: "frontier", name: "Frontier", domain: "frontier.com", category: "isp", checkUrl: "https://frontier.com", keywords: ["is frontier down", "frontier not working", "frontier status"] },
  { slug: "sparklight", name: "Sparklight", domain: "sparklight.com", category: "isp", checkUrl: "https://www.sparklight.com", keywords: ["is sparklight down", "sparklight not working", "sparklight status"] },
  { slug: "dish-network", name: "Dish Network", domain: "dish.com", category: "isp", checkUrl: "https://www.dish.com", keywords: ["is dish network down", "dish network not working", "dish status"] },
  { slug: "metro-pcs", name: "Metro by T-Mobile", domain: "metrobyt-mobile.com", category: "isp", checkUrl: "https://www.metrobyt-mobile.com", keywords: ["is metro pcs down", "metro by t-mobile not working", "metro pcs status"] },
  { slug: "breezeline", name: "Breezeline", domain: "breezeline.com", category: "isp", checkUrl: "https://www.breezeline.com", keywords: ["is breezeline down", "breezeline not working", "breezeline status"] },
  { slug: "brightspeed", name: "Brightspeed", domain: "brightspeed.com", category: "isp", checkUrl: "https://www.brightspeed.com", keywords: ["is brightspeed down", "brightspeed not working", "brightspeed status"] },
  { slug: "mint-mobile", name: "Mint Mobile", domain: "mintmobile.com", category: "isp", checkUrl: "https://www.mintmobile.com", keywords: ["is mint mobile down", "mint mobile not working", "mint mobile status"] },

  // Dating
  { slug: "hinge", name: "Hinge", domain: "hinge.co", category: "dating", checkUrl: "https://hinge.co", keywords: ["is hinge down", "hinge not working", "hinge status"] },
  { slug: "tinder", name: "Tinder", domain: "tinder.com", category: "dating", checkUrl: "https://tinder.com", keywords: ["is tinder down", "tinder not working", "tinder status"] },

  // Logistics & Shipping
  { slug: "fedex", name: "FedEx", domain: "fedex.com", category: "logistics", checkUrl: "https://www.fedex.com", keywords: ["is fedex down", "fedex not working", "fedex status"] },

  // Entertainment & Apps
  { slug: "app-store", name: "Apple App Store", domain: "apps.apple.com", category: "entertainment", checkUrl: "https://apps.apple.com", keywords: ["is the app store down", "app store not working", "app store status"] },
  { slug: "life360", name: "Life360", domain: "life360.com", category: "entertainment", checkUrl: "https://www.life360.com", keywords: ["is life 360 down", "life360 not working", "life360 status"] },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getServicesByCategory(category: string): Service[] {
  return services.filter((s) => s.category === category);
}

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getRelatedServices(slug: string, limit = 6): Service[] {
  const service = getServiceBySlug(slug);
  if (!service) return [];
  return services
    .filter((s) => s.category === service.category && s.slug !== slug)
    .slice(0, limit);
}
