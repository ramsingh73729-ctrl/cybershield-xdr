import { apiFail, apiOk, requestId } from "../../../../../server/http";
import { containIncident } from "../../../../../server/control-plane-store";
import { AccessError, requireRole, requireSession } from "../../../../../server/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ incidentId: string }> }) {
  const id = requestId();
  try {
    const session = requireSession(request);
    requireRole(session, ["owner", "admin"]);
    const { incidentId } = await params;
    const updated = containIncident(incidentId, session.organizationId, session.userId);
    if (!updated) return apiFail("INCIDENT_NOT_FOUND", "Incident not found.", id, 404);
    return apiOk(updated, id);
  } catch (error) {
    if (error instanceof AccessError) return apiFail(error.code, error.message, id, error.status);
    return apiFail("INTERNAL_ERROR", "The request could not be completed.", id, 500);
  }
}
