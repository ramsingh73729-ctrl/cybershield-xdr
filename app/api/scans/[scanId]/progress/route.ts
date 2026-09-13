import { getScanJob } from "../../../../../server/scan-store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        const job = getScanJob(scanId);
        if (!job) { controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ code: "SCAN_NOT_FOUND" })}\n\n`)); controller.close(); return; }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(job)}\n\n`));
        if (job.status === 'completed' || job.status === 'failed') controller.close();
      };
      send();
      const timer = setInterval(() => { send(); if (!getScanJob(scanId) || ['completed', 'failed'].includes(getScanJob(scanId)?.status ?? '')) clearInterval(timer); }, 700);
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Request-ID": crypto.randomUUID() } });
}
