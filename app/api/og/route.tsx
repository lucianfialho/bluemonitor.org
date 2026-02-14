import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa",
        }}
      >
        {/* Headline */}
        <div style={{ display: "flex", fontSize: 52, fontWeight: 400, color: "#27272a", marginBottom: 60 }}>
          Turn on monitoring.
        </div>

        {/* Toggle switch */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            width: 280,
            height: 130,
            borderRadius: 70,
            backgroundColor: "#2563eb",
            padding: 12,
            boxShadow: "0 8px 32px rgba(37,99,235,0.3)",
          }}
        >
          {/* Knob */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 106,
              height: 106,
              borderRadius: 53,
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
          >
            {/* Pulse dot */}
            <div
              style={{
                display: "flex",
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "#22c55e",
              }}
            />
          </div>
        </div>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 60 }}>
          {/* Logo square */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: "#2563eb",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 18,
                height: 18,
                borderRadius: 9,
                border: "3px solid #ffffff",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: "#71717a" }}>
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
