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
- Evidence redaction helper for AI payloads.
- PostgreSQL schema with organization ownership primitives, enums, indexes, and Row Level Security enabled for tenant-scoped tables.
- Solidity `AuditLedger.sol` with report anchoring, domain proof events, and critical remediation events.

## Security boundary

The UI intentionally uses safe demo data. Real scanning should run in isolated workers behind an authorization-token flow, with the `assertSafeScanTarget` guard invoked immediately before every outbound connection. The AI boundary should accept only redacted, schema-validated JSON and must never receive shell access, production write access, permission mutation capability, or evidence deletion capability.

Before deploying, add a migration runner, session/MFA provider, Redis-backed queue, IPFS pinning policy, EIP-712 verifier, contract deployment controls, audit retention policy, and a CI pipeline that runs dependency, secret, SAST, and DAST checks.
