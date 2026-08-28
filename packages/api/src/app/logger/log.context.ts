import { AsyncLocalStorage } from 'async_hooks';

export type LogFields = Record<string, unknown>;

const storage = new AsyncLocalStorage<LogFields>();

export const withLogFields = <T>(fields: LogFields, run: () => T): T =>
  storage.run({ ...storage.getStore(), ...fields }, run);

export const getLogFields = (): LogFields => storage.getStore() ?? {};
