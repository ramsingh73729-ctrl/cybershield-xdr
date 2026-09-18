import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const SESSION_COOKIE = "csxdr_session";
const SessionSchema = z.object({
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  role: z.enum(["owner", "admin", "analyst", "viewer"]),
  sessionId: z.string().uuid(),
  expiresAt: z.number().int(),
});

export type Session = z.infer<typeof SessionSchema>;

export class AccessError extends Error {
  constructor(public readonly code: string, public readonly status: number, message: string) {
    super(message);
    this.name = "AccessError";
  }
}

function sessionSecret() {
  const secret = process.env.CSXDR_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new AccessError("SESSION_NOT_CONFIGURED", 503, "Session verification is not configured.");
  return secret;
}

function cookieValue(request: Request) {
  const header = request.headers.get("cookie") ?? "";
  return header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
}

export function requireSession(request: Request): Session {
  const token = cookieValue(request);
  if (!token) throw new AccessError("AUTHENTICATION_REQUIRED", 401, "A valid session is required.");

  const [encodedClaims, signature] = token.split(".");
  if (!encodedClaims || !signature) throw new AccessError("INVALID_SESSION", 401, "The session is invalid.");

  const expected = createHmac("sha256", sessionSecret()).update(encodedClaims).digest("base64url");
  const providedBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (providedBytes.length !== expectedBytes.length || !timingSafeEqual(providedBytes, expectedBytes)) {
    throw new AccessError("INVALID_SESSION", 401, "The session is invalid.");
  }

  try {
    const session = SessionSchema.parse(JSON.parse(Buffer.from(encodedClaims, "base64url").toString("utf8")));
    if (session.expiresAt <= Math.floor(Date.now() / 1000)) throw new AccessError("SESSION_EXPIRED", 401, "The session has expired.");
    return session;
  } catch (error) {
    if (error instanceof AccessError) throw error;
    throw new AccessError("INVALID_SESSION", 401, "The session is invalid.");
  }
}

export function requireRole(session: Session, roles: Session["role"][]) {
  if (!roles.includes(session.role)) throw new AccessError("FORBIDDEN", 403, "Your role cannot perform this action.");
}
