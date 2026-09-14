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
        color: "#f7fbfa",
        background: "linear-gradient(135deg, #071315 0%, #103534 100%)",
        fontFamily: "Arial, Helvetica, sans-serif"
      }}>
        <div style={{ width: "48%", display: "flex", flexDirection: "column", paddingRight: "34px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: "17px", fontWeight: 800, letterSpacing: "0.1em" }}>
            <span style={{ width: "12px", height: "12px", display: "flex", borderRadius: "50%", background: "#c9ff57", marginRight: "12px" }} />
            LCL / FAN OPPORTUNITY LAB
          </div>
          <div style={{ display: "flex", marginTop: "74px", color: "#8ce3d3", fontSize: "15px", fontWeight: 800, letterSpacing: "0.12em" }}>
            A LIVING FAN INTELLIGENCE TOOL
          </div>
          <div style={{ display: "flex", marginTop: "18px", fontSize: "59px", lineHeight: 0.98, fontWeight: 800, letterSpacing: "-0.04em" }}>
            From signals to decisions.
          </div>
          <div style={{ display: "flex", marginTop: "24px", color: "#c5d8d5", fontSize: "21px", lineHeight: 1.35 }}>
            Turning fixtures, attendance and market context into clear marketing action.
          </div>
          <div style={{ display: "flex", marginTop: "auto", color: "#8fa9a5", fontSize: "14px" }}>
            london-city-fan-opportunity-engine.vercel.app/today
          </div>
        </div>

        <div style={{
          width: "52%",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          borderRadius: "20px",
          color: "#102321",
          background: "#f2f7f5",
          border: "1px solid #6a9991"
        }}>
          <div style={{ display: "flex", padding: "10px 13px", borderRadius: "9px", color: "#35625a", background: "#dcece7", fontSize: "12px", fontWeight: 700 }}>
            ● UPDATED · 4 MATERIAL CHANGES · SOURCED SIGNALS
          </div>
          <div style={{ display: "flex", marginTop: "15px" }}>
            <div style={{ width: "56%", minHeight: "190px", display: "flex", flexDirection: "column", padding: "18px", borderRadius: "13px", color: "#f6fbfa", background: "#0d302f" }}>
              <div style={{ display: "flex", color: "#90d8ca", fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em" }}>CURRENT DECISION</div>
              <div style={{ display: "flex", marginTop: "13px", fontSize: "27px", lineHeight: 1.05, fontWeight: 800 }}>Grow acquisition with a repeat-visit focus</div>
              <div style={{ display: "flex", alignItems: "flex-end", marginTop: "auto" }}>
                <span style={{ display: "flex", color: "#c9ff57", fontSize: "44px", lineHeight: 1, fontWeight: 800 }}>90</span>
                <span style={{ display: "flex", color: "#afc9c5", fontSize: "10px", marginLeft: "9px", marginBottom: "5px" }}>PRIORITY</span>
              </div>
            </div>
            <div style={{ width: "41%", minHeight: "190px", display: "flex", flexDirection: "column", marginLeft: "3%", padding: "18px", borderRadius: "13px", background: "#ffffff", border: "1px solid #cadbd6" }}>
              <div style={{ display: "flex", color: "#548178", fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em" }}>NEXT HOME</div>
              <div style={{ display: "flex", marginTop: "16px", fontSize: "25px", lineHeight: 1.05, fontWeight: 800 }}>London City v Brighton</div>
              <div style={{ display: "flex", marginTop: "14px", color: "#54706b", fontSize: "13px" }}>26 SEP · COPPERJAX</div>
              <div style={{ display: "flex", marginTop: "auto", padding: "8px 10px", borderRadius: "7px", color: "#24594f", background: "#edf5f2", fontSize: "11px", fontWeight: 700 }}>TEST REPEAT DEMAND</div>
            </div>
          </div>
          <div style={{ display: "flex", marginTop: "15px" }}>
            <div style={{ width: "48.5%", display: "flex", flexDirection: "column", padding: "15px", borderRadius: "12px", background: "#ffffff", border: "1px solid #cadbd6" }}>
              <div style={{ display: "flex", color: "#58756f", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em" }}>MEASURED ATTENDANCE</div>
              <div style={{ display: "flex", alignItems: "baseline", marginTop: "8px" }}>
                <span style={{ display: "flex", fontSize: "31px", fontWeight: 800 }}>5,402</span>
                <span style={{ display: "flex", marginLeft: "9px", color: "#16866d", fontSize: "11px", fontWeight: 800 }}>SELL-OUT</span>
              </div>
            </div>
            <div style={{ width: "48.5%", display: "flex", flexDirection: "column", marginLeft: "3%", padding: "15px", borderRadius: "12px", background: "#ffffff", border: "1px solid #cadbd6" }}>
              <div style={{ display: "flex", color: "#58756f", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em" }}>NEXT QUESTION</div>
              <div style={{ display: "flex", marginTop: "9px", fontSize: "15px", lineHeight: 1.2, fontWeight: 800 }}>How much opener demand returns?</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: "15px", padding: "15px", borderRadius: "12px", color: "#123c35", background: "#dff5ee", borderLeft: "5px solid #25a889" }}>
            <div style={{ display: "flex", color: "#297062", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em" }}>MARKETING ACTION</div>
            <div style={{ display: "flex", marginTop: "6px", fontSize: "14px", lineHeight: 1.25, fontWeight: 700 }}>
              Build the opener-to-Brighton repeat cohort and measure conversion by territory.
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
