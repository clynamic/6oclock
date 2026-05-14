import { SetMetadata } from '@nestjs/common';

import { JOB_HANDLER_METADATA, JobQueue } from './job.constants';

export interface JobHandlerOptions {
  id: string;
  queue: JobQueue;
  pattern: string;
  timeout?: number;
  enabled?: boolean;
}

export const JobHandler = (options: JobHandlerOptions): MethodDecorator =>
  SetMetadata(JOB_HANDLER_METADATA, {
    ...options,
    enabled: options.enabled ?? true,
  });
