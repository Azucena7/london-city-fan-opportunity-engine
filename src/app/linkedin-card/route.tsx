import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          padding: "52px",
          color: "#10211B",
          background: "linear-gradient(135deg, #F7F6F1 0%, #F0F1E8 100%)",
          fontFamily: "Arial, Helvetica, sans-serif"
        }}
      >
        <div style={{ width: "58%", display: "flex", flexDirection: "column", paddingRight: "44px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: "17px", fontWeight: 800, letterSpacing: "0.04em" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                display: "flex",
                background: "#C7EA3A",
                marginRight: "12px",
                transform: "rotate(45deg)",
                borderRadius: "3px"
              }}
            />
            AVELA
          </div>

          <div style={{ display: "flex", marginTop: "62px", color: "#526D00", fontSize: "14px", fontWeight: 800, letterSpacing: "0.12em" }}>
            GROWTH INTELLIGENCE FOR WOMEN’S FOOTBALL
          </div>

          <div style={{ display: "flex", marginTop: "18px", fontSize: "58px", lineHeight: 0.98, fontWeight: 800, letterSpacing: "-0.045em" }}>
            Know where to act before the moment passes.
          </div>

          <div style={{ display: "flex", marginTop: "24px", color: "#64706B", fontSize: "20px", lineHeight: 1.35 }}>
            Fixture in. Opportunity out. Learn from what happened.
          </div>

          <div style={{ display: "flex", marginTop: "auto", color: "#7A827E", fontSize: "14px" }}>
            London City · live demonstration environment
          </div>
        </div>

        <div
          style={{
            width: "42%",
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            borderRadius: "24px",
            background: "#10211B",
            color: "#F7F8F5"
          }}
        >
          <div style={{ display: "flex", color: "#AEB8B3", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em" }}>
            CURRENT PRODUCT FLOW
          </div>

          {[
            ["01", "Radar", "Fixtures trigger monitoring automatically"],
            ["02", "Opportunity brief", "Evidence, fit and recommended play"],
            ["03", "Campaign", "Scope, approvals and handoff"],
            ["04", "Learning", "What changes for the next match?"]
          ].map(([num, label, detail]) => (
            <div key={num} style={{ display: "flex", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", width: "40px", color: "#C7EA3A", fontSize: "11px", fontWeight: 800 }}>{num}</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", color: "#F7F8F5", fontSize: "18px", fontWeight: 800 }}>{label}</div>
                <div style={{ display: "flex", color: "#AEB8B3", marginTop: "4px", fontSize: "11px" }}>{detail}</div>
              </div>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              padding: "15px 16px",
              borderRadius: "14px",
              color: "#263400",
              background: "#C7EA3A",
              flexDirection: "column"
            }}
          >
            <div style={{ display: "flex", fontSize: "9px", fontWeight: 800, letterSpacing: "0.08em", opacity: 0.7 }}>
              90-DAY PILOT · 6 FIXTURES
            </div>
            <div style={{ display: "flex", marginTop: "6px", fontSize: "17px", fontWeight: 800 }}>
              Fixture → Opportunity → Campaign → Learning
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
