import { ImageResponse } from "next/og";

export const alt = "Fan Growth Engine — turn fan data into the next best action for every fixture";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          padding: "54px",
          color: "#10211B",
          background: "linear-gradient(135deg, #F7F6F1 0%, #F0F1E8 100%)",
          fontFamily: "Arial, Helvetica, sans-serif"
        }}
      >
        <div style={{ width: "60%", display: "flex", flexDirection: "column", paddingRight: "44px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: "17px", fontWeight: 800, letterSpacing: "0.04em" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                background: "#C7EA3A",
                marginRight: "12px",
                transform: "rotate(45deg)",
                borderRadius: "3px"
              }}
            />
            FAN GROWTH ENGINE
          </div>

          <div style={{ color: "#526D00", fontSize: "14px", fontWeight: 800, letterSpacing: "0.12em", marginTop: "70px" }}>
            DECISION INTELLIGENCE FOR FOOTBALL CLUBS
          </div>

          <div style={{ fontSize: "60px", lineHeight: 0.98, fontWeight: 800, letterSpacing: "-0.045em", marginTop: "18px" }}>
            Turn fan data into the next best action for every fixture.
          </div>

          <div style={{ fontSize: "20px", lineHeight: 1.35, color: "#64706B", marginTop: "24px" }}>
            See what matters now, what to do next, and how much evidence the club really has.
          </div>
        </div>

        <div style={{ width: "40%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "26px",
              borderRadius: "24px",
              background: "#10211B",
              color: "#F7F8F5"
            }}
          >
            <div style={{ display: "flex", color: "#AEB8B3", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em" }}>
              PRODUCT JOURNEY
            </div>

            {[
              ["01", "Morning Brief"],
              ["02", "Opportunity"],
              ["03", "Decision"],
              ["04", "Results"]
            ].map(([num, label]) => (
              <div key={num} style={{ display: "flex", alignItems: "center", padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,0.09)" }}>
                <div style={{ display: "flex", width: "38px", color: "#C7EA3A", fontSize: "11px", fontWeight: 800 }}>{num}</div>
                <div style={{ display: "flex", color: "#F7F8F5", fontSize: "18px", fontWeight: 800 }}>{label}</div>
              </div>
            ))}

            <div style={{ display: "flex", marginTop: "18px", color: "#AEB8B3", fontSize: "11px", lineHeight: 1.4 }}>
              Live · Modelled · Missing — always visible.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
