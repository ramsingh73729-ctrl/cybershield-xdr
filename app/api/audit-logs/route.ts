import { apiFail, apiOk, requestId } from "../../../server/http";
import { listAuditLogs } from "../../../server/control-plane-store";
import { AccessError, requireSession } from "../../../server/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const id = requestId();
  try {
    const session = requireSession(request);
    return apiOk(listAuditLogs(session.organizationId), id);
  } catch (error) {
    if (error instanceof AccessError) return apiFail(error.code, error.message, id, error.status);
    return apiFail("INTERNAL_ERROR", "The request could not be completed.", id, 500);
  }
}
