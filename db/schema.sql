CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE member_role AS ENUM ('owner', 'admin', 'analyst', 'viewer');
CREATE TYPE scan_status AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE finding_status AS ENUM ('open', 'triaged', 'in_review', 'resolved', 'accepted_risk');

CREATE TABLE organizations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email CITEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, mfa_enabled BOOLEAN NOT NULL DEFAULT false, wallet_address TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE organization_members (organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, role member_role NOT NULL DEFAULT 'viewer', PRIMARY KEY (organization_id, user_id));
CREATE TABLE projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT, created_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE assets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE, asset_type TEXT NOT NULL, target TEXT NOT NULL, environment TEXT NOT NULL CHECK (environment IN ('production', 'staging', 'development', 'lab')), verified BOOLEAN NOT NULL DEFAULT false, criticality SMALLINT NOT NULL CHECK (criticality BETWEEN 1 AND 5), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE scans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE, asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE, scan_mode TEXT NOT NULL, status scan_status NOT NULL DEFAULT 'queued', blockchain_tx_hash TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE findings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE, title TEXT NOT NULL, category TEXT NOT NULL, severity TEXT NOT NULL, confidence NUMERIC(5,4), endpoint TEXT, evidence JSONB NOT NULL DEFAULT '{}'::jsonb, recommendation TEXT, status finding_status NOT NULL DEFAULT 'open', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE security_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, actor_id UUID REFERENCES users(id), event_type TEXT NOT NULL, metadata JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE incidents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, title TEXT NOT NULL, severity TEXT NOT NULL, status TEXT NOT NULL, description TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE INDEX security_events_org_created_idx ON security_events (organization_id, created_at DESC);
CREATE INDEX findings_scan_status_idx ON findings (scan_id, status);

-- Defense in depth: every organization-scoped transaction must set this value
-- before reading or writing rows. The API layer still performs object checks.
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
