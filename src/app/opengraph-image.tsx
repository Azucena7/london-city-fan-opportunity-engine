import { ImageResponse } from "next/og";

export const alt = "AVELA — growth intelligence for women’s football";
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
          color: "#10131A",
          background: "linear-gradient(135deg, #F7F8FA 0%, #EFF2F6 100%)",
          fontFamily: "Arial, Helvetica, sans-serif"
        }}
      >
        <div style={{ width: "60%", display: "flex", flexDirection: "column", paddingRight: "44px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: "17px", fontWeight: 800, letterSpacing: "0.04em" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                background: "#6657FF",
                marginRight: "12px",
                transform: "rotate(45deg)",
                borderRadius: "3px"
              }}
            />
            AVELA
          </div>

          <div style={{ color: "#5B50D6", fontSize: "14px", fontWeight: 800, letterSpacing: "0.12em", marginTop: "70px" }}>
            GROWTH INTELLIGENCE FOR WOMEN’S FOOTBALL
          </div>

          <div style={{ fontSize: "60px", lineHeight: 0.98, fontWeight: 800, letterSpacing: "-0.045em", marginTop: "18px" }}>
            Know where to act before the moment passes.
          </div>

          <div style={{ fontSize: "20px", lineHeight: 1.35, color: "#69707D", marginTop: "24px" }}>
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
              background: "#10131A",
              color: "#F7F8FA"
            }}
          >
            <div style={{ display: "flex", color: "#B9C0CC", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em" }}>
              PRODUCT JOURNEY
            </div>

            {[
              ["01", "Radar"],
              ["02", "Opportunity brief"],
              ["03", "Campaign"],
              ["04", "Learning"]
            ].map(([num, label]) => (
              <div key={num} style={{ display: "flex", alignItems: "center", padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,0.09)" }}>
                <div style={{ display: "flex", width: "38px", color: "#BDB7FF", fontSize: "11px", fontWeight: 800 }}>{num}</div>
                <div style={{ display: "flex", color: "#F7F8FA", fontSize: "18px", fontWeight: 800 }}>{label}</div>
              </div>
            ))}

            <div style={{ display: "flex", marginTop: "18px", color: "#B9C0CC", fontSize: "11px", lineHeight: 1.4 }}>
              Live · Modelled · Missing — always visible.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
