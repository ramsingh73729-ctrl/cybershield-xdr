import dns from "node:dns/promises";
import net from "node:net";

/**
 * Scan-worker guardrail. Call this before a worker makes any outbound request.
 * Production workers should also re-check the resolved address immediately
 * before connecting to protect against DNS rebinding.
 */
export async function assertSafeScanTarget(target: string, localLabMode = false) {
  const parsed = new URL(target.includes("://") ? target : `https://${target}`);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only HTTP(S) targets are supported.');
  if (parsed.username || parsed.password) throw new Error('Credential-bearing URLs are not permitted.');
  if (localLabMode && parsed.hostname === 'localhost') return parsed;
  if (net.isIP(parsed.hostname)) {
    if (isPrivateIp(parsed.hostname)) throw new Error('Private or reserved IP targets are blocked.');
    return parsed;
  }
  const records = await dns.lookup(parsed.hostname, { all: true, verbatim: true });
  if (!records.length || records.some((record) => isPrivateIp(record.address))) throw new Error('Target resolves to a private or reserved address.');
  return parsed;
}

function isPrivateIp(address: string) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  const normalized = address.toLowerCase();
  return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:');
}

export function redactSensitiveEvidence(input: unknown): unknown {
  if (typeof input === 'string') return input.replace(/(authorization|cookie|token|secret|password|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, '$1: [REDACTED]');
  if (Array.isArray(input)) return input.map(redactSensitiveEvidence);
  if (input && typeof input === 'object') return Object.fromEntries(Object.entries(input as Record<string, unknown>).map(([key, value]) => [key, /authorization|cookie|token|secret|password|api[_-]?key/i.test(key) ? '[REDACTED]' : redactSensitiveEvidence(value)]));
  return input;
}
