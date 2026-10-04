import { ImageResponse } from "next/og";

export const alt = "AVELA — decision intelligence for football clubs";
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
          color: "#102742",
          background: "linear-gradient(135deg, #F8F6F1 0%, #F1E9DE 100%)",
          fontFamily: "Arial, Helvetica, sans-serif"
        }}
      >
        <div style={{ width: "60%", display: "flex", flexDirection: "column", paddingRight: "44px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: "17px", fontWeight: 800, letterSpacing: "0.04em" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                background: "#2F8F83",
                marginRight: "12px",
                transform: "rotate(45deg)",
                borderRadius: "3px"
              }}
            />
            AVELA
          </div>

          <div style={{ color: "#2F8F83", fontSize: "14px", fontWeight: 800, letterSpacing: "0.12em", marginTop: "70px" }}>
            DECISION INTELLIGENCE FOR FOOTBALL CLUBS
          </div>

          <div style={{ fontSize: "60px", lineHeight: 0.98, fontWeight: 800, letterSpacing: "-0.045em", marginTop: "18px" }}>
            READ THE SIGNALS. MOVE THE CLUB.
          </div>

          <div style={{ fontSize: "20px", lineHeight: 1.35, color: "#637282", marginTop: "24px" }}>
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
              background: "#102742",
              color: "#F8F6F1"
            }}
          >
            <div style={{ display: "flex", color: "#C6D2DD", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em" }}>
              PRODUCT JOURNEY
            </div>

            {[
              ["01", "Radar"],
              ["02", "Opportunity brief"],
              ["03", "Campaign"],
              ["04", "Learning"]
            ].map(([num, label]) => (
              <div key={num} style={{ display: "flex", alignItems: "center", padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,0.09)" }}>
                <div style={{ display: "flex", width: "38px", color: "#74C9BB", fontSize: "11px", fontWeight: 800 }}>{num}</div>
                <div style={{ display: "flex", color: "#F8F6F1", fontSize: "18px", fontWeight: 800 }}>{label}</div>
              </div>
            ))}

            <div style={{ display: "flex", marginTop: "18px", color: "#C6D2DD", fontSize: "11px", lineHeight: 1.4 }}>
              Live · Modelled · Missing — always visible.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
