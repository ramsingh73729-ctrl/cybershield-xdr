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
};

const jobs = new Map<string, ScanJob>();

export function listScanJobs() { return Array.from(jobs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
export function getScanJob(id: string) { return jobs.get(id); }

export function createScanJob(input: Omit<ScanJob, 'id' | 'status' | 'progress' | 'currentStep' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const job: ScanJob = { ...input, id: crypto.randomUUID(), status: 'queued', progress: 0, currentStep: 'Queued', createdAt: now, updatedAt: now };
  jobs.set(job.id, job);
  return job;
}

export function advanceScanJob(id: string, progress: number, currentStep: string, status: ScanJob['status'] = 'running') {
  const job = jobs.get(id);
  if (!job) return undefined;
  const updated = { ...job, progress, currentStep, status, updatedAt: new Date().toISOString(), ...(status === 'completed' ? { reportHash: `0x${crypto.randomUUID().replaceAll('-', '')}` } : {}) };
  jobs.set(id, updated);
  return updated;
}
