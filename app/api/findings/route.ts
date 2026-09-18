import { apiFail, apiOk, requestId } from "../../../server/http";
import { listFindings, type FindingStatus } from "../../../server/control-plane-store";
import { AccessError, requireSession } from "../../../server/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const statuses = new Set<FindingStatus>(["open", "triaged", "in_review", "resolved", "accepted_risk"]);

export async function GET(request: Request) {
  const id = requestId();
  try {
    const session = requireSession(request);
    const value = new URL(request.url).searchParams.get("status") ?? undefined;
    if (value && !statuses.has(value as FindingStatus)) return apiFail("INVALID_STATUS", "Finding status is invalid.", id, 400);
    return apiOk(listFindings(session.organizationId, value as FindingStatus | undefined), id);
  } catch (error) {
    if (error instanceof AccessError) return apiFail(error.code, error.message, id, error.status);
    return apiFail("INTERNAL_ERROR", "The request could not be completed.", id, 500);
  }
}
