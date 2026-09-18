"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Blocks,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Cloud,
  Code2,
  Command,
  FileCheck2,
  Fingerprint,
  Globe2,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  Menu,
  Network,
  PanelLeftClose,
  Plus,
  Search,
  Server,
  Settings2,
  Shield,
  ShieldCheck,
  Siren,
  Sparkles,
  TerminalSquare,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type View = "overview" | "assets" | "scans" | "findings" | "incidents" | "ledger" | "lab";

const telemetry = [
  { day: "Mon", protected: 61, findings: 28 },
  { day: "Tue", protected: 64, findings: 25 },
  { day: "Wed", protected: 67, findings: 31 },
  { day: "Thu", protected: 70, findings: 20 },
  { day: "Fri", protected: 73, findings: 17 },
  { day: "Sat", protected: 76, findings: 14 },
  { day: "Sun", protected: 79, findings: 11 },
];

const assets = [
  { name: "api.northstar.dev", type: "Web application", icon: Globe2, status: "Live", tone: "live", risk: "Low", last: "3m ago" },
  { name: "payments-service", type: "Kubernetes service", icon: Server, status: "Scanning", tone: "live", risk: "High", last: "Live" },
  { name: "Northstar Cloud", type: "AWS account", icon: Cloud, status: "Monitored", tone: "done", risk: "Low", last: "18m ago" },
  { name: "admin.northstar.dev", type: "Web application", icon: LockKeyhole, status: "Idle", tone: "idle", risk: "Medium", last: "2h ago" },
];

const findings = [
  { title: "Exposed admin route", asset: "admin.northstar.dev", category: "Access control", severity: "critical", score: "9.8", status: "Open", time: "12 min ago" },
  { title: "Missing CSP directive", asset: "api.northstar.dev", category: "Security headers", severity: "high", score: "7.4", status: "Triaged", time: "28 min ago" },
  { title: "TLS 1.1 still accepted", asset: "payments-service", category: "Cryptography", severity: "high", score: "7.1", status: "Open", time: "41 min ago" },
  { title: "Verbose error response", asset: "api.northstar.dev", category: "Information disclosure", severity: "medium", score: "5.3", status: "In review", time: "1h ago" },
  { title: "Cookie missing SameSite", asset: "admin.northstar.dev", category: "Session management", severity: "medium", score: "4.8", status: "Resolved", time: "3h ago" },
];

const activity = [
  { icon: AlertTriangle, tone: "red", text: <><b>Critical finding</b> detected on admin.northstar.dev</>, meta: "12 minutes ago · XDR engine" },
  { icon: CheckCircle2, tone: "green", text: <><b>Domain verified</b> — api.northstar.dev</>, meta: "26 minutes ago · DNS TXT proof" },
  { icon: Bot, tone: "", text: <><b>AI triage complete</b> — 14 findings clustered</>, meta: "31 minutes ago · Sentinel AI" },
  { icon: Blocks, tone: "", text: <><b>Report anchored</b> to Polygon Amoy</>, meta: "42 minutes ago · Block #18,492,771" },
];

const ledger = [
  { title: "Weekly perimeter scan", hash: "0x8a2f...d91c7e", block: "#18,492,771", time: "42 min ago", verifier: "0x71c...9A2" },
  { title: "Incident INC-041 remediation", hash: "0x63b1...0f928a", block: "#18,482,029", time: "Yesterday", verifier: "0x71c...9A2" },
  { title: "Domain ownership proof", hash: "0x1d74...c0b44f", block: "#18,471,320", time: "Sep 08, 2026", verifier: "0x71c...9A2" },
];

function Header({ view, setView }: { view: View; setView: (view: View) => void }) {
  const titles: Record<View, [string, string]> = {
    overview: ["Security overview", "Continuous protection across your digital estate"],
    assets: ["Asset inventory", "Verified attack surface and live exposure posture"],
    scans: ["Scan operations", "Safe, isolated security validation workers"],
    findings: ["Findings hub", "AI-triaged vulnerabilities mapped to OWASP ASVS"],
    incidents: ["Incident command", "Containment workflows and immutable response history"],
    ledger: ["Audit ledger", "Cryptographically verifiable proof of security activity"],
    lab: ["Security lab", "Practice remediations in an isolated sandbox"],
  };
  return (
    <header className="topbar">
      <div>
        <h1 className="page-title">{titles[view][0]}</h1>
        <div className="page-subtitle">{titles[view][1]} <span className="mono" style={{ color: "#4de3aa" }}>· LIVE</span></div>
      </div>
      <div className="top-actions">
        <button className="icon-button" aria-label="Command menu"><Command size={15} /></button>
        <button className="icon-button" aria-label="Notifications"><Siren size={15} /></button>
        <div className="profile">
          <div className="avatar">RS</div>
          <div><div className="profile-name">Ram Singh</div><div className="profile-role">Security admin <ChevronDown size={10} style={{ verticalAlign: "middle" }} /></div></div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ view, setView }: { view: View; setView: (view: View) => void }) {
  const mainNav: [View, string, typeof LayoutDashboard][] = [
    ["overview", "Overview", LayoutDashboard], ["assets", "Asset inventory", Network], ["scans", "Scan operations", Activity], ["findings", "Findings", AlertTriangle], ["incidents", "Incidents", Siren],
  ];
  return (
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Shield size={17} strokeWidth={2.5} /></div><div><div className="brand-name">CyberShield <span style={{ color: "var(--cyan)" }}>XDR</span></div><div className="brand-sub">Autonomous defense</div></div></div>
      <div className="workspace"><div className="eyebrow">Active workspace</div><div className="workspace-row"><span><span className="workspace-dot" />Northstar Labs</span><ChevronDown size={13} color="#7786a3" /></div></div>
      <nav className="nav"><div className="nav-label eyebrow">Command center</div>{mainNav.map(([key, label, Icon]) => <button key={key} onClick={() => setView(key)} className={`nav-item ${view === key ? "active" : ""}`}><Icon /><span>{label}</span>{key === "incidents" && <span style={{ marginLeft: "auto", color: "var(--red)", fontSize: 9 }}>3</span>}</button>)}</nav>
      <nav className="nav"><div className="nav-label eyebrow">Evidence & response</div><button onClick={() => setView("ledger")} className={`nav-item ${view === "ledger" ? "active" : ""}`}><Blocks /><span>Audit ledger</span></button><button onClick={() => setView("lab")} className={`nav-item ${view === "lab" ? "active" : ""}`}><Code2 /><span>Security lab</span><span style={{ marginLeft: "auto", fontSize: 8, color: "var(--green)" }}>NEW</span></button><button className="nav-item"><Settings2 /><span>Settings</span></button></nav>
      <div className="sidebar-footer"><div className="agent-card"><div className="agent-line"><span className="pulse" /> Sentinel AI is online</div><div className="agent-desc">Protecting 24 assets · last model sync 2m ago</div></div><div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 17, padding: "0 10px", color: "#667590", fontSize: 10 }}><PanelLeftClose size={14} /> <span>Collapse sidebar</span></div></div>
    </aside>
  );
}

function SecurityScore() {
  const circumference = 2 * Math.PI * 55;
  return <div className="health-card card"><div className="card-head"><div><h2 className="card-title">Security posture</h2><div className="card-kicker">Composite score · last 30 days</div></div><button className="view-all">View details <ArrowUpRight size={12} style={{ verticalAlign: "middle" }} /></button></div><div className="health-content"><div className="dial"><svg width="148" height="148" viewBox="0 0 148 148"><circle cx="74" cy="74" r="55" fill="none" stroke="#1a2639" strokeWidth="10" /><circle cx="74" cy="74" r="55" fill="none" stroke="url(#score)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * .18} /><defs><linearGradient id="score"><stop stopColor="#4de3aa" /><stop offset="1" stopColor="#63e6f7" /></linearGradient></defs></svg><div className="dial-copy"><div className="dial-value">82</div><div className="dial-label">GOOD</div></div></div><div className="health-list"><div><div className="health-row"><span>Identity & access</span><span className="health-number green">94%</span></div><div className="progress green"><span style={{ width: "94%" }} /></div></div><div><div className="health-row"><span>Application security</span><span className="health-number amber">78%</span></div><div className="progress amber"><span style={{ width: "78%" }} /></div></div><div><div className="health-row"><span>Cloud posture</span><span className="health-number green">88%</span></div><div className="progress green"><span style={{ width: "88%" }} /></div></div><div><div className="health-row"><span>Data protection</span><span className="health-number red">63%</span></div><div className="progress red"><span style={{ width: "63%" }} /></div></div></div></div></div>;
}

function Overview({ setView }: { setView: (view: View) => void }) {
  return <>
    <div className="grid stats">
      <div className="card stat-card"><div className="stat-top"><span className="eyebrow">Protected assets</span><div className="stat-icon"><ShieldCheck size={15} /></div></div><div className="stat-value">24<span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}> / 28</span></div><div className="stat-label"><span className="delta">+3.2%</span> from last week</div></div>
      <div className="card stat-card"><div className="stat-top"><span className="eyebrow">Open findings</span><div className="stat-icon" style={{ color: "var(--amber)", background: "rgba(251,191,99,.1)" }}><AlertTriangle size={15} /></div></div><div className="stat-value">17</div><div className="stat-label"><span className="delta warn">4 high risk</span> need attention</div></div>
      <div className="card stat-card"><div className="stat-top"><span className="eyebrow">Active incidents</span><div className="stat-icon" style={{ color: "var(--red)", background: "rgba(255,107,127,.1)" }}><Siren size={15} /></div></div><div className="stat-value">03</div><div className="stat-label"><span className="delta" style={{ color: "var(--red)", background: "rgba(255,107,127,.1)" }}>1 critical</span> open now</div></div>
      <div className="card stat-card"><div className="stat-top"><span className="eyebrow">Evidence anchored</span><div className="stat-icon" style={{ color: "var(--green)", background: "rgba(77,227,170,.1)" }}><Blocks size={15} /></div></div><div className="stat-value">100<span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>%</span></div><div className="stat-label"><span className="delta">Polygon Amoy</span> tamper-evident</div></div>
    </div>
    <div className="grid section-grid"><div className="card"><div className="card-head"><div><h2 className="card-title">Exposure telemetry</h2><div className="card-kicker">Protected coverage vs. unresolved findings</div></div><button className="ghost" style={{ padding: "7px 9px", fontSize: 9 }}>Last 7 days <ChevronDown size={11} /></button></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={telemetry} margin={{ top: 10, right: 14, left: -22, bottom: 0 }}><defs><linearGradient id="coverage" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#63e6f7" stopOpacity={.28} /><stop offset="100%" stopColor="#63e6f7" stopOpacity={0} /></linearGradient><linearGradient id="findings" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff6b7f" stopOpacity={.18} /><stop offset="100%" stopColor="#ff6b7f" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#0d1422", border: "1px solid #2a3c57", borderRadius: 8, fontSize: 10 }} /><Area type="monotone" dataKey="protected" stroke="#63e6f7" strokeWidth={2} fill="url(#coverage)" /><Area type="monotone" dataKey="findings" stroke="#ff6b7f" strokeWidth={2} fill="url(#findings)" /></AreaChart></ResponsiveContainer></div><div style={{ display: "flex", gap: 17, padding: "0 18px 15px", fontSize: 9, color: "var(--muted)" }}><span><i style={{ display: "inline-block", width: 7, height: 7, background: "var(--cyan)", borderRadius: 2, marginRight: 6 }} />Protected coverage</span><span><i style={{ display: "inline-block", width: 7, height: 7, background: "var(--red)", borderRadius: 2, marginRight: 6 }} />Unresolved findings</span></div></div><SecurityScore /></div>
    <div className="grid bottom-grid"><div className="card"><div className="card-head"><div><h2 className="card-title">Asset pulse</h2><div className="card-kicker">Live attack surface inventory</div></div><button onClick={() => setView("assets")} className="view-all">All assets <ArrowUpRight size={12} style={{ verticalAlign: "middle" }} /></button></div><div className="card-body table-wrap"><table className="table"><thead><tr><th>Asset</th><th>Status</th><th>Risk</th><th>Last scan</th></tr></thead><tbody>{assets.map((asset) => <tr key={asset.name}><td><div className="asset"><div className="asset-mark"><asset.icon size={13} /></div><div><div className="asset-name">{asset.name}</div><div className="asset-type">{asset.type}</div></div></div></td><td><span className={`status ${asset.tone}`}>● {asset.status}</span></td><td><span className={`severity ${asset.risk === "High" ? "high" : asset.risk === "Medium" ? "high" : "info"}`}>{asset.risk}</span></td><td className="mono" style={{ color: "#7586a4" }}>{asset.last}</td></tr>)}</tbody></table></div></div><div className="card"><div className="card-head"><div><h2 className="card-title">Recent activity</h2><div className="card-kicker">A tamper-evident operational feed</div></div><button onClick={() => setView("ledger")} className="view-all">Audit log <ArrowUpRight size={12} style={{ verticalAlign: "middle" }} /></button></div><div className="card-body activity-list">{activity.map((item, index) => <div className="activity-row" key={index}><div className={`activity-icon ${item.tone}`}><item.icon size={13} /></div><div className="activity-main"><div className="activity-text">{item.text}</div><div className="activity-meta">{item.meta}</div></div>{index === 0 && <span className="severity critical">Critical</span>}</div>)}</div></div></div>
  </>;
}

function Scans({ setView }: { setView: (view: View) => void }) {
  return <><div className="toolbar"><div className="search"><Search size={15} /><input placeholder="Search scan jobs, targets, or IDs" /></div><select className="select" defaultValue="all"><option value="all">All statuses</option><option>Running</option><option>Completed</option></select><button className="primary" onClick={() => setView("assets")}><Plus size={14} /> New scan</button></div><div className="grid scan-grid"><div className="grid" style={{ gap: 12 }}>{[{ domain: "payments-service", mode: "Deep API + container", progress: 68, step: "Runtime behavior analysis", color: "var(--cyan)" }, { domain: "admin.northstar.dev", mode: "Full web application", progress: 100, step: "Report anchored", color: "var(--green)" }, { domain: "api.northstar.dev", mode: "Quick perimeter", progress: 100, step: "Completed 26 minutes ago", color: "var(--green)" }].map((scan, i) => <div className="card scan-card" key={scan.domain}><div className="scan-head"><div><div className="scan-domain">{scan.domain}</div><div className="scan-meta">{scan.mode} · initiated by Ram Singh · {i === 0 ? "9 min ago" : "Today"}</div></div><span className={`severity ${i === 0 ? "info" : "info"}`}>{i === 0 ? "Running" : "Verified"}</span></div><div className="scan-progress"><div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--muted)", marginBottom: 7 }}><span>Worker progress</span><span className="mono" style={{ color: scan.color }}>{scan.progress}%</span></div><div className="progress"><span style={{ width: `${scan.progress}%`, background: scan.color }} /></div></div><div style={{ display: "flex", gap: 19 }}>{["Queued", "Fingerprinting", "Analyzing", "Report"].map((step, stepIndex) => <div className={`scan-step ${stepIndex < (i === 0 ? 2 : 4) ? "active" : ""}`} key={step}><span className={`step-dot ${stepIndex < (i === 0 ? 2 : 4) ? stepIndex === 1 && i === 0 ? "active" : "done" : ""}`} />{step}</div>)}</div>{i === 0 && <div style={{ marginTop: 16, borderTop: "1px solid rgba(119,134,163,.1)", paddingTop: 12, color: "var(--muted)", fontSize: 9 }}><TerminalSquare size={12} style={{ verticalAlign: "middle", marginRight: 5, color: "var(--cyan)" }} /> Live stream available <button onClick={() => setView("lab")} className="view-all" style={{ marginLeft: 7 }}>Open terminal →</button></div>}</div>)}</div><div className="card full-card"><div className="eyebrow">Worker safeguards</div><h2 style={{ fontSize: 17, margin: "10px 0 8px", letterSpacing: "-.04em" }}>Your scans run isolated.</h2><p style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 20px" }}>Every worker is constrained by SSRF protection, DNS rebinding checks, private-IP deny lists, and an explicit authorization token.</p><div className="ledger"><div className="ledger-entry"><div className="ledger-top"><span style={{ fontSize: 10, color: "var(--green)" }}>● Guardrails active</span><ShieldCheck size={14} color="var(--green)" /></div><div className="ledger-meta"><span>OWASP ASVS 4.0.3</span><span>·</span><span>Zero trust</span></div></div><div className="ledger-entry"><div className="ledger-top"><span style={{ fontSize: 10 }}>Queue capacity</span><span className="mono" style={{ color: "var(--cyan)" }}>08 / 32</span></div><div className="progress" style={{ marginTop: 10 }}><span style={{ width: "25%" }} /></div></div></div></div></div></>;
}

type LiveScanJob = {
  id: string;
  target: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  currentStep: string;
  reportHash?: string;
};

function LiveScans({ setView }: { setView: (view: View) => void }) {
  const [scan, setScan] = useState<LiveScanJob | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!scan?.id) return;
    const events = new EventSource(`/api/scans/${scan.id}/progress`);
    events.onmessage = (event) => {
      try {
        setScan(JSON.parse(event.data) as LiveScanJob);
      } catch {
        setError("The progress stream returned an invalid event.");
        events.close();
      }
    };
    events.onerror = () => events.close();
    return () => events.close();
  }, [scan?.id]);

  const startScan = async () => {
    setStarting(true);
    setError("");
    try {
      const response = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "00000000-0000-4000-8000-000000000001",
          assetId: "00000000-0000-4000-8000-000000000002",
          target: "https://example.com",
          scanMode: "quick-perimeter",
          authorizationToken: "demo-authorized-scan-token-2026",
          localLabMode: false,
        }),
      });
      const payload: { data?: LiveScanJob; error?: { message?: string } } = await response.json();
      if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "Unable to start the scan.");
      setScan(payload.data);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Unable to start the scan.");
    } finally {
      setStarting(false);
    }
  };

  return <>
    <div className="toolbar"><div className="search"><Search size={15} /><input placeholder="Search scan jobs, targets, or IDs" /></div><select className="select" defaultValue="all"><option value="all">All statuses</option><option>Running</option><option>Completed</option></select><button className="primary" onClick={startScan} disabled={starting || scan?.status === "running"}><Plus size={14} /> {starting ? "Starting…" : "Launch guarded scan"}</button></div>
    {error && <div className="card" style={{ marginBottom: 14, color: "var(--red)", fontSize: 10 }}>● {error}</div>}
    {scan && <div className="card scan-card" style={{ marginBottom: 14 }}><div className="scan-head"><div><div className="scan-domain">{scan.target}</div><div className="scan-meta">Quick perimeter · browser-triggered demo job · {scan.id.slice(0, 8)}…</div></div><span className={`severity ${scan.status === "completed" ? "info" : "high"}`}>{scan.status}</span></div><div className="scan-progress"><div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--muted)", marginBottom: 7 }}><span>{scan.currentStep}</span><span className="mono" style={{ color: scan.status === "completed" ? "var(--green)" : "var(--cyan)" }}>{scan.progress}%</span></div><div className="progress"><span style={{ width: `${scan.progress}%`, background: scan.status === "completed" ? "var(--green)" : "var(--cyan)" }} /></div></div><div style={{ display: "flex", gap: 19 }}>{["Queued", "Fingerprinting", "Analyzing", "Report"].map((step, index) => <div className={`scan-step ${scan.progress >= [0, 18, 48, 100][index] ? "active" : ""}`} key={step}><span className={`step-dot ${scan.progress >= [0, 18, 48, 100][index] ? "done" : ""}`} />{step}</div>)}</div>{scan.reportHash && <div className="ledger-hash mono" style={{ marginTop: 14 }}>Report hash {scan.reportHash}</div>}</div>}
    <div className="grid scan-grid"><div className="grid" style={{ gap: 12 }}>{[{ domain: "payments-service", mode: "Deep API + container", progress: 68, step: "Runtime behavior analysis", color: "var(--cyan)" }, { domain: "admin.northstar.dev", mode: "Full web application", progress: 100, step: "Report anchored", color: "var(--green)" }, { domain: "api.northstar.dev", mode: "Quick perimeter", progress: 100, step: "Completed 26 minutes ago", color: "var(--green)" }].map((item, i) => <div className="card scan-card" key={item.domain}><div className="scan-head"><div><div className="scan-domain">{item.domain}</div><div className="scan-meta">{item.mode} · initiated by Ram Singh · {i === 0 ? "9 min ago" : "Today"}</div></div><span className="severity info">{i === 0 ? "Running" : "Verified"}</span></div><div className="scan-progress"><div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--muted)", marginBottom: 7 }}><span>Worker progress</span><span className="mono" style={{ color: item.color }}>{item.progress}%</span></div><div className="progress"><span style={{ width: `${item.progress}%`, background: item.color }} /></div></div><div style={{ display: "flex", gap: 19 }}>{["Queued", "Fingerprinting", "Analyzing", "Report"].map((step, stepIndex) => <div className={`scan-step ${stepIndex < (i === 0 ? 2 : 4) ? "active" : ""}`} key={step}><span className={`step-dot ${stepIndex < (i === 0 ? 2 : 4) ? stepIndex === 1 && i === 0 ? "active" : "done" : ""}`} />{step}</div>)}</div>{i === 0 && <div style={{ marginTop: 16, borderTop: "1px solid rgba(119,134,163,.1)", paddingTop: 12, color: "var(--muted)", fontSize: 9 }}><TerminalSquare size={12} style={{ verticalAlign: "middle", marginRight: 5, color: "var(--cyan)" }} /> Live stream available <button onClick={() => setView("lab")} className="view-all" style={{ marginLeft: 7 }}>Open terminal →</button></div>}</div>)}</div><div className="card full-card"><div className="eyebrow">Worker safeguards</div><h2 style={{ fontSize: 17, margin: "10px 0 8px", letterSpacing: "-.04em" }}>Your scans run isolated.</h2><p style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 20px" }}>Every worker is constrained by SSRF protection, DNS rebinding checks, private-IP deny lists, and an explicit authorization token.</p><div className="ledger"><div className="ledger-entry"><div className="ledger-top"><span style={{ fontSize: 10, color: "var(--green)" }}>● Guardrails active</span><ShieldCheck size={14} color="var(--green)" /></div><div className="ledger-meta"><span>OWASP ASVS 4.0.3</span><span>·</span><span>Zero trust</span></div></div><div className="ledger-entry"><div className="ledger-top"><span style={{ fontSize: 10 }}>Queue capacity</span><span className="mono" style={{ color: "var(--cyan)" }}>08 / 32</span></div><div className="progress" style={{ marginTop: 10 }}><span style={{ width: "25%" }} /></div></div></div></div></div>
  </>;
}

function Findings({ setView }: { setView: (view: View) => void }) {
  const [active, setActive] = useState("All findings");
  const filtered = useMemo(() => active === "All findings" ? findings : findings.filter((f) => f.severity === active.toLowerCase().replace(" risk", "")), [active]);
  return <><div className="toolbar"><div className="search"><Search size={15} /><input placeholder="Search findings or assets" /></div><select className="select" defaultValue="all"><option value="all">All categories</option><option>Access control</option><option>Cryptography</option></select><button className="ghost" onClick={() => setView("scans")}><Activity size={14} /> Run retest</button></div><div className="tab-row" style={{ margin: "0 0 14px", padding: 0 }}>{["All findings", "Critical risk", "High risk", "Resolved"].map((tab) => <button className={`tab ${active === tab ? "active" : ""}`} onClick={() => setActive(tab)} key={tab}>{tab}</button>)}</div><div className="card full-card"><div className="card-head" style={{ padding: "0 0 14px" }}><div><h2 className="card-title">{filtered.length} findings in scope</h2><div className="card-kicker">Prioritized by exploitability, asset criticality, and confidence</div></div><button className="ghost"><Sparkles size={13} color="var(--cyan)" /> AI triage queue</button></div><div className="table-wrap"><table className="table"><thead><tr><th>Finding</th><th>Severity</th><th>CVSS</th><th>Status</th><th>Detected</th><th /></tr></thead><tbody>{filtered.map((finding) => <tr key={finding.title}><td><div className="asset"><div className="asset-mark"><Fingerprint size={13} /></div><div><div className="asset-name">{finding.title}</div><div className="asset-type">{finding.asset} · {finding.category}</div></div></div></td><td><span className={`severity ${finding.severity === "critical" ? "critical" : finding.severity === "high" ? "high" : "info"}`}>{finding.severity}</span></td><td className="mono" style={{ color: finding.severity === "critical" ? "var(--red)" : "var(--amber)" }}>{finding.score}</td><td><span className="status idle">{finding.status}</span></td><td className="mono" style={{ color: "#7586a4" }}>{finding.time}</td><td><button className="icon-button" style={{ width: 27, height: 27 }} aria-label="Open finding"><ArrowUpRight size={12} /></button></td></tr>)}</tbody></table></div></div></>;
}

function Ledger() {
  return <><div className="card full-card" style={{ marginBottom: 14, background: "linear-gradient(135deg, rgba(18,49,55,.44), rgba(10,16,29,.92))" }}><div style={{ display: "flex", alignItems: "center", gap: 15 }}><div className="stat-icon" style={{ width: 42, height: 42, borderRadius: 12 }}><Blocks size={20} /></div><div style={{ flex: 1 }}><div className="eyebrow">Network status</div><div style={{ fontSize: 15, marginTop: 5 }}>Polygon Amoy testnet <span className="mono" style={{ color: "var(--green)", fontSize: 10 }}>· connected</span></div><div style={{ color: "var(--muted)", fontSize: 10, marginTop: 5 }}>Contract <span className="mono" style={{ color: "var(--cyan)" }}>0x71c8...9A2F</span> · 100% of workspace evidence anchored</div></div><button className="ghost"><WalletCards size={14} /> Verify wallet</button></div></div><div className="grid bottom-grid"><div className="card full-card"><div className="card-head" style={{ padding: 0, marginBottom: 15 }}><div><h2 className="card-title">Immutable evidence</h2><div className="card-kicker">AuditLedger.sol · append-only verification records</div></div><button className="view-all">Explorer <ArrowUpRight size={12} style={{ verticalAlign: "middle" }} /></button></div><div className="ledger">{ledger.map((entry) => <div className="ledger-entry" key={entry.hash}><div className="ledger-top"><span className="ledger-title"><CheckCircle2 size={13} color="var(--green)" style={{ verticalAlign: "middle", marginRight: 6 }} />{entry.title}</span><span className="status done">Verified</span></div><div className="ledger-hash mono">{entry.hash}</div><div className="ledger-meta"><span>Block {entry.block}</span><span>{entry.time}</span><span>Verifier {entry.verifier}</span></div></div>)}</div></div><div className="card full-card"><div className="eyebrow">Verification protocol</div><h2 style={{ fontSize: 17, margin: "10px 0 8px", letterSpacing: "-.04em" }}>Trust, independently.</h2><p style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 18px" }}>Report hashes are committed only after the scan worker signs its result. A verifier can confirm the report was not altered after the fact.</p><div style={{ display: "grid", gap: 10 }}>{[["01", "Generate report hash", "SHA-256 + canonical JSON"], ["02", "Sign with verifier key", "EIP-712 typed data"], ["03", "Anchor to ledger", "AuditLedger.sol event"]].map(([n, title, desc]) => <div style={{ display: "flex", gap: 11, alignItems: "center" }} key={n}><span className="mono" style={{ color: "var(--cyan)", fontSize: 10 }}>{n}</span><div><div style={{ fontSize: 10 }}>{title}</div><div style={{ fontSize: 9, color: "var(--muted)", marginTop: 3 }}>{desc}</div></div></div>)}</div></div></div></>;
}

function Placeholder({ view, setView }: { view: View; setView: (view: View) => void }) {
  const content: Record<"assets" | "incidents" | "lab", { icon: typeof Network; title: string; body: string; action: string; target: View }> = { assets: { icon: Network, title: "Bring your attack surface into focus.", body: "Connect a verified domain, cloud account, or repository to start mapping exposure. The first scan runs in a constrained worker with explicit authorization.", action: "Start asset onboarding", target: "scans" }, incidents: { icon: Siren, title: "Contain risk with confidence.", body: "Incident playbooks, approval gates, and chain-anchored remediation records keep your response auditable from alert to closure.", action: "Review open findings", target: "findings" }, lab: { icon: Code2, title: "An isolated place to learn and fix.", body: "Practice patching common OWASP failures against synthetic fixtures. No shell execution, production writes, or evidence deletion is permitted.", action: "Open first scenario", target: "findings" } };
  const item = content[view as "assets" | "incidents" | "lab"];
  return <div className="card empty-state"><item.icon size={28} /><div style={{ color: "var(--text)", fontSize: 16, fontWeight: 600, letterSpacing: "-.04em", marginBottom: 8 }}>{item.title}</div><p>{item.body}</p><button className="primary" style={{ margin: "0 auto" }} onClick={() => setView(item.target)}><Plus size={14} /> {item.action}</button></div>;
}

export default function Home() {
  const [view, setView] = useState<View>("overview");
  return <div className="app-shell"><Sidebar view={view} setView={setView} /><main className="main"><Header view={view} setView={setView} /><motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28, ease: "easeOut" }}>{view === "overview" && <Overview setView={setView} />}{view === "scans" && <LiveScans setView={setView} />}{view === "findings" && <Findings setView={setView} />}{view === "ledger" && <Ledger />}{["assets", "incidents", "lab"].includes(view) && <Placeholder view={view} setView={setView} />}</motion.div></main></div>;
}
