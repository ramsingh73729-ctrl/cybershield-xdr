import { NextResponse } from "next/server";
import { apiFail, apiOk, requestId } from "../../../../server/http";
import { readProfileCookie } from "../../../../server/auth-profile";
import { AccessError, requireSession } from "../../../../server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = requestId();
  try {
    const session = requireSession(request);
    const profile = readProfileCookie(request);
    if (!profile) return apiFail("PROFILE_NOT_FOUND", "The account profile could not be loaded.", id, 401);
    return apiOk({ user: profile, expiresAt: session.expiresAt }, id);
  } catch (error) {
    if (error instanceof AccessError) return apiFail(error.code, error.message, id, error.status);
    return NextResponse.json({ success: false, error: { code: "PROFILE_UNAVAILABLE", message: "The account profile could not be loaded." }, requestId: id }, { status: 401, headers: { "Cache-Control": "no-store", "X-Request-ID": id } });
  }
}
