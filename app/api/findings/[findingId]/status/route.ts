import { z } from "zod";
import { apiFail, apiOk, requestId } from "../../../../../server/http";
import { updateFindingStatus, type FindingStatus } from "../../../../../server/control-plane-store";
import { AccessError, requireRole, requireSession } from "../../../../../server/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const StatusSchema = z.object({ status: z.enum(["open", "triaged", "in_review", "resolved", "accepted_risk"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ findingId: string }> }) {
  const id = requestId();
  try {
    const session = requireSession(request);
    requireRole(session, ["owner", "admin", "analyst"]);
    const { findingId } = await params;
    const { status } = StatusSchema.parse(await request.json());
    const updated = updateFindingStatus(findingId, session.organizationId, session.userId, status as FindingStatus);
    if (!updated) return apiFail("FINDING_NOT_FOUND", "Finding not found.", id, 404);
    return apiOk(updated, id);
  } catch (error) {
    if (error instanceof z.ZodError) return apiFail("INVALID_STATUS", "Finding status is invalid.", id, 400);
    if (error instanceof AccessError) return apiFail(error.code, error.message, id, error.status);
    return apiFail("INTERNAL_ERROR", "The request could not be completed.", id, 500);
  }
}
