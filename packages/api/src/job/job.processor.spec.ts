import { JOB_TIMED_OUT_PREFIX, Job } from './job.constants';
import type { JobHandlerEntry } from './job.discovery';
import { JobProcessor } from './job.processor';
import { JobLogService } from './log/job-log.service';

const job = { id: 'a-job' } as unknown as Job;

const entryFor = (
  handler: (job: Job) => Promise<void>,
  timeout: number,
): JobHandlerEntry =>
  ({
    handler,
    options: { timeout },
  }) as unknown as JobHandlerEntry;

const logService = (
  close: () => Promise<void> = async () => undefined,
): JobLogService =>
  ({ collect: () => ({ close }) }) as unknown as JobLogService;

const after = (ms: number, then: () => void = () => undefined): Promise<void> =>
  new Promise((resolve) => setTimeout(() => resolve(then()), ms));

const rejectingAfter = (ms: number, message: string): Promise<void> =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));

describe('JobProcessor', () => {
  const processor = new JobProcessor(logService());

  describe('a handler that names no timeout', () => {
    it('runs to completion however long it takes', async () => {
      await expect(
        processor.process(
          entryFor(() => after(30), 0),
          job,
        ),
      ).resolves.toBeUndefined();
    });

    it('hands the job to the handler', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);

      await processor.process(entryFor(handler, 0), job);

      expect(handler).toHaveBeenCalledWith(job);
    });

    it('surfaces the failure the handler raised', async () => {
      await expect(
        processor.process(
          entryFor(() => Promise.reject(new Error('handler blew up')), 0),
          job,
        ),
      ).rejects.toThrow('handler blew up');
    });
  });

  describe('a handler that names a timeout', () => {
    it('gives up on a handler that outlasts it', async () => {
      await expect(
        processor.process(
          entryFor(() => after(200), 20),
          job,
        ),
      ).rejects.toThrow(JOB_TIMED_OUT_PREFIX);
    });

    it('says which limit was hit, so a log can name it', async () => {
      await expect(
        processor.process(
          entryFor(() => after(200), 20),
          job,
        ),
      ).rejects.toThrow('20ms');
    });

    it('lets a handler that finishes in time through', async () => {
      await expect(
        processor.process(
          entryFor(() => after(5), 200),
          job,
        ),
      ).resolves.toBeUndefined();
    });

    it('surfaces the handler failure rather than a timeout when it fails first', async () => {
      await expect(
        processor.process(
          entryFor(() => rejectingAfter(5, 'handler blew up'), 200),
          job,
        ),
      ).rejects.toThrow('handler blew up');
    });

    it('clears its timer once the handler wins, so nothing holds the process open', async () => {
      const clear = jest.spyOn(global, 'clearTimeout');

      await processor.process(
        entryFor(() => after(5), 200),
        job,
      );

      expect(clear).toHaveBeenCalled();
      clear.mockRestore();
    });

    it('clears its timer after a timeout too', async () => {
      const clear = jest.spyOn(global, 'clearTimeout');

      await processor
        .process(
          entryFor(() => after(200), 20),
          job,
        )
        .catch(() => undefined);

      expect(clear).toHaveBeenCalled();
      clear.mockRestore();
    });
  });
});
