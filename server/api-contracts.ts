import { z } from "zod";

export const ScanRequestSchema = z.object({
  projectId: z.string().uuid(),
  assetId: z.string().uuid(),
  scanMode: z.enum(['quick-perimeter', 'full-web', 'deep-api', 'container']),
  authorizationToken: z.string().min(20).max(256),
  localLabMode: z.boolean().default(false),
});

export const StandardResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.object({ code: z.string(), message: z.string() }).optional(),
  requestId: z.string().uuid(),
});

export type StandardResponse<T> = { success: true; data: T; error?: never; requestId: string } | { success: false; data?: never; error: { code: string; message: string }; requestId: string };

export function ok<T>(data: T, requestId: string): StandardResponse<T> { return { success: true, data, requestId }; }
export function fail(code: string, message: string, requestId: string): StandardResponse<never> { return { success: false, error: { code, message }, requestId }; }
