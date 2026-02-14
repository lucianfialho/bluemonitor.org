import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name") || "Service";
  const domain = searchParams.get("domain") || "";
  const status = searchParams.get("status") || "up";

  const isUp = status === "up";
  const isSlow = status === "slow";
  const statusLabel = isUp ? "Operational" : isSlow ? "Slow" : "Down";
  const statusColor = isUp ? "#22c55e" : isSlow ? "#eab308" : "#ef4444";
  const toggleBg = isUp ? "#2563eb" : isSlow ? "#ca8a04" : "#dc2626";

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
        <div style={{ display: "flex", fontSize: 48, fontWeight: 400, color: "#27272a", marginBottom: 8 }}>
          Is {name} down?
        </div>

        {/* Domain */}
        <div style={{ display: "flex", fontSize: 22, color: "#a1a1aa", marginBottom: 48 }}>
          {domain || "\u00A0"}
        </div>

        {/* Toggle + Status row */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {/* Toggle switch */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isUp ? "flex-end" : "flex-start",
              width: 200,
              height: 96,
              borderRadius: 50,
              backgroundColor: toggleBg,
              padding: 10,
            }}
          >
            {/* Knob */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: "#ffffff",
                boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
              }}
            >
              <div style={{ display: "flex", width: 20, height: 20, borderRadius: 10, backgroundColor: statusColor }} />
            </div>
          </div>

          {/* Status label */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", width: 14, height: 14, borderRadius: 7, backgroundColor: statusColor }} />
            <div style={{ display: "flex", fontSize: 36, fontWeight: 600, color: "#27272a" }}>
              {statusLabel}
            </div>
          </div>
        </div>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 52 }}>
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
            <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, border: "2.5px solid #ffffff" }} />
          </div>
          <div style={{ display: "flex", fontSize: 20, fontWeight: 600, color: "#a1a1aa" }}>
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
