# CyberShield XDR

CyberShield XDR is a production-minded SOC interface for continuous exposure management, AI-assisted triage, and tamper-evident security evidence.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Included in this starter

- High-density dark SOC dashboard with live-style telemetry, posture scoring, asset pulse, findings triage, scan operations, and an audit ledger view.
- Responsive Next.js App Router surface using React, Framer Motion-ready interaction patterns, Lucide icons, Recharts, and Tailwind-compatible setup.
- Standardized API response contract and a `/api/health` route.
- Scan-worker guardrail for HTTP(S)-only targets, credential-free URLs, DNS rebinding resistance, and private/reserved IP blocking.
- Authorized URL posture scan that follows at most three validated redirects, performs one read-only GET, and reports observable HTTPS, security-header, clickjacking, and cookie-attribute gaps without crawling or exploit traffic.
- Evidence redaction helper for AI payloads.
- PostgreSQL schema with organization ownership primitives, enums, indexes, and Row Level Security enabled for tenant-scoped tables.
- Solidity `AuditLedger.sol` with report anchoring, domain proof events, and critical remediation events.
- Signed-session gate for organization-scoped project, finding, incident, and audit-log APIs. The gate verifies an HMAC-signed `csxdr_session` HttpOnly cookie and enforces role checks before mutating control-plane data.
- Standard API helpers with request IDs, no-store responses, and explicit 401/403/503 failure modes.

## Security boundary

The scan UI requires an explicit authorization confirmation and is limited to low-impact posture checks. It cannot prove that a site has never been breached or discover historical compromise. Real scanning should run in isolated workers behind an authorization-token flow, with the `assertSafeScanTarget` guard invoked immediately before every outbound connection. The AI boundary should accept only redacted, schema-validated JSON and must never receive shell access, production write access, permission mutation capability, or evidence deletion capability.

Before deploying, set a high-entropy `CSXDR_SESSION_SECRET`, replace the in-memory control-plane adapter with PostgreSQL repositories that set transaction-local RLS context, add a session/MFA issuer, Redis-backed queue, IPFS pinning policy, EIP-712 verifier, contract deployment controls, audit retention policy, and CI jobs for dependency, secret, SAST, and DAST checks.
