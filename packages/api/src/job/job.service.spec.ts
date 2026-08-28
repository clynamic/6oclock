import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaginationParams } from 'src/common';

import { JOB_TIMED_OUT_PREFIX } from './job.constants';
import { JobDiscoveryService } from './job.discovery';
import { JobService } from './job.service';
import { PgBossJobEntity } from './pgboss-job.entity';

jest.mock('./job.discovery', () => ({
  JobDiscoveryService: class {
    getEntries(): unknown[] {
      return [];
    }
  },
}));

const at = (iso: string): Date => new Date(iso);

const row = (partial: Partial<PgBossJobEntity>): PgBossJobEntity =>
  ({
    id: 'a-job',
    name: 'default',
    state: 'completed',
    data: {},
    output: null,
    startAfter: null,
    startedOn: null,
    completedOn: null,
    ...partial,
  }) as unknown as PgBossJobEntity;

describe('JobService', () => {
  let service: JobService;
  let find: jest.Mock;

  beforeEach(async () => {
    find = jest.fn().mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: getRepositoryToken(PgBossJobEntity),
          useValue: { find },
        },
        {
          provide: JobDiscoveryService,
          useValue: { getEntries: () => [] },
        },
      ],
    }).compile();

    service = moduleRef.get(JobService);
  });

  describe('the state it reports', () => {
    it.each([
      ['active', 'active'],
      ['created', 'waiting'],
      ['retry', 'delayed'],
      ['completed', 'completed'],
      ['failed', 'failed'],
    ])('reports a queue state of %s as %s', async (queueState, reported) => {
      find.mockResolvedValue([row({ state: queueState })]);

      const [job] = await service.list();

      expect(job!.state).toBe(reported);
    });

    it('treats a queue state it does not recognise as a failure', async () => {
      find.mockResolvedValue([row({ state: 'something-new' })]);

      const [job] = await service.list();

      expect(job!.state).toBe('failed');
    });

    it('separates a timeout from an ordinary failure by its reason', async () => {
      find.mockResolvedValue([
        row({
          state: 'failed',
          output: { message: `${JOB_TIMED_OUT_PREFIX} 5000ms` },
        }),
      ]);

      const [job] = await service.list();

      expect(job!.state).toBe('timedOut');
    });

    it('reports a failure carrying an unrelated reason as a failure', async () => {
      find.mockResolvedValue([
        row({ state: 'failed', output: { message: 'connection reset' } }),
      ]);

      const [job] = await service.list();

      expect(job!.state).toBe('failed');
    });

    it('serialises an output carrying no message into the reason', async () => {
      find.mockResolvedValue([
        row({ state: 'failed', output: { code: 500 } as never }),
      ]);

      const [job] = await service.list();

      expect(job!.failedReason).toBe('{"code":500}');
    });

    it('names a job by its handler where the payload carries one', async () => {
      find.mockResolvedValue([
        row({ name: 'tiling', data: { handlerId: 'ticketLifecycle/tickets' } }),
      ]);

      const [job] = await service.list();

      expect(job!.name).toBe('ticketLifecycle/tickets');
      expect(job!.queue).toBe('tiling');
    });

    it('falls back to the queue name where the payload names no handler', async () => {
      find.mockResolvedValue([row({ name: 'tiling', data: {} })]);

      const [job] = await service.list();

      expect(job!.name).toBe('tiling');
    });
  });

  describe('the order it lists them in', () => {
    it('puts running jobs first, then queued, then settled', async () => {
      find.mockResolvedValue([
        row({ id: 'settled', state: 'completed' }),
        row({ id: 'queued', state: 'created' }),
        row({ id: 'running', state: 'active' }),
      ]);

      const jobs = await service.list();

      expect(jobs.map((job) => job.id)).toEqual([
        'running',
        'queued',
        'settled',
      ]);
    });

    it('lists queued jobs by what runs soonest', async () => {
      find.mockResolvedValue([
        row({
          id: 'later',
          state: 'created',
          startAfter: at('2024-01-02T00:00:00Z'),
        }),
        row({
          id: 'sooner',
          state: 'created',
          startAfter: at('2024-01-01T00:00:00Z'),
        }),
      ]);

      const jobs = await service.list();

      expect(jobs.map((job) => job.id)).toEqual(['sooner', 'later']);
    });

    it('lists settled jobs by what finished most recently', async () => {
      find.mockResolvedValue([
        row({
          id: 'older',
          state: 'completed',
          completedOn: at('2024-01-01T00:00:00Z'),
        }),
        row({
          id: 'newer',
          state: 'completed',
          completedOn: at('2024-01-02T00:00:00Z'),
        }),
      ]);

      const jobs = await service.list();

      expect(jobs.map((job) => job.id)).toEqual(['newer', 'older']);
    });

    it('falls back to the start time for a settled job that never finished', async () => {
      find.mockResolvedValue([
        row({
          id: 'started-later',
          state: 'failed',
          startedOn: at('2024-01-02T00:00:00Z'),
        }),
        row({
          id: 'finished-earlier',
          state: 'completed',
          completedOn: at('2024-01-01T00:00:00Z'),
        }),
      ]);

      const jobs = await service.list();

      expect(jobs.map((job) => job.id)).toEqual([
        'started-later',
        'finished-earlier',
      ]);
    });

    it('groups a timeout with the other settled jobs, not with the queued ones', async () => {
      find.mockResolvedValue([
        row({
          id: 'timed-out',
          state: 'failed',
          output: { message: `${JOB_TIMED_OUT_PREFIX} 1ms` },
        }),
        row({ id: 'queued', state: 'created' }),
      ]);

      const jobs = await service.list();

      expect(jobs.map((job) => job.id)).toEqual(['queued', 'timed-out']);
    });
  });

  describe('the page it returns', () => {
    const many = (count: number): PgBossJobEntity[] =>
      Array.from({ length: count }, (_, index) =>
        row({
          id: `job-${index}`,
          state: 'completed',
          completedOn: at(
            `2024-01-${String(count - index).padStart(2, '0')}T00:00:00Z`,
          ),
        }),
      );

    it('returns the default page size when no page is asked for', async () => {
      find.mockResolvedValue(many(25));

      expect(await service.list()).toHaveLength(20);
    });

    it('offsets by whole pages when one is asked for', async () => {
      find.mockResolvedValue(many(25));

      const jobs = await service.list(
        new PaginationParams({ page: 2, limit: 10 }),
      );

      expect(jobs.map((job) => job.id)).toEqual([
        'job-10',
        'job-11',
        'job-12',
        'job-13',
        'job-14',
        'job-15',
        'job-16',
        'job-17',
        'job-18',
        'job-19',
      ]);
    });

    it('reads only the queues the application declares', async () => {
      await service.list();

      const where = find.mock.calls[0]![0] as {
        where: { name: { value: string[] } };
      };

      expect(where.where.name.value).toEqual(['default', 'tiling']);
    });
  });
});
