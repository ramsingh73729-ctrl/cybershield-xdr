import { NextResponse } from "next/server";
import { getScanJob } from "../../../../server/scan-store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ scanId: string }> }) {
  const requestId = crypto.randomUUID();
  const { scanId } = await params;
  const job = getScanJob(scanId);
  if (!job) return NextResponse.json({ success: false, error: { code: "SCAN_NOT_FOUND", message: "Scan job not found." }, requestId }, { status: 404, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } });
  return NextResponse.json({ success: true, data: job, requestId }, { headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } });
}
