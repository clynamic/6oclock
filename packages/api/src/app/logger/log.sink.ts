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

export enum LogLevel {
  /** Diagnostics. Unbounded rate, development only. */
  debug = 'debug',

  /** Session timeline. */
  info = 'info',

  /** Abnormal but handled. The world misbehaved, not us. */
  warn = 'warn',

  /** Our code is wrong. */
  error = 'error',
}

export const LOG_LEVELS: Record<number, LogLevel> = {
  20: LogLevel.debug,
  30: LogLevel.info,
  40: LogLevel.warn,
  50: LogLevel.error,
};
