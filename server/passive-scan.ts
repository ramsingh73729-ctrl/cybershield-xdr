import { assertSafeScanTarget } from "./security";

export type PassiveFinding = {
  id: string;
  title: string;
  category: string;
  severity: "low" | "medium" | "high";
  confidence: number;
  endpoint: string;
  evidence: Record<string, string>;
  recommendation: string;
  status: "open";
};

export type PassiveScanResult = {
  finalUrl: string;
  httpStatus: number;
  checkedAt: string;
  coverage: "passive-perimeter";
  checksRun: number;
  findings: PassiveFinding[];
};

const REDIRECTS = new Set([301, 302, 303, 307, 308]);

function finding(input: Omit<PassiveFinding, "id" | "status">): PassiveFinding {
  return { ...input, id: crypto.randomUUID(), status: "open" };
}

async function fetchWithSafeRedirects(target: string, localLabMode: boolean) {
  let current = await assertSafeScanTarget(target, localLabMode);
  for (let hop = 0; hop < 3; hop += 1) {
    const response = await fetch(current, {
      redirect: "manual",
      headers: { "User-Agent": "CyberShield-XDR-Posture-Scanner/1.0" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!REDIRECTS.has(response.status)) return { response, url: current };
    const location = response.headers.get("location");
    if (!location) return { response, url: current };
    current = await assertSafeScanTarget(new URL(location, current).toString(), localLabMode);
  }
  throw new Error("Redirect limit exceeded.");
}

function cookieParts(value: string) {
  return value.split(/,(?=[^;,]+=)/).map((cookie) => cookie.trim()).filter(Boolean);
}

/**
 * Low-impact posture checks only: one GET request, no crawling, authentication
 * guessing, payload injection, exploit execution, or state-changing requests.
 */
export async function runPassiveScan(target: string, localLabMode = false): Promise<PassiveScanResult> {
  const { response, url } = await fetchWithSafeRedirects(target, localLabMode);
  const headers = response.headers;
  const endpoint = url.toString();
  const csp = headers.get("content-security-policy")?.toLowerCase() ?? "";
  const setCookie = headers.get("set-cookie");
  const findings: PassiveFinding[] = [];
  let checksRun = 14;

  if (url.protocol !== "https:") findings.push(finding({ title: "Transport is not encrypted", category: "Cryptography", severity: "high", confidence: 0.99, endpoint, evidence: { protocol: url.protocol }, recommendation: "Serve the application over HTTPS and redirect HTTP to HTTPS." }));
  if (url.protocol === "https:" && !headers.get("strict-transport-security")) findings.push(finding({ title: "HSTS header is missing", category: "Security headers", severity: "medium", confidence: 0.98, endpoint, evidence: { header: "Strict-Transport-Security" }, recommendation: "Add HSTS with an appropriate max-age after confirming HTTPS is universal." }));
  if (!headers.get("content-security-policy")) findings.push(finding({ title: "Content Security Policy is missing", category: "Security headers", severity: "high", confidence: 0.99, endpoint, evidence: { header: "Content-Security-Policy" }, recommendation: "Define a restrictive CSP and roll it out with report-only validation first." }));
  if (!headers.get("x-content-type-options")) findings.push(finding({ title: "MIME sniffing protection is missing", category: "Security headers", severity: "medium", confidence: 0.99, endpoint, evidence: { header: "X-Content-Type-Options" }, recommendation: "Send X-Content-Type-Options: nosniff on application responses." }));
  if (!headers.get("referrer-policy")) findings.push(finding({ title: "Referrer-Policy is missing", category: "Privacy", severity: "low", confidence: 0.98, endpoint, evidence: { header: "Referrer-Policy" }, recommendation: "Set a restrictive Referrer-Policy such as strict-origin-when-cross-origin." }));
  if (!headers.get("permissions-policy")) findings.push(finding({ title: "Permissions-Policy is missing", category: "Browser hardening", severity: "low", confidence: 0.97, endpoint, evidence: { header: "Permissions-Policy" }, recommendation: "Disable browser capabilities that the application does not need." }));
  if (!headers.get("x-frame-options") && !csp.includes("frame-ancestors")) findings.push(finding({ title: "Clickjacking protection is missing", category: "Access control", severity: "medium", confidence: 0.98, endpoint, evidence: { headers: "X-Frame-Options / CSP frame-ancestors" }, recommendation: "Set X-Frame-Options or a CSP frame-ancestors directive." }));

  const corsOrigin = headers.get("access-control-allow-origin");
  if (corsOrigin === "*") findings.push(finding({ title: "CORS allows every origin", category: "API security", severity: "medium", confidence: 0.95, endpoint, evidence: { header: "Access-Control-Allow-Origin", value: "*" }, recommendation: "Allow only the trusted origins required by the application and review credentialed cross-origin flows." }));

  const disclosedHeaders: Array<[string, string, "low" | "medium"]> = [
    ["server", "Server", "low"],
    ["x-powered-by", "X-Powered-By", "medium"],
    ["x-aspnet-version", "X-AspNet-Version", "low"],
    ["x-generator", "X-Generator", "low"],
  ];
  for (const [header, label, severity] of disclosedHeaders) {
    if (headers.get(header)) findings.push(finding({ title: `${label} header discloses implementation details`, category: "Information disclosure", severity, confidence: 0.93, endpoint, evidence: { header, present: "true" }, recommendation: `Remove or minimize the ${label} response header to reduce technology fingerprinting.` }));
  }
  if (!headers.get("cross-origin-opener-policy")) findings.push(finding({ title: "Cross-Origin-Opener-Policy is missing", category: "Browser hardening", severity: "low", confidence: 0.9, endpoint, evidence: { header: "Cross-Origin-Opener-Policy" }, recommendation: "Set an explicit opener policy where the application does not require cross-origin window relationships." }));
  if (!headers.get("cross-origin-resource-policy")) findings.push(finding({ title: "Cross-Origin-Resource-Policy is missing", category: "Browser hardening", severity: "low", confidence: 0.9, endpoint, evidence: { header: "Cross-Origin-Resource-Policy" }, recommendation: "Choose a resource policy such as same-origin or same-site where compatible." }));
  if (setCookie && headers.get("cache-control")?.toLowerCase().includes("public")) findings.push(finding({ title: "Cookie response is publicly cacheable", category: "Session management", severity: "high", confidence: 0.96, endpoint, evidence: { header: "Cache-Control", value: "public with Set-Cookie" }, recommendation: "Use private or no-store caching for responses that set authentication or session cookies." }));

  for (const cookie of setCookie ? cookieParts(setCookie) : []) {
    checksRun += 3;
    const name = cookie.split("=", 1)[0] || "unnamed cookie";
    const normalized = cookie.toLowerCase();
    if (url.protocol === "https:" && !normalized.includes("; secure")) findings.push(finding({ title: `Cookie ${name} is missing Secure`, category: "Session management", severity: "high", confidence: 0.99, endpoint, evidence: { cookie: name, missing: "Secure" }, recommendation: "Mark authentication and session cookies Secure." }));
    if (!normalized.includes("; httponly")) findings.push(finding({ title: `Cookie ${name} is missing HttpOnly`, category: "Session management", severity: "medium", confidence: 0.99, endpoint, evidence: { cookie: name, missing: "HttpOnly" }, recommendation: "Mark cookies that do not need JavaScript access HttpOnly." }));
    if (!normalized.includes("samesite=")) findings.push(finding({ title: `Cookie ${name} is missing SameSite`, category: "Session management", severity: "medium", confidence: 0.99, endpoint, evidence: { cookie: name, missing: "SameSite" }, recommendation: "Set an explicit SameSite policy appropriate to the application flow." }));
  }

  return { finalUrl: endpoint, httpStatus: response.status, checkedAt: new Date().toISOString(), coverage: "passive-perimeter", checksRun, findings };
}
