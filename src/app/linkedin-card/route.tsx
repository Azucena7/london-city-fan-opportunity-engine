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
        background: "linear-gradient(135deg, #071315 0%, #0d2b2c 58%, #123a38 100%)",
        fontFamily: "Arial, Helvetica, sans-serif"
      }}>
        <div style={{ width: "47%", display: "flex", flexDirection: "column", paddingRight: "38px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: "17px", fontWeight: 800, letterSpacing: "0.1em" }}>
            <span style={{ width: "12px", height: "12px", display: "flex", borderRadius: "50%", background: "#c9ff57", marginRight: "12px" }} />
            LCL / FAN OPPORTUNITY ENGINE
          </div>

          <div style={{ display: "flex", marginTop: "70px", color: "#8ce3d3", fontSize: "14px", fontWeight: 800, letterSpacing: "0.12em" }}>
            INDEPENDENT PROTOTYPE
          </div>
          <div style={{ display: "flex", marginTop: "18px", fontSize: "57px", lineHeight: 0.98, fontWeight: 800, letterSpacing: "-0.045em" }}>
            From signals to decisions. Then reality.
          </div>
          <div style={{ display: "flex", marginTop: "24px", color: "#c5d8d5", fontSize: "21px", lineHeight: 1.35 }}>
            A decision system for sustainable fan growth.
          </div>
          <div style={{ display: "flex", marginTop: "auto", color: "#8fa9a5", fontSize: "14px" }}>
            london-city-fan-opportunity-engine.vercel.app
          </div>
        </div>

        <div style={{
          width: "53%",
          display: "flex",
          flexDirection: "column",
          padding: "22px",
          borderRadius: "20px",
          color: "#102321",
          background: "#f2f7f5",
          border: "1px solid #6a9991"
        }}>
          <div style={{ display: "flex", padding: "10px 13px", borderRadius: "9px", color: "#35625a", background: "#dcece7", fontSize: "12px", fontWeight: 800, letterSpacing: "0.08em" }}>
            DECISION VALIDATION · BRIGHTON
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: "15px", padding: "18px", borderRadius: "13px", color: "#f6fbfa", background: "#0d302f" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", color: "#c9ff57", fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em" }}>15 SEP · ENGINE HYPOTHESIS</span>
              <span style={{ display: "flex", color: "#98b9b2", fontSize: "10px", fontWeight: 700 }}>TIME-STAMPED</span>
            </div>
            <div style={{ display: "flex", marginTop: "13px", fontSize: "24px", lineHeight: 1.08, fontWeight: 800 }}>
              Extend the football day: London City → England v Spain.
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", color: "#2e7568", fontSize: "24px", fontWeight: 900, margin: "5px 0" }}>↓</div>

          <div style={{ display: "flex", flexDirection: "column", padding: "18px", borderRadius: "13px", background: "#ffffff", border: "1px solid #cadbd6" }}>
            <div style={{ display: "flex", color: "#9a6b16", fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em" }}>18 SEP · OBSERVED CLUB ACTION</div>
            <div style={{ display: "flex", marginTop: "12px", fontSize: "23px", lineHeight: 1.08, fontWeight: 800 }}>
              England v Spain post-match watchalong announced.
            </div>
          </div>

          <div style={{ display: "flex", marginTop: "15px", gap: "8px" }}>
            {[
              ["4", "ALIGNED"],
              ["1", "PARTIAL"],
              ["0", "CAUSATION CLAIMED"]
            ].map(([value, label]) => (
              <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px", borderRadius: "10px", background: "#ffffff", border: "1px solid #cadbd6" }}>
                <span style={{ display: "flex", fontSize: "27px", fontWeight: 900 }}>{value}</span>
                <span style={{ display: "flex", marginTop: "4px", color: "#58756f", fontSize: "9px", fontWeight: 800, letterSpacing: "0.07em" }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", marginTop: "auto", padding: "13px 15px", borderRadius: "11px", color: "#123c35", background: "#dff5ee", fontSize: "14px", fontWeight: 800 }}>
            Signals → decisions → observed outcomes
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
