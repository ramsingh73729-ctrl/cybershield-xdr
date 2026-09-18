import { NextResponse } from "next/server";
import { PROFILE_COOKIE } from "../../../../server/auth-profile";
import { SESSION_COOKIE } from "../../../../server/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ success: true, data: null });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  response.cookies.set(PROFILE_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
