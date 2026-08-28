import { Writable } from 'stream';

export type LogRecord = Record<string, unknown> & {
  time?: number;
  level?: number;
  context?: string;
};

export type LogSink = (record: LogRecord) => void;

const sinks: LogSink[] = [];

export const addLogSink = (sink: LogSink): void => {
  sinks.push(sink);
};

const readRecord = (chunk: unknown): LogRecord | undefined => {
  try {
    return JSON.parse(String(chunk)) as LogRecord;
  } catch {
    return undefined;
  }
};

export const logSinkStream = (): Writable =>
  new Writable({
    write(chunk, _encoding, callback) {
      if (sinks.length) {
        const record = readRecord(chunk);
        if (record) for (const sink of sinks) sink(record);
      }

      callback();
    },
  });

export const LOG_LEVELS: Record<number, string> = {
  10: 'trace',
  20: 'debug',
  30: 'log',
  40: 'warn',
  50: 'error',
  60: 'fatal',
};
