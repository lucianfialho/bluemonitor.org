import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
        }}
      >
        {/* Background image */}
        <img
          src={`${baseUrl}/og-base.png`}
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Text overlay */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 48,
              fontWeight: 400,
              color: "#27272a",
              letterSpacing: "-0.02em",
            }}
          >
            Don&apos;t let downtime kill your vibe.
          </div>
        </div>

        {/* Logo bottom-right */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 32,
            right: 40,
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 7,
              backgroundColor: "#2563eb",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 16,
                height: 16,
                borderRadius: 8,
                border: "2.5px solid #ffffff",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 20, fontWeight: 600, color: "#71717a" }}>
            BlueMonitor
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
