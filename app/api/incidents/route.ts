import { z } from "zod";
import { apiFail, apiOk, requestId } from "../../../server/http";
import { createIncident, listIncidents } from "../../../server/control-plane-store";
import { AccessError, requireRole, requireSession } from "../../../server/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const IncidentSchema = z.object({ title: z.string().trim().min(3).max(180), severity: z.enum(["low", "medium", "high", "critical"]), description: z.string().trim().max(4000).optional() });

export async function GET(request: Request) {
  const id = requestId();
  try {
    const session = requireSession(request);
    return apiOk(listIncidents(session.organizationId), id);
  } catch (error) {
    if (error instanceof AccessError) return apiFail(error.code, error.message, id, error.status);
    return apiFail("INTERNAL_ERROR", "The request could not be completed.", id, 500);
  }
}

export async function POST(request: Request) {
  const id = requestId();
  try {
    const session = requireSession(request);
    requireRole(session, ["owner", "admin", "analyst"]);
    const input = IncidentSchema.parse(await request.json());
    return apiOk(createIncident({ ...input, organizationId: session.organizationId, actorId: session.userId }), id, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return apiFail("INVALID_INCIDENT", "Incident input is invalid.", id, 400);
    if (error instanceof AccessError) return apiFail(error.code, error.message, id, error.status);
    return apiFail("INTERNAL_ERROR", "The request could not be completed.", id, 500);
  }
}
