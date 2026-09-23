import { ImageResponse } from "next/og";

export const alt = "Fan Growth Engine — turn fan data into the next best action for every fixture";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        padding: "54px",
        color: "#f7f7f4",
        background: "linear-gradient(135deg, #070806 0%, #11150a 100%)",
        fontFamily: "Arial, Helvetica, sans-serif"
      }}>
        <div style={{ width: "58%", display: "flex", flexDirection: "column", paddingRight: "42px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: "17px", fontWeight: 800, letterSpacing: "0.1em" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#d8ff4f", marginRight: "12px" }} />
            FAN GROWTH ENGINE
          </div>
          <div style={{ color: "#d8ff4f", fontSize: "14px", fontWeight: 800, letterSpacing: "0.12em", marginTop: "68px" }}>
            DECISION INTELLIGENCE FOR FOOTBALL CLUBS
          </div>
          <div style={{ fontSize: "60px", lineHeight: 0.98, fontWeight: 800, letterSpacing: "-0.045em", marginTop: "18px" }}>
            Turn fan data into the next best action for every fixture.
          </div>
          <div style={{ fontSize: "20px", lineHeight: 1.35, color: "#c6c7bf", marginTop: "24px" }}>
            Discover the opportunity. Act before matchday. Learn what worked.
          </div>
          <div style={{ display: "flex", marginTop: "auto", gap: "10px" }}>
            {["DISCOVER", "ACT", "LEARN"].map((item) => (
              <div key={item} style={{ display: "flex", padding: "9px 13px", borderRadius: "999px", border: "1px solid rgba(216,255,79,0.28)", color: "#d8ff4f", fontSize: "11px", fontWeight: 800, letterSpacing: "0.08em" }}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: "42%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", padding: "26px", borderRadius: "22px", background: "#111310", border: "1px solid rgba(216,255,79,0.23)" }}>
            <div style={{ display: "flex", color: "#85867e", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em" }}>PRODUCT FLOW</div>
            {[
              ["01", "Opportunity"],
              ["02", "Decision Room"],
              ["03", "Results & Learning"],
              ["04", "Impact Model"],
              ["05", "90-Day Pilot"]
            ].map(([num, label]) => (
              <div key={num} style={{ display: "flex", alignItems: "center", padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", width: "38px", color: "#d8ff4f", fontSize: "11px", fontWeight: 800 }}>{num}</div>
                <div style={{ display: "flex", color: "#f7f7f4", fontSize: "18px", fontWeight: 800 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
