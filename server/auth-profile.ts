import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { z } from "zod";

export const PROFILE_COOKIE = "csxdr_profile";

const ProfileSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(320),
  organization: z.string().min(1).max(120),
  initials: z.string().min(1).max(3),
});

export type AuthProfile = z.infer<typeof ProfileSchema>;

function profileKey() {
  const secret = process.env.CSXDR_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Session encryption is not configured.");
  return createHash("sha256").update(secret, "utf8").digest();
}

function cookieValue(request: Request) {
  return request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${PROFILE_COOKIE}=`))?.slice(PROFILE_COOKIE.length + 1);
}

export function issueProfileCookie(profile: AuthProfile) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", profileKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(profile), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64url");
}

export function readProfileCookie(request: Request): AuthProfile | null {
  const value = cookieValue(request);
  if (!value) return null;
  try {
    const payload = Buffer.from(value, "base64url");
    if (payload.length < 28) return null;
    const decipher = createDecipheriv("aes-256-gcm", profileKey(), payload.subarray(0, 12));
    decipher.setAuthTag(payload.subarray(12, 28));
    const plaintext = Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8");
    const parsed = ProfileSchema.safeParse(JSON.parse(plaintext));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
