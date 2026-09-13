import dns from "node:dns/promises";
import net from "node:net";

/**
 * Scan-worker guardrail. Call this before a worker makes any outbound request.
 * Production workers should also re-check the resolved address immediately
 * before connecting to protect against DNS rebinding.
 */
export async function assertSafeScanTarget(target: string, localLabMode = false) {
  const parsed = new URL(target.includes("://") ? target : `https://${target}`);
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Only HTTP(S) targets are supported.");
  if (parsed.username || parsed.password) throw new Error("Credential-bearing URLs are not permitted.");
  if (localLabMode && parsed.hostname === "localhost") return parsed;
  if (net.isIP(parsed.hostname)) {
    if (isPrivateIp(parsed.hostname)) throw new Error("Private or reserved IP targets are blocked.");
    return parsed;
  }
  const records = await dns.lookup(parsed.hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => isPrivateIp(record.address))) throw new Error("Target resolves to a private or reserved address.");
  return parsed;
}

function isPrivateIp(address: string): boolean {
  if (net.isIPv4(address)) {
    const parts = address.split(".").map(Number);
    const [a, b, c] = parts;
    const value = parts.reduce((total, part) => total * 256 + part, 0);
    const inRange = (start: number, end: number) => value >= start && value <= end;

    // Include private, link-local, loopback, documentation, benchmarking,
    // multicast, and otherwise non-routable ranges. Scanners must never use
    // a public DNS name to reach an internal service through a rebinding.
    return a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 0 && c === 0) ||
      (a === 192 && b === 0 && c === 2) ||
      (a === 192 && b === 168) ||
      (a === 198 && b === 18) || (a === 198 && b === 19) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113) ||
      inRange(0xE0000000, 0xFFFFFFFF);
  }
  const normalized = address.toLowerCase();
  const mappedIpv4 = normalized.match(/::ffff:(?:0:)?(\d+\.\d+\.\d+\.\d+)$/);
  const mappedAddress = mappedIpv4?.[1];
  return Boolean(mappedAddress && isPrivateIp(mappedAddress)) ||
    normalized === "::" || normalized === "::1" ||
    normalized.startsWith("fc") || normalized.startsWith("fd") ||
    normalized.startsWith("fe80:") || normalized.startsWith("ff") ||
    normalized.startsWith("2001:db8:");
}

export function redactSensitiveEvidence(input: unknown): unknown {
  if (typeof input === "string") return input.replace(/(authorization|cookie|token|secret|password|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, "$1: [REDACTED]");
  if (Array.isArray(input)) return input.map(redactSensitiveEvidence);
  if (input && typeof input === "object") return Object.fromEntries(Object.entries(input as Record<string, unknown>).map(([key, value]) => [key, /authorization|cookie|token|secret|password|api[_-]?key/i.test(key) ? "[REDACTED]" : redactSensitiveEvidence(value)]));
  return input;
}
