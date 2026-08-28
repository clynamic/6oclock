import {
  LOG_LEVELS,
  LogLevel,
  LogRecord,
  addLogSink,
} from 'src/app/logger/log.sink';

import { writeJobLog } from './job-log.sink';

export const collectJobLogs = (): void => {
  addLogSink((line: LogRecord) => {
    const { time, level, context, job, ...record } = line as LogRecord & {
      job?: { id?: string };
    };

    if (!job?.id) return;

    writeJobLog(job.id, {
      at: time ? new Date(time) : new Date(),
      level: LOG_LEVELS[level ?? 30] ?? LogLevel.info,
      context,
      record,
    });
  });
};
