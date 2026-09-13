import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSafeScanTarget } from "../../../server/security";
import { advanceScanJob, createScanJob, listScanJobs } from "../../../server/scan-store";

export const dynamic = "force-dynamic";

const ScanInputSchema = z.object({
  projectId: z.string().uuid(),
  assetId: z.string().uuid(),
  target: z.string().min(3).max(2048),
  scanMode: z.enum(['quick-perimeter', 'full-web', 'deep-api', 'container']),
  authorizationToken: z.string().min(20).max(256),
  localLabMode: z.boolean().default(false),
});

export async function GET() {
  const requestId = crypto.randomUUID();
  return NextResponse.json({ success: true, data: listScanJobs(), requestId }, { headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const input = ScanInputSchema.parse(await request.json());
    await assertSafeScanTarget(input.target, input.localLabMode);
    const job = createScanJob({ projectId: input.projectId, assetId: input.assetId, target: input.target, scanMode: input.scanMode });

    // Local demo worker: production should enqueue this job in Redis/BullMQ.
    setTimeout(() => advanceScanJob(job.id, 18, "Fingerprinting", "running"), 700);
    setTimeout(() => advanceScanJob(job.id, 48, "Analyzing headers and cookies", "running"), 1500);
    setTimeout(() => advanceScanJob(job.id, 76, "Correlating findings", "running"), 2300);
    setTimeout(() => advanceScanJob(job.id, 100, "Report anchored", "completed"), 3300);

    return NextResponse.json({ success: true, data: job, requestId }, { status: 202, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId, Location: `/api/scans/${job.id}` } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid scan request.";
    return NextResponse.json({ success: false, error: { code: "INVALID_SCAN_REQUEST", message }, requestId }, { status: 400, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } });
  }
}
