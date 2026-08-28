export interface JobLogRecord {
  at: Date;
  level: string;
  context?: string;
  record: Record<string, unknown>;
}

export type JobLogCollector = (record: JobLogRecord) => void;

const collectors = new Map<string, JobLogCollector>();

export const openJobLog = (jobId: string, collector: JobLogCollector): void => {
  collectors.set(jobId, collector);
};

export const closeJobLog = (jobId: string): void => {
  collectors.delete(jobId);
};

export const writeJobLog = (jobId: string, record: JobLogRecord): void => {
  collectors.get(jobId)?.(record);
};
