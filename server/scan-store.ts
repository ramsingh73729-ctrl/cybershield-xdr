import { createHash } from "node:crypto";
import type { PassiveFinding, PassiveScanResult } from "./passive-scan";

export type ScanJob = {
  id: string;
  projectId: string;
  assetId: string;
  target: string;
  scanMode: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  createdAt: string;
  updatedAt: string;
  reportHash?: string;
  finalUrl?: string;
  httpStatus?: number;
  checkedAt?: string;
  coverage?: 'passive-perimeter';
  checksRun?: number;
  findings: PassiveFinding[];
};

const jobs = new Map<string, ScanJob>();

export function listScanJobs() { return Array.from(jobs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
export function getScanJob(id: string) { return jobs.get(id); }

export function createScanJob(input: Pick<ScanJob, 'projectId' | 'assetId' | 'target' | 'scanMode'>) {
  const now = new Date().toISOString();
  const job: ScanJob = { ...input, id: crypto.randomUUID(), status: 'queued', progress: 0, currentStep: 'Queued', createdAt: now, updatedAt: now, findings: [] };
  jobs.set(job.id, job);
  return job;
}

export function advanceScanJob(id: string, progress: number, currentStep: string, status: ScanJob['status'] = 'running') {
  const job = jobs.get(id);
  if (!job) return undefined;
  const updated = { ...job, progress, currentStep, status, updatedAt: new Date().toISOString() };
  jobs.set(id, updated);
  return updated;
}

export function attachPassiveResult(id: string, result: PassiveScanResult) {
  const job = jobs.get(id);
  if (!job) return undefined;
  const reportHash = createHash("sha256").update(JSON.stringify({ jobId: id, ...result })).digest("hex");
  const updated = { ...job, ...result, reportHash: `0x${reportHash}`, updatedAt: new Date().toISOString() };
  jobs.set(id, updated);
  return updated;
}
