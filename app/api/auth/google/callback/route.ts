import { timingSafeEqual, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { issueProfileCookie, PROFILE_COOKIE } from "../../../../../server/auth-profile";
import { issueSession, SESSION_COOKIE } from "../../../../../server/session";

export const runtime = "nodejs";

const STATE_COOKIE = "csxdr_google_state";
const VERIFIER_COOKIE = "csxdr_google_verifier";
const GoogleUserSchema = z.object({ sub: z.string().min(1), email: z.string().email(), email_verified: z.boolean(), name: z.string().optional() });

function appUrl(request: Request) {
  return (process.env.CSXDR_APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
}

function redirectUri(request: Request) {
  return process.env.GOOGLE_REDIRECT_URI || `${appUrl(request)}/api/auth/google/callback`;
}

function finish(request: Request, status: string) {
  return NextResponse.redirect(new URL(`/?auth=${status}`, appUrl(request)));
}

function sameValue(left: string | undefined, right: string | undefined) {
  if (!left || !right) return false;
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function displayName(email: string, name?: string) {
  if (name?.trim()) return name.trim().slice(0, 120);
  return email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 120);
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "CS";
}

function organizationFor(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || ["gmail.com", "googlemail.com"].includes(domain)) return "Personal workspace";
  return domain.split(".")[0].replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 120);
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  if (query.get("error")) return finish(request, "google-cancelled");

  const state = query.get("state") ?? undefined;
  const code = query.get("code");
  const stateCookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${STATE_COOKIE}=`))?.slice(STATE_COOKIE.length + 1);
  const verifier = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${VERIFIER_COOKIE}=`))?.slice(VERIFIER_COOKIE.length + 1);
  if (!sameValue(state, stateCookie) || !verifier || !code) return finish(request, "google-invalid-state");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return finish(request, "google-unconfigured");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri(request), grant_type: "authorization_code", code_verifier: verifier }),
      cache: "no-store",
    });
    const token = await tokenResponse.json() as { access_token?: string };
    if (!tokenResponse.ok || !token.access_token) return finish(request, "google-token-error");

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` }, cache: "no-store" });
    const profile = GoogleUserSchema.safeParse(await profileResponse.json());
    if (!profileResponse.ok || !profile.success || !profile.data.email_verified) return finish(request, "google-profile-error");

    const name = displayName(profile.data.email, profile.data.name);
    const response = finish(request, "google-success");
    const secure = process.env.NODE_ENV === "production";
    const cookieOptions = { httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge: 3600 };
    const session = issueSession({ userId: randomUUID(), organizationId: randomUUID(), role: "owner", ttlSeconds: 3600 });
    const userProfile = issueProfileCookie({ name, email: profile.data.email.toLowerCase(), organization: organizationFor(profile.data.email), initials: initials(name) });
    response.cookies.set(SESSION_COOKIE, session, cookieOptions);
    response.cookies.set(PROFILE_COOKIE, userProfile, cookieOptions);
    response.cookies.delete(STATE_COOKIE);
    response.cookies.delete(VERIFIER_COOKIE);
    return response;
  } catch {
    return finish(request, "google-login-error");
  }
}
