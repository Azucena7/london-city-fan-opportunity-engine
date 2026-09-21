import { ImageResponse } from "next/og";

export const alt = "London City Fan Opportunity Engine — from signals to decisions to observed outcomes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const pill = {
  display: "flex",
  padding: "9px 14px",
  borderRadius: "999px",
  border: "1px solid rgba(129, 232, 211, 0.32)",
  color: "#9cebdc",
  fontSize: "14px",
  fontWeight: 700,
  letterSpacing: "0.08em"
} as const;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          padding: "48px 54px",
          color: "#f7fbfa",
          background: "linear-gradient(135deg, #071315 0%, #0c2527 58%, #123a38 100%)",
          fontFamily: "Arial, Helvetica, sans-serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "520px",
            height: "520px",
            borderRadius: "999px",
            right: "-170px",
            top: "-230px",
            background: "radial-gradient(circle, rgba(64,220,190,0.33), rgba(64,220,190,0))"
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "360px",
            height: "360px",
            borderRadius: "999px",
            left: "-170px",
            bottom: "-220px",
            background: "radial-gradient(circle, rgba(203,255,85,0.20), rgba(203,255,85,0))"
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", width: "47%", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "66px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#c9ff57", marginRight: "12px" }} />
            <div style={{ fontSize: "17px", fontWeight: 800, letterSpacing: "0.11em" }}>
              LCL / FAN OPPORTUNITY ENGINE
            </div>
          </div>

          <div style={{ color: "#8ce3d3", fontSize: "16px", fontWeight: 800, letterSpacing: "0.13em", marginBottom: "18px" }}>
            INDEPENDENT PROTOTYPE
          </div>
          <div style={{ fontSize: "59px", lineHeight: 0.98, fontWeight: 800, letterSpacing: "-0.045em", maxWidth: "500px" }}>
            From signals to decisions. Then reality.
          </div>
          <div style={{ fontSize: "21px", lineHeight: 1.38, color: "#c5d8d5", marginTop: "24px", maxWidth: "475px" }}>
            A decision system for sustainable fan growth.
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "34px" }}>
            <div style={pill}>HYPOTHESIS</div>
            <div style={pill}>REALITY</div>
            <div style={pill}>LEARNING</div>
          </div>

          <div style={{ display: "flex", marginTop: "auto", color: "#91aaa6", fontSize: "15px" }}>
            london-city-fan-opportunity-engine.vercel.app
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "53%",
            height: "526px",
            marginLeft: "28px",
            marginTop: "5px",
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid rgba(179, 245, 231, 0.26)",
            background: "#f3f7f5",
            boxShadow: "0 28px 80px rgba(0,0,0,0.38)"
          }}
        >
          <div style={{ height: "42px", display: "flex", alignItems: "center", padding: "0 17px", background: "#dfe8e5", borderBottom: "1px solid #cad7d3" }}>
            <div style={{ display: "flex", gap: "7px" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ff6d68" }} />
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ffc657" }} />
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#51c878" }} />
            </div>
            <div style={{ display: "flex", marginLeft: "20px", color: "#657a76", fontSize: "12px" }}>TODAY · CALENDAR · TERRITORIES</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", padding: "20px", color: "#102321" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 13px", borderRadius: "9px", background: "#e4f1ed", color: "#35625a", fontSize: "12px", fontWeight: 700 }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#24a886", marginRight: "8px" }} />
              DECISION VALIDATION · BRIGHTON
            </div>

            <div style={{ display: "flex", gap: "13px", marginTop: "14px" }}>
              <div style={{ width: "56%", minHeight: "178px", display: "flex", flexDirection: "column", padding: "18px", borderRadius: "13px", background: "#0d302f", color: "#f6fbfa" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.12em", color: "#90d8ca", fontWeight: 800 }}>15 SEP · ENGINE HYPOTHESIS</div>
                <div style={{ fontSize: "27px", lineHeight: 1.05, fontWeight: 800, marginTop: "13px" }}>Extend Brighton around England v Spain</div>
                <div style={{ display: "flex", alignItems: "flex-end", marginTop: "auto" }}>
                  <span style={{ fontSize: "43px", fontWeight: 800, color: "#c9ff57", lineHeight: 1 }}>4</span>
                  <span style={{ fontSize: "11px", color: "#afc9c5", marginLeft: "9px", marginBottom: "5px" }}>ALIGNED DIMENSIONS</span>
                </div>
              </div>

              <div style={{ width: "44%", minHeight: "178px", display: "flex", flexDirection: "column", padding: "18px", borderRadius: "13px", border: "1px solid #cadbd6", background: "#ffffff" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.12em", color: "#548178", fontWeight: 800 }}>18 SEP · OBSERVED ACTION</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", fontSize: "23px", lineHeight: 1.05, fontWeight: 800, marginTop: "14px" }}>England v Spain watchalong</div>
                <div style={{ fontSize: "13px", color: "#54706b", marginTop: "13px" }}>POST-MATCH · BRIGHTON</div>
                <div style={{ display: "flex", marginTop: "auto", padding: "8px 10px", borderRadius: "7px", background: "#edf5f2", color: "#24594f", fontSize: "11px", fontWeight: 700 }}>
                  PUBLIC CLUB ACTION
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "13px", marginTop: "14px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "15px", borderRadius: "12px", background: "#ffffff", border: "1px solid #cadbd6" }}>
                <div style={{ color: "#58756f", fontSize: "10px", fontWeight: 800, letterSpacing: "0.11em" }}>ALIGNMENT CHECK</div>
                <div style={{ display: "flex", alignItems: "baseline", marginTop: "7px" }}>
                  <span style={{ fontSize: "30px", fontWeight: 800 }}>1</span>
                  <span style={{ marginLeft: "9px", color: "#16866d", fontSize: "11px", fontWeight: 800 }}>PARTIAL</span>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "15px", borderRadius: "12px", background: "#ffffff", border: "1px solid #cadbd6" }}>
                <div style={{ color: "#58756f", fontSize: "10px", fontWeight: 800, letterSpacing: "0.11em" }}>INTERPRETATION</div>
                <div style={{ fontSize: "15px", lineHeight: 1.2, fontWeight: 800, marginTop: "9px" }}>0 causation claimed</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginTop: "14px", padding: "14px 16px", borderRadius: "12px", background: "#dff5ee", borderLeft: "5px solid #25a889" }}>
              <div style={{ color: "#297062", fontSize: "10px", fontWeight: 800, letterSpacing: "0.11em" }}>LEARNING</div>
              <div style={{ color: "#123c35", fontSize: "14px", lineHeight: 1.25, fontWeight: 700, marginTop: "6px" }}>
                Signals → decisions → observed outcomes
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
