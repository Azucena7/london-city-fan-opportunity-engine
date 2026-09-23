import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        padding: "52px",
        color: "#f7f7f4",
        background: "linear-gradient(135deg, #070806 0%, #11150a 100%)",
        fontFamily: "Arial, Helvetica, sans-serif"
      }}>
        <div style={{ width: "55%", display: "flex", flexDirection: "column", paddingRight: "42px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: "17px", fontWeight: 800, letterSpacing: "0.1em" }}>
            <span style={{ width: "12px", height: "12px", display: "flex", borderRadius: "50%", background: "#d8ff4f", marginRight: "12px" }} />
            FAN GROWTH ENGINE
          </div>
          <div style={{ display: "flex", marginTop: "62px", color: "#d8ff4f", fontSize: "14px", fontWeight: 800, letterSpacing: "0.12em" }}>
            DECISION INTELLIGENCE FOR FOOTBALL CLUBS
          </div>
          <div style={{ display: "flex", marginTop: "18px", fontSize: "58px", lineHeight: 0.98, fontWeight: 800, letterSpacing: "-0.04em" }}>
            Turn fan data into the next best action for every fixture.
          </div>
          <div style={{ display: "flex", marginTop: "24px", color: "#c7c8c0", fontSize: "20px", lineHeight: 1.35 }}>
            Discover the opportunity. Act before matchday. Learn what worked.
          </div>
          <div style={{ display: "flex", marginTop: "auto", color: "#7f8079", fontSize: "14px" }}>
            london-city-fan-opportunity-engine.vercel.app
          </div>
        </div>

        <div style={{
          width: "45%",
          display: "flex",
          flexDirection: "column",
          padding: "22px",
          borderRadius: "22px",
          background: "#111310",
          border: "1px solid rgba(216,255,79,0.25)"
        }}>
          <div style={{ display: "flex", color: "#818279", fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em" }}>
            LONDON CITY · GUIDED DEMO
          </div>
          <div style={{ display: "flex", marginTop: "18px", color: "#f7f7f4", fontSize: "28px", lineHeight: 1.08, fontWeight: 800 }}>
            Convert first-time attendees into repeat visitors.
          </div>
          <div style={{ display: "flex", marginTop: "22px" }}>
            {[
              ["OPPORTUNITY", "Repeat attendance"],
              ["ACTION", "CRM retention"],
              ["IMPACT", "+280–420 tickets*"]
            ].map(([label, value], index) => (
              <div key={label} style={{
                width: "32%",
                marginLeft: index === 0 ? "0" : "2%",
                display: "flex",
                flexDirection: "column",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.09)",
                background: "rgba(255,255,255,0.025)"
              }}>
                <div style={{ display: "flex", color: "#d8ff4f", fontSize: "9px", fontWeight: 800, letterSpacing: "0.08em" }}>{label}</div>
                <div style={{ display: "flex", marginTop: "7px", color: "#f7f7f4", fontSize: "16px", lineHeight: 1.2, fontWeight: 800 }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: "18px", padding: "16px", borderRadius: "14px", color: "#11130c", background: "#d8ff4f", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: "9px", fontWeight: 800, letterSpacing: "0.08em", opacity: 0.62 }}>90-DAY PILOT · 6 FIXTURES</div>
            <div style={{ display: "flex", marginTop: "6px", fontSize: "18px", fontWeight: 800 }}>Discover → Act → Measure → Learn</div>
          </div>
          <div style={{ display: "flex", marginTop: "auto", color: "#73746d", fontSize: "11px", lineHeight: 1.35 }}>
            *Illustrative product scenario until club data is connected.
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
