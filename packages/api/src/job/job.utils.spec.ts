import { JOB_TIMED_OUT_PREFIX, Job } from './job.constants';
import type { JobHandlerEntry } from './job.discovery';
import { JobProcessor } from './job.processor';
import { JobCancelledError, ensureActive, setActiveCheck } from './job.utils';
import { JobLogService } from './log/job-log.service';

const job: Job = { id: 'a-job', name: 'sync', data: {} };

const entry = (
  handler: (job: Job) => Promise<void>,
  timeout?: number,
): JobHandlerEntry =>
  ({ handler, options: { timeout } }) as unknown as JobHandlerEntry;

const logService = (): JobLogService =>
  ({
    collect: () => ({ close: async () => undefined }),
  }) as unknown as JobLogService;

describe('ensureActive', () => {
  afterEach(() => {
    setActiveCheck(async () => 'active');
  });

  it('lets an active job carry on', async () => {
    setActiveCheck(async () => 'active');

    await expect(ensureActive(job)).resolves.toBeUndefined();
  });

  it.each(['cancelled', 'completed', 'failed', 'expired'])(
    'stops a job the queue now calls %s',
    async (state) => {
      setActiveCheck(async () => state);

      await expect(ensureActive(job)).rejects.toBeInstanceOf(JobCancelledError);
    },
  );

  it('names the state it stopped on, so a log says why', async () => {
    setActiveCheck(async () => 'cancelled');

    await expect(ensureActive(job)).rejects.toThrow(/state: cancelled/);
  });

  it('stops a job whose state the queue cannot name', async () => {
    setActiveCheck(async () => undefined);

    await expect(ensureActive(job)).rejects.toThrow(/state: unknown/);
  });

  it('asks about the job it was given', async () => {
    const check = jest.fn().mockResolvedValue('active');
    setActiveCheck(check);

    await ensureActive(job);

    expect(check).toHaveBeenCalledWith(job);
  });

  describe('characterised, not specified', () => {
    it('lets every job through when nothing installed a state check', async () => {
      let fresh!: { ensureActive: (job: Job) => Promise<void> };

      jest.isolateModules(() => {
        fresh = jest.requireActual('./job.utils');
      });

      await expect(fresh.ensureActive(job)).resolves.toBeUndefined();
    });
  });
});

describe('JobProcessor', () => {
  const processor = new JobProcessor(logService());

  it('runs a handler carrying no timeout to completion', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);

    await processor.process(entry(handler), job);

    expect(handler).toHaveBeenCalledWith(job);
  });

  it('passes a handler failure up untouched', async () => {
    const failure = new Error('sync broke');

    await expect(
      processor.process(
        entry(() => Promise.reject(failure)),
        job,
      ),
    ).rejects.toBe(failure);
  });

  it('lets a handler that beats its timeout finish', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);

    await expect(
      processor.process(entry(handler, 50), job),
    ).resolves.toBeUndefined();
  });

  it('gives up on a handler that outlasts its timeout', async () => {
    const never = new Promise<void>(() => undefined);

    await expect(
      processor.process(
        entry(() => never, 10),
        job,
      ),
    ).rejects.toThrow(new RegExp(JOB_TIMED_OUT_PREFIX));
  });

  it('names the timeout it gave up after', async () => {
    const never = new Promise<void>(() => undefined);

    await expect(
      processor.process(
        entry(() => never, 10),
        job,
      ),
    ).rejects.toThrow(/10ms/);
  });
});
