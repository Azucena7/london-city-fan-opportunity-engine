import { ImageResponse } from "next/og";

export const alt = "London City Fan Opportunity Engine — from signals to decisions to observed outcomes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        padding: "52px",
        color: "#f7fbfa",
        background: "linear-gradient(135deg, #071315 0%, #0d2b2c 58%, #123a38 100%)",
        fontFamily: "Arial, Helvetica, sans-serif"
      }}>
        <div style={{ width: "49%", display: "flex", flexDirection: "column", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: "17px", fontWeight: 800, letterSpacing: "0.1em" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#c9ff57", marginRight: "12px" }} />
            LCL / FAN OPPORTUNITY ENGINE
          </div>
          <div style={{ marginTop: "74px", color: "#8ce3d3", fontSize: "15px", fontWeight: 800, letterSpacing: "0.12em" }}>
            INDEPENDENT PROTOTYPE
          </div>
          <div style={{ marginTop: "18px", fontSize: "59px", lineHeight: 0.98, fontWeight: 800, letterSpacing: "-0.045em" }}>
            From signals to decisions. Then reality.
          </div>
          <div style={{ marginTop: "24px", color: "#c5d8d5", fontSize: "21px", lineHeight: 1.35 }}>
            A decision system for sustainable fan growth.
          </div>
          <div style={{ marginTop: "auto", color: "#91aaa6", fontSize: "15px" }}>
            london-city-fan-opportunity-engine.vercel.app
          </div>
        </div>

        <div style={{ width: "51%", display: "flex", flexDirection: "column", marginLeft: "34px", padding: "24px", borderRadius: "20px", color: "#102321", background: "#f3f7f5", border: "1px solid rgba(179,245,231,.38)" }}>
          <div style={{ color: "#35625a", fontSize: "12px", fontWeight: 800, letterSpacing: "0.1em" }}>REALITY CHECK · BRIGHTON</div>

          <div style={{ display: "flex", marginTop: "18px", gap: "12px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "17px", borderRadius: "13px", color: "#f6fbfa", background: "#0d302f" }}>
              <span style={{ color: "#c9ff57", fontSize: "10px", fontWeight: 800 }}>15 SEP</span>
              <strong style={{ marginTop: "12px", fontSize: "19px", lineHeight: 1.15 }}>ENGINE HYPOTHESIS</strong>
              <span style={{ marginTop: "13px", color: "#c7ded9", fontSize: "14px", lineHeight: 1.25 }}>Extend Brighton around England v Spain.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", color: "#2e7568", fontSize: "24px", fontWeight: 900 }}>→</div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "17px", borderRadius: "13px", background: "#ffffff", border: "1px solid #cadbd6" }}>
              <span style={{ color: "#9a6b16", fontSize: "10px", fontWeight: 800 }}>18 SEP</span>
              <strong style={{ marginTop: "12px", fontSize: "19px", lineHeight: 1.15 }}>OBSERVED ACTION</strong>
              <span style={{ marginTop: "13px", color: "#54706b", fontSize: "14px", lineHeight: 1.25 }}>Post-match England v Spain watchalong.</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "9px", marginTop: "18px" }}>
            <div style={{ flex: 1, padding: "14px", borderRadius: "11px", background: "#e7f4ef" }}>
              <strong style={{ fontSize: "30px" }}>4</strong><span style={{ display: "block", color: "#467168", fontSize: "10px", fontWeight: 800 }}>ALIGNED</span>
            </div>
            <div style={{ flex: 1, padding: "14px", borderRadius: "11px", background: "#fff6df" }}>
              <strong style={{ fontSize: "30px" }}>1</strong><span style={{ display: "block", color: "#8a6a24", fontSize: "10px", fontWeight: 800 }}>PARTIAL</span>
            </div>
            <div style={{ flex: 1.35, padding: "14px", borderRadius: "11px", background: "#eef2f0" }}>
              <strong style={{ fontSize: "30px" }}>0</strong><span style={{ display: "block", color: "#657a76", fontSize: "10px", fontWeight: 800 }}>CAUSATION CLAIMED</span>
            </div>
          </div>

          <div style={{ marginTop: "auto", padding: "14px", borderRadius: "11px", color: "#123c35", background: "#dff5ee", fontSize: "15px", fontWeight: 800 }}>
            Signals → decisions → observed outcomes
          </div>
        </div>
      </div>
    ),
    size
  );
}
