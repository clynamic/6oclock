import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheManager } from 'src/app/browser.module';

import { TicketLifecycleEntity } from './ticket-lifecycle.entity';
import {
  TicketLifeData,
  TicketLifecycleService,
} from './ticket-lifecycle.service';

const at = (iso: string): Date => new Date(iso);

const life = (partial?: Partial<TicketLifeData>): TicketLifeData => ({
  ticketId: 1,
  createdAt: at('2024-03-01T00:00:00Z'),
  creatorId: 500,
  claimedAt: null,
  claimantId: null,
  partialAt: null,
  resolvedAt: null,
  handlerId: null,
  ...partial,
});

type BuilderCalls = Record<string, unknown[][]>;

describe('TicketLifecycleService', () => {
  let service: TicketLifecycleService;
  let calls: BuilderCalls;
  let createQueryBuilder: jest.Mock;
  let clear: jest.Mock;

  beforeEach(async () => {
    calls = {};
    const record =
      (name: string) =>
      (...args: unknown[]) => {
        (calls[name] ??= []).push(args);
        return builder;
      };

    const builder = {
      insert: record('insert'),
      into: record('into'),
      values: record('values'),
      orUpdate: record('orUpdate'),
      execute: record('execute'),
    };

    createQueryBuilder = jest.fn().mockReturnValue(builder);
    clear = jest.fn().mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        TicketLifecycleService,
        {
          provide: getRepositoryToken(TicketLifecycleEntity),
          useValue: { createQueryBuilder, clear },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(TicketLifecycleService);
  });

  const conflictColumns = (): string[] => calls['orUpdate']![0]![1] as string[];
  const refreshedColumns = (): string[] =>
    calls['orUpdate']![0]![0] as string[];

  it('runs the write rather than only building it', async () => {
    await service.upsertLives([life()]);

    expect(calls['execute']).toHaveLength(1);
  });

  it('touches the database not at all for an empty batch', async () => {
    await service.upsertLives([]);

    expect(createQueryBuilder).not.toHaveBeenCalled();
  });

  it('writes the lives it was handed', async () => {
    const batch = [life({ ticketId: 1 }), life({ ticketId: 2 })];

    await service.upsertLives(batch);

    expect(calls['values']![0]![0]).toEqual(batch);
  });

  it('treats one ticket as one life, so a resync overwrites rather than duplicates', async () => {
    await service.upsertLives([life()]);

    expect(conflictColumns()).toEqual(['ticket_id']);
  });

  it('refreshes every fact a resync can have changed', async () => {
    await service.upsertLives([life()]);

    expect(refreshedColumns()).toEqual([
      'created_at',
      'creator_id',
      'claimed_at',
      'claimant_id',
      'partial_at',
      'resolved_at',
      'handler_id',
      'updated_at',
    ]);
  });

  it('leaves no field it writes out of the refresh, so nothing goes stale', async () => {
    await service.upsertLives([life()]);

    const written = Object.keys(life()).map((key) =>
      key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
    );
    const refreshed = new Set([...refreshedColumns(), ...conflictColumns()]);

    for (const column of written) {
      expect(refreshed).toContain(column);
    }
  });

  it('empties the table when asked to wipe', async () => {
    await service.wipe();

    expect(clear).toHaveBeenCalled();
  });
});
