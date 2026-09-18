export type Project = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
};

export type FindingStatus = "open" | "triaged" | "in_review" | "resolved" | "accepted_risk";

export type Finding = {
  id: string;
  organizationId: string;
  scanId: string;
  title: string;
  category: string;
  severity: string;
  confidence: number | null;
  endpoint: string | null;
  evidence: Record<string, unknown>;
  recommendation: string | null;
  status: FindingStatus;
  createdAt: string;
};

export type Incident = {
  id: string;
  organizationId: string;
  title: string;
  severity: string;
  status: "open" | "contained" | "resolved";
  description: string | null;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  organizationId: string;
  actorId: string;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

// Demo adapter only. Replace these maps with PostgreSQL repositories using
// transaction-local RLS settings before enabling production persistence.
const projects = new Map<string, Project>();
const findings = new Map<string, Finding>();
const incidents = new Map<string, Incident>();
const auditLogs = new Map<string, AuditLog[]>();

function now() {
  return new Date().toISOString();
}

function appendAudit(organizationId: string, actorId: string, eventType: string, metadata: Record<string, unknown>) {
  const event: AuditLog = { id: crypto.randomUUID(), organizationId, actorId, eventType, metadata, createdAt: now() };
  auditLogs.set(organizationId, [event, ...(auditLogs.get(organizationId) ?? [])].slice(0, 500));
  return event;
}

export function listProjects(organizationId: string) {
  return Array.from(projects.values()).filter((project) => project.organizationId === organizationId);
}

export function createProject(input: { organizationId: string; createdBy: string; name: string; description?: string }) {
  const project: Project = { id: crypto.randomUUID(), organizationId: input.organizationId, name: input.name, description: input.description || null, createdBy: input.createdBy, createdAt: now() };
  projects.set(project.id, project);
  appendAudit(project.organizationId, project.createdBy, "project.created", { projectId: project.id, name: project.name });
  return project;
}

export function listFindings(organizationId: string, status?: FindingStatus) {
  return Array.from(findings.values()).filter((finding) => finding.organizationId === organizationId && (!status || finding.status === status));
}

export function updateFindingStatus(id: string, organizationId: string, actorId: string, status: FindingStatus) {
  const finding = findings.get(id);
  if (!finding || finding.organizationId !== organizationId) return undefined;
  const updated = { ...finding, status };
  findings.set(id, updated);
  appendAudit(organizationId, actorId, "finding.status_changed", { findingId: id, status });
  return updated;
}

export function listIncidents(organizationId: string) {
  return Array.from(incidents.values()).filter((incident) => incident.organizationId === organizationId);
}

export function createIncident(input: { organizationId: string; actorId: string; title: string; severity: string; description?: string }) {
  const incident: Incident = { id: crypto.randomUUID(), organizationId: input.organizationId, title: input.title, severity: input.severity, status: "open", description: input.description || null, createdAt: now() };
  incidents.set(incident.id, incident);
  appendAudit(input.organizationId, input.actorId, "incident.created", { incidentId: incident.id, severity: incident.severity });
  return incident;
}

export function containIncident(id: string, organizationId: string, actorId: string) {
  const incident = incidents.get(id);
  if (!incident || incident.organizationId !== organizationId) return undefined;
  const updated = { ...incident, status: "contained" as const };
  incidents.set(id, updated);
  appendAudit(organizationId, actorId, "incident.contained", { incidentId: id });
  return updated;
}

export function listAuditLogs(organizationId: string) {
  return auditLogs.get(organizationId) ?? [];
}
