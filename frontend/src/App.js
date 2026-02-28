import { useState, useEffect, useRef } from "react";

const BASE_URL     = "https://sigrid-sirenic-uniridescently.ngrok-free.dev";
const API_URL      = `${BASE_URL}/status`;
const REPORTS_URL  = `${BASE_URL}/reports`;
const ANALYSIS_URL = `${BASE_URL}/analysis`;
const HEADERS      = { "ngrok-skip-browser-warning": "true" };

const STATUS_CONFIG = {
  SAFE:     { color: "#00ff88", bg: "rgba(0,255,136,0.08)", border: "rgba(0,255,136,0.3)" },
  MONITOR:  { color: "#ffd600", bg: "rgba(255,214,0,0.08)",  border: "rgba(255,214,0,0.3)" },
  WARNING:  { color: "#ff8c00", bg: "rgba(255,140,0,0.08)",  border: "rgba(255,140,0,0.3)" },
  DANGER:   { color: "#ff2d2d", bg: "rgba(255,45,45,0.10)",  border: "rgba(255,45,45,0.4)" },
  CRITICAL: { color: "#ff0000", bg: "rgba(255,0,0,0.15)",    border: "rgba(255,0,0,0.6)"   },
};

const ZONE_POSITIONS = {
  Zone_A: { top:"8%",  left:"8%",  label:"ZONE A", sublabel:"North-West" },
  Zone_B: { top:"8%",  left:"54%", label:"ZONE B", sublabel:"North-East" },
  Zone_C: { top:"54%", left:"8%",  label:"ZONE C", sublabel:"South-West" },
  Zone_D: { top:"54%", left:"54%", label:"ZONE D", sublabel:"South-East" },
};

const SECTION_COLORS = {
  "PEAK CONGESTION": "#ff2d2d",
  "DANGER TIMELINE": "#ff8c00",
  "CROWD FLOW PATTERN": "#ffd600",
  "TOP 3 RECOMMENDATIONS FOR NEXT EVENT": "#00ff88",
};

function useInterval(cb, delay) {
  const ref = useRef();
  useEffect(() => { ref.current = cb; }, [cb]);
  useEffect(() => {
    if (!delay) return;
    const id = setInterval(() => ref.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function ZoneCard({ zoneName, data }) {
  const cfg     = STATUS_CONFIG[data?.status] || STATUS_CONFIG.SAFE;
  const isAlert = data?.alert;
  const count   = data?.current_count ?? 0;
  const mins    = data?.predicted_danger_in_mins;
  const pos     = ZONE_POSITIONS[zoneName];
  return (
    <div style={{
      position:"absolute", top:pos.top, left:pos.left, width:"42%", height:"38%",
      background:cfg.bg, border:`1.5px solid ${cfg.border}`, borderRadius:4,
      padding:"14px 16px", display:"flex", flexDirection:"column", justifyContent:"space-between",
      transition:"all 0.5s ease",
      boxShadow: isAlert ? `0 0 24px ${cfg.color}44` : "none",
      animation: isAlert ? "alertFlash 2s ease-in-out infinite" : "none",
    }}>
      {isAlert && <div style={{ position:"absolute", inset:0, borderRadius:4, border:`1.5px solid ${cfg.color}`, animation:"pulseRing 1.4s ease-out infinite", pointerEvents:"none" }} />}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#666", letterSpacing:3, marginBottom:2 }}>{pos.sublabel}</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:cfg.color, letterSpacing:2 }}>{pos.label}</div>
        </div>
        <div style={{ background:cfg.color, color:"#000", fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:2, letterSpacing:2 }}>
          {data?.status}
        </div>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:cfg.color, lineHeight:1, textShadow:`0 0 20px ${cfg.color}88` }}>
          {Math.max(0, Math.round(count))}
        </div>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#555", letterSpacing:2 }}>PERSONS DETECTED</div>
      </div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:mins ? cfg.color : "#444", letterSpacing:1 }}>
        {mins && mins > 0 ? `⚡ CRITICAL IN ${mins} MIN` : count <= 0 ? "— NO DATA —" : "✓ TREND STABLE"}
      </div>
    </div>
  );
}

function AlertFeed({ alerts, history }) {
  return (
    <div style={{ background:"#0a0a0a", border:"1px solid #1a1a1a", borderRadius:4, flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ padding:"12px 16px", borderBottom:"1px solid #1a1a1a", fontFamily:"'DM Mono',monospace", fontSize:10, color:"#444", letterSpacing:3, display:"flex", justifyContent:"space-between" }}>
        <span>ALERT FEED</span>
        <span style={{ color: alerts.length > 0 ? "#ff2d2d" : "#333" }}>{alerts.length > 0 ? `● ${alerts.length} ACTIVE` : "● CLEAR"}</span>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
        {history.length === 0 && <div style={{ padding:"24px 16px", fontFamily:"'DM Mono',monospace", fontSize:10, color:"#333", textAlign:"center", letterSpacing:2 }}>NO ALERTS RECORDED</div>}
        {history.map((item, i) => {
          const cfg = STATUS_CONFIG[item.urgency] || STATUS_CONFIG.SAFE;
          return (
            <div key={i} style={{ padding:"10px 16px", borderBottom:"1px solid #111", display:"flex", gap:10 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:cfg.color, marginTop:4, flexShrink:0, boxShadow:`0 0 6px ${cfg.color}` }} />
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:cfg.color, letterSpacing:1, marginBottom:2 }}>[{item.urgency}] {item.zone}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#444" }}>{item.message}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#333", marginTop:2 }}>{item.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      const res = await fetch(REPORTS_URL, { headers: HEADERS });
      if (!res.ok) throw new Error();
      setReports([...(await res.json())].reverse());
    } catch (_) {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useInterval(load, 30000);

  return (
    <div style={{ padding:28, height:"calc(100vh - 57px)", overflowY:"auto" }}>
      <div style={{ marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:4 }}>AI INCIDENT REPORTS</div>
          <div style={{ fontSize:9, color:"#444", letterSpacing:3, marginTop:4 }}>GENERATED BY GROQ · LLAMA 3.3 70B · AUTO-REFRESH 30s</div>
        </div>
        <div style={{ fontSize:9, color:"#333", letterSpacing:2, border:"1px solid #1a1a1a", padding:"8px 14px", borderRadius:4 }}>{reports.length} REPORTS LOGGED</div>
      </div>
      {loading && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#444", textAlign:"center", marginTop:60, letterSpacing:3 }}>LOADING...</div>}
      {!loading && reports.length === 0 && (
        <div style={{ background:"#0a0a0a", border:"1px solid #111", borderRadius:4, padding:40, textAlign:"center" }}>
          <div style={{ fontSize:10, color:"#333", letterSpacing:3 }}>NO INCIDENTS RECORDED YET</div>
          <div style={{ fontSize:9, color:"#222", marginTop:8, letterSpacing:2 }}>Reports appear when a zone triggers DANGER or CRITICAL</div>
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {reports.map((r, i) => {
          const color = STATUS_CONFIG[r.urgency]?.color || "#fff";
          return (
            <div key={i} style={{ background:"#0a0a0a", border:`1px solid ${color}33`, borderLeft:`3px solid ${color}`, borderRadius:4, padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ background:color, color:"#000", fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, padding:"3px 10px", borderRadius:2, letterSpacing:2 }}>{r.urgency}</div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color, letterSpacing:2 }}>{r.zone?.replace("_"," ")}</div>
                </div>
                <div style={{ fontSize:9, color:"#333" }}>{new Date(r.timestamp).toLocaleTimeString()}</div>
              </div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#666", lineHeight:1.8, whiteSpace:"pre-wrap", borderTop:"1px solid #111", paddingTop:14 }}>{r.report}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnalysisPage() {
  const [analysis, setAnalysis] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [lastRun,  setLastRun]  = useState(null);
  const load = async () => {
    try {
      const res = await fetch(ANALYSIS_URL, { headers: HEADERS });
      if (!res.ok) throw new Error();
      setAnalysis(await res.json());
      setLastRun(new Date().toLocaleTimeString());
    } catch (_) {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useInterval(load, 30000);

  const sections = analysis?.text
    ? analysis.text.split(/\n(?=[A-Z][A-Z ]{3,}:)/).map(s => {
        const [title, ...rest] = s.split("\n");
        return { title: title.replace(":","").trim(), body: rest.join("\n").trim() };
      }).filter(s => s.title)
    : [];

  return (
    <div style={{ padding:28, height:"calc(100vh - 57px)", overflowY:"auto" }}>
      <div style={{ marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:4 }}>CROWD ANALYSIS REPORT</div>
          <div style={{ fontSize:9, color:"#444", letterSpacing:3, marginTop:4 }}>GENERATED BY GROQ · RUNS AT EVENT END · AUTO-REFRESH 30s</div>
        </div>
        {lastRun && <div style={{ fontSize:9, color:"#333", letterSpacing:2, border:"1px solid #1a1a1a", padding:"8px 14px", borderRadius:4 }}>LAST UPDATED {lastRun}</div>}
      </div>
      {loading && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#444", textAlign:"center", marginTop:60, letterSpacing:3 }}>LOADING...</div>}
      {!loading && !analysis && (
        <div style={{ background:"#0a0a0a", border:"1px solid #111", borderRadius:4, padding:40, textAlign:"center" }}>
          <div style={{ fontSize:10, color:"#333", letterSpacing:3 }}>NO ANALYSIS YET</div>
          <div style={{ fontSize:9, color:"#222", marginTop:8, letterSpacing:2 }}>Generated automatically when the video loop ends</div>
        </div>
      )}
      {analysis && (
        <div style={{ marginBottom:20, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {[
            { label:"EVENT TIME",     value: analysis.timestamp ? new Date(analysis.timestamp).toLocaleTimeString() : "--" },
            { label:"SNAPSHOTS USED", value: analysis.snapshot_count ?? "--" },
            { label:"STATUS",         value:"COMPLETE", color:"#00ff88" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background:"#0a0a0a", border:"1px solid #111", borderRadius:4, padding:"12px 16px" }}>
              <div style={{ fontSize:8, color:"#333", letterSpacing:3, marginBottom:6 }}>{label}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:color||"#fff", letterSpacing:2 }}>{value}</div>
            </div>
          ))}
        </div>
      )}
      {sections.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {sections.map((sec, i) => {
            const color = SECTION_COLORS[sec.title] || "#888";
            return (
              <div key={i} style={{ background:"#0a0a0a", border:`1px solid ${color}22`, borderLeft:`3px solid ${color}`, borderRadius:4, padding:20 }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, color, letterSpacing:3, marginBottom:12 }}>{sec.title}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#666", lineHeight:1.9, whiteSpace:"pre-wrap" }}>{sec.body||"—"}</div>
              </div>
            );
          })}
        </div>
      )}
      {analysis && sections.length === 0 && (
        <div style={{ background:"#0a0a0a", border:"1px solid #1a1a1a", borderRadius:4, padding:24 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#666", lineHeight:1.9, whiteSpace:"pre-wrap" }}>{analysis.text}</div>
        </div>
      )}
    </div>
  );
}

export default function CrowdPulseDashboard() {
  const [data,         setData]         = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [lastUpdate,   setLastUpdate]   = useState(null);
  const [connected,    setConnected]    = useState(false);
  const [page,         setPage]         = useState("live");

  const fetchData = async () => {
    try {
      const res  = await fetch(API_URL, { headers: HEADERS });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json); setConnected(true); setLastUpdate(new Date());
      if (json.active_alerts?.length > 0) {
        const now = new Date().toLocaleTimeString();
        setAlertHistory(prev => [...json.active_alerts.map(a => ({ ...a, time:now })), ...prev].slice(0,50));
      }
    } catch (_) { setConnected(false); }
  };

  useEffect(() => { fetchData(); }, []);
  useInterval(fetchData, 4000);

  const totalCount    = data?.total_count ?? 0;
  const zones         = data?.zones ?? {};
  const activeAlerts  = data?.active_alerts ?? [];
  const overallStatus = activeAlerts.length > 0
    ? (activeAlerts.some(a => a.urgency === "CRITICAL") ? "CRITICAL" : "DANGER")
    : "SAFE";
  const overallCfg = STATUS_CONFIG[overallStatus];

  return (
    <div style={{ background:"#050505", height:"100vh", width:"100vw", color:"#fff", fontFamily:"'DM Mono',monospace", overflow:"hidden", position:"fixed", top:0, left:0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{overflow:hidden;height:100%;width:100%;}
        @keyframes pulseRing{0%{opacity:0.8;}100%{opacity:0;}}
        @keyframes alertFlash{0%,100%{box-shadow:0 0 24px rgba(255,45,45,0.15);}50%{box-shadow:0 0 40px rgba(255,45,45,0.35);}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:#0a0a0a;}
        ::-webkit-scrollbar-thumb{background:#222;}
      `}</style>

      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:100, background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)" }} />

      {/* Header */}
      <div style={{ padding:"14px 24px", borderBottom:"1px solid #111", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#050505" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:6, color:overallCfg.color, textShadow:`0 0 20px ${overallCfg.color}66`, transition:"all 0.5s" }}>
            CROWD<span style={{ color:"#fff" }}>PULSE</span>
          </div>
          <div style={{ width:1, height:28, background:"#1a1a1a" }} />
          <div style={{ fontSize:9, color:"#333", letterSpacing:3, lineHeight:1.6 }}>CROWD SAFETY<br/>CONTROL SYSTEM</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:connected?"#00ff88":"#ff2d2d", boxShadow:connected?"0 0 8px #00ff88":"0 0 8px #ff2d2d", animation:connected?"blink 2s infinite":"none" }} />
            <span style={{ fontSize:9, color:"#444", letterSpacing:2 }}>{connected?"LIVE":"OFFLINE"}</span>
          </div>
          <div style={{ background:overallCfg.bg, border:`1px solid ${overallCfg.border}`, color:overallCfg.color, padding:"5px 14px", fontSize:10, letterSpacing:3, borderRadius:2 }}>{overallStatus}</div>
          <div style={{ fontSize:9, color:"#333", letterSpacing:2, textAlign:"right" }}>
            {lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--:--"}<br/><span style={{ color:"#222" }}>LAST SYNC</span>
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {[{id:"live",label:"LIVE VIEW"},{id:"reports",label:"AI REPORTS"},{id:"analysis",label:"ANALYSIS"}].map(({id,label}) => (
              <button key={id} onClick={() => setPage(id)} style={{
                background: page===id?"#fff":"transparent", color:page===id?"#000":"#444",
                border:`1px solid ${page===id?"#fff":"#222"}`,
                fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:2,
                padding:"5px 14px", borderRadius:2, cursor:"pointer", transition:"all 0.2s",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {page === "reports"  && <ReportsPage />}
      {page === "analysis" && <AnalysisPage />}
      {page === "live" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", height:"calc(100vh - 57px)", maxHeight:"calc(100vh - 57px)", overflow:"hidden" }}>
          <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16, overflow:"hidden", height:"100%" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {[
                { label:"TOTAL CROWD",     value:Math.max(0,totalCount),          unit:"persons" },
                { label:"ACTIVE ALERTS",   value:activeAlerts.length,             unit:"zones",  color:activeAlerts.length>0?"#ff2d2d":"#00ff88" },
                { label:"ZONES MONITORED", value:Object.keys(zones).length,       unit:"active"  },
              ].map(({label,value,unit,color}) => (
                <div key={label} style={{ background:"#0a0a0a", border:"1px solid #111", borderRadius:4, padding:"12px 16px" }}>
                  <div style={{ fontSize:8, color:"#333", letterSpacing:3, marginBottom:6 }}>{label}</div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:color||"#fff", lineHeight:1, textShadow:color?`0 0 16px ${color}66`:"none" }}>{value}</div>
                  <div style={{ fontSize:8, color:"#333", letterSpacing:2, marginTop:2 }}>{unit}</div>
                </div>
              ))}
            </div>
            <div style={{ flex:1, background:"#080808", border:"1px solid #111", borderRadius:4, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(#111 1px,transparent 1px),linear-gradient(90deg,#111 1px,transparent 1px)", backgroundSize:"40px 40px", opacity:0.5 }} />
              <div style={{ position:"absolute", top:"50%", left:"5%", right:"5%", height:1, background:"#1a1a1a" }} />
              <div style={{ position:"absolute", left:"50%", top:"5%", bottom:"5%", width:1, background:"#1a1a1a" }} />
              <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontFamily:"'Bebas Neue',sans-serif", fontSize:11, color:"#1a1a1a", letterSpacing:4, pointerEvents:"none", userSelect:"none" }}>VENUE MAP</div>
              {Object.entries(zones).map(([name,d]) => <ZoneCard key={name} zoneName={name} data={d} />)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {Object.entries(zones).map(([name,z]) => {
                const cfg = STATUS_CONFIG[z?.status] || STATUS_CONFIG.SAFE;
                return (
                  <div key={name} style={{ background:"#0a0a0a", border:`1px solid ${cfg.border}`, borderRadius:4, padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:9, color:"#444", letterSpacing:2 }}>{name.replace("_"," ")}</span>
                    <span style={{ fontSize:9, color:cfg.color, letterSpacing:1 }}>{z?.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ borderLeft:"1px solid #0f0f0f", padding:16, display:"flex", flexDirection:"column", gap:12, overflow:"hidden", height:"100%" }}>
            <AlertFeed alerts={activeAlerts} history={alertHistory} />
            <div style={{ background:"#0a0a0a", border:"1px solid #111", borderRadius:4, padding:"12px 14px" }}>
              <div style={{ fontSize:8, color:"#333", letterSpacing:3, marginBottom:10 }}>STATUS LEGEND</div>
              {Object.entries(STATUS_CONFIG).map(([key,cfg]) => (
                <div key={key} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:cfg.color, boxShadow:`0 0 4px ${cfg.color}` }} />
                  <span style={{ fontSize:8, color:"#444", letterSpacing:2 }}>{key}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize:8, color:"#222", letterSpacing:2, textAlign:"center" }}>AUTO-REFRESH EVERY 4s</div>
          </div>
        </div>
      )}
    </div>
  );
}