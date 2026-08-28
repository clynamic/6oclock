import { FindManyOptions, Repository } from 'typeorm';

import { NotableUserEntity } from '../notable-user.entity';
import { UserEntity } from '../user.entity';
import { UserSyncService } from './user-sync.service';

type BuilderCalls = Record<string, unknown[][]>;

const createBuilder = (
  rows: { id: number; avatar_id: number }[],
): { builder: unknown; calls: BuilderCalls } => {
  const calls: BuilderCalls = {};
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      (calls[name] ??= []).push(args);
      return builder;
    };

  const builder = {
    innerJoin: record('innerJoin'),
    andWhere: record('andWhere'),
    select: record('select'),
    getRawMany: jest.fn().mockResolvedValue(rows),
  };

  return { builder, calls };
};

const clauses = (calls: BuilderCalls): string[] =>
  (calls['andWhere'] ?? []).map((args) => String(args[0]));

const freshnessCutoff = (find: jest.Mock): Date => {
  const options = find.mock.calls[0]![0] as FindManyOptions<UserEntity>;
  const label = (options.where as { label: { refreshedAt: unknown } }).label;
  return (label.refreshedAt as { value: Date }).value;
};

describe('UserSyncService', () => {
  const serviceOver = (
    userRepository: Partial<Repository<UserEntity>>,
    notableRepository: Partial<Repository<NotableUserEntity>> = {},
  ): UserSyncService =>
    new UserSyncService(
      { save: jest.fn(), ...userRepository } as Repository<UserEntity>,
      {
        save: jest.fn(),
        remove: jest.fn(),
        ...notableRepository,
      } as unknown as Repository<NotableUserEntity>,
    );

  describe('findOutdated', () => {
    const overFresh = (
      fresh: number[],
    ): { service: UserSyncService; find: jest.Mock } => {
      const find = jest.fn().mockResolvedValue(fresh.map((id) => ({ id })));
      return { service: serviceOver({ find }), find };
    };

    it('gives back the ids no fresh label covers', async () => {
      const { service } = overFresh([2]);

      await expect(service.findOutdated([1, 2, 3])).resolves.toEqual([1, 3]);
    });

    it('gives back nothing when every id is still fresh', async () => {
      const { service } = overFresh([1, 2, 3]);

      await expect(service.findOutdated([1, 2, 3])).resolves.toEqual([]);
    });

    it('gives back every id when none of them has a fresh label', async () => {
      const { service } = overFresh([]);

      await expect(service.findOutdated([1, 2, 3])).resolves.toEqual([1, 2, 3]);
    });

    it('keeps the order it was handed', async () => {
      const { service } = overFresh([7]);

      await expect(service.findOutdated([9, 7, 3, 1])).resolves.toEqual([
        9, 3, 1,
      ]);
    });

    it('measures freshness backwards from now by the staleness given', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-06-01T12:00:00Z'));
      const { service, find } = overFresh([]);

      await service.findOutdated([1], 5 * 60 * 1000);

      expect(freshnessCutoff(find)).toEqual(new Date('2024-06-01T11:55:00Z'));
      jest.useRealTimers();
    });

    it('treats an hour as the staleness when nobody says otherwise', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-06-01T12:00:00Z'));
      const { service, find } = overFresh([]);

      await service.findOutdated([1]);

      expect(freshnessCutoff(find)).toEqual(new Date('2024-06-01T11:00:00Z'));
      jest.useRealTimers();
    });
  });

  describe('listNotableAvatars', () => {
    const overRows = (
      rows: { id: number; avatar_id: number }[],
    ): { service: UserSyncService; calls: BuilderCalls } => {
      const { builder, calls } = createBuilder(rows);
      return {
        service: serviceOver({ createQueryBuilder: () => builder as never }),
        calls,
      };
    };

    it('gives back avatar ids rather than the users wearing them', async () => {
      const { service } = overRows([
        { id: 1, avatar_id: 900 },
        { id: 2, avatar_id: 901 },
      ]);

      await expect(service.listNotableAvatars()).resolves.toEqual([900, 901]);
    });

    it('refuses users who have no avatar at all', async () => {
      const { service, calls } = overRows([]);

      await service.listNotableAvatars();

      expect(clauses(calls)).toContain('user.avatar_id IS NOT NULL');
    });

    it('narrows to the notable types asked for', async () => {
      const { service, calls } = overRows([]);

      await service.listNotableAvatars({ type: ['uploader'] } as never);

      expect(calls['andWhere']).toContainEqual([
        'notable_user.type IN (:...types)',
        { types: ['uploader'] },
      ]);
    });

    it('leaves the type open when an empty list is asked for', async () => {
      const { service, calls } = overRows([]);

      await service.listNotableAvatars({ type: [] } as never);

      expect(clauses(calls)).not.toContain('notable_user.type IN (:...types)');
    });

    it('narrows to notables touched since the cutoff given', async () => {
      const { service, calls } = overRows([]);
      const newerThan = new Date('2024-06-01T00:00:00Z');

      await service.listNotableAvatars({ newerThan } as never);

      expect(calls['andWhere']).toContainEqual([
        'notable_user.updated_at >= :updatedAt',
        { updatedAt: newerThan },
      ]);
    });

    it('asks for every notable avatar when the query says nothing', async () => {
      const { service, calls } = overRows([]);

      await service.listNotableAvatars();

      expect(clauses(calls)).toEqual(['user.avatar_id IS NOT NULL']);
    });
  });

  describe('listNotable', () => {
    it('leaves every filter open when the query says nothing', async () => {
      const find = jest.fn().mockResolvedValue([]);
      const service = serviceOver({}, { find });

      await service.listNotable();

      expect(find).toHaveBeenCalledWith({
        where: { id: undefined, type: undefined, updatedAt: undefined },
      });
    });

    it('narrows to the notable types asked for', async () => {
      const find = jest.fn().mockResolvedValue([]);
      const service = serviceOver({}, { find });

      await service.listNotable({ type: ['uploader'] } as never);

      const where = find.mock.calls[0]![0].where as {
        type: { type: string; value: string[] };
      };

      expect(where.type.type).toBe('in');
      expect(where.type.value).toEqual(['uploader']);
    });

    it('asks for notables touched at or after the cutoff', async () => {
      const find = jest.fn().mockResolvedValue([]);
      const service = serviceOver({}, { find });
      const newerThan = new Date('2024-06-01T00:00:00Z');

      await service.listNotable({ newerThan } as never);

      const where = find.mock.calls[0]![0].where as {
        updatedAt: { type: string; value: Date };
      };

      expect(where.updatedAt.type).toBe('moreThanOrEqual');
      expect(where.updatedAt.value).toEqual(newerThan);
    });
  });
});
