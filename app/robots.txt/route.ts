export function GET() {
  const body = `User-agent: *
Allow: /
Allow: /api/badge/
Allow: /api/og/
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/

Sitemap: https://www.bluemonitor.org/sitemap.xml
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
