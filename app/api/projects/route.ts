import { z } from "zod";
import { apiFail, apiOk, requestId } from "../../../server/http";
import { createProject, listProjects } from "../../../server/control-plane-store";
import { AccessError, requireRole, requireSession } from "../../../server/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ProjectSchema = z.object({ name: z.string().trim().min(2).max(120), description: z.string().trim().max(1000).optional() });

function accessResponse(error: unknown, id: string) {
  if (error instanceof AccessError) return apiFail(error.code, error.message, id, error.status);
  return apiFail("INTERNAL_ERROR", "The request could not be completed.", id, 500);
}

export async function GET(request: Request) {
  const id = requestId();
  try {
    const session = requireSession(request);
    return apiOk(listProjects(session.organizationId), id);
  } catch (error) {
    return accessResponse(error, id);
  }
}

export async function POST(request: Request) {
  const id = requestId();
  try {
    const session = requireSession(request);
    requireRole(session, ["owner", "admin"]);
    const input = ProjectSchema.parse(await request.json());
    return apiOk(createProject({ ...input, organizationId: session.organizationId, createdBy: session.userId }), id, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return apiFail("INVALID_PROJECT", "Project input is invalid.", id, 400);
    return accessResponse(error, id);
  }
}
