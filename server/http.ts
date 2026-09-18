import { NextResponse } from "next/server";
import type { StandardResponse } from "./api-contracts";

export function requestId() {
  return crypto.randomUUID();
}

export function apiHeaders(id: string, extra: HeadersInit = {}): HeadersInit {
  return { "Cache-Control": "no-store", "X-Request-ID": id, ...extra };
}

export function apiOk<T>(data: T, id: string, init: ResponseInit = {}) {
  return NextResponse.json<StandardResponse<T>>({ success: true, data, requestId: id }, { ...init, headers: apiHeaders(id, init.headers) });
}

export function apiFail(code: string, message: string, id: string, status = 400, init: ResponseInit = {}) {
  return NextResponse.json<StandardResponse<never>>({ success: false, error: { code, message }, requestId: id }, { ...init, status, headers: apiHeaders(id, init.headers) });
}
