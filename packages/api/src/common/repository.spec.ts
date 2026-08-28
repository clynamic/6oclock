import { In, MoreThanOrEqual, ObjectLiteral, Repository } from 'typeorm';

import { constructCountUpdated, constructFirstFromId } from './repository';

interface Record {
  id: number;
  updatedAt: Date;
}

interface Stamped {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

const at = (iso: string): Date => new Date(iso);

const holding = <T extends ObjectLiteral>(
  rows: T[],
): { repository: Repository<T>; findBy: jest.Mock; findOne: jest.Mock } => {
  const findBy = jest.fn().mockResolvedValue(rows);
  const findOne = jest.fn().mockResolvedValue(rows[0] ?? null);
  return {
    repository: { findBy, findOne } as unknown as Repository<T>,
    findBy,
    findOne,
  };
};

describe('constructCountUpdated', () => {
  it('counts a record whose stored date no longer matches', async () => {
    const { repository } = holding<Record>([
      { id: 1, updatedAt: at('2024-01-01T00:00:00Z') },
    ]);

    await expect(
      constructCountUpdated(repository)([
        { id: 1, updatedAt: at('2024-06-01T00:00:00Z') },
      ]),
    ).resolves.toBe(1);
  });

  it('counts nothing when the stored date still matches', async () => {
    const { repository } = holding<Record>([
      { id: 1, updatedAt: at('2024-01-01T00:00:00Z') },
    ]);

    await expect(
      constructCountUpdated(repository)([
        { id: 1, updatedAt: at('2024-01-01T00:00:00Z') },
      ]),
    ).resolves.toBe(0);
  });

  it('counts a record it has never stored as new rather than updated', async () => {
    const { repository } = holding<Record>([]);

    await expect(
      constructCountUpdated(repository)([
        { id: 7, updatedAt: at('2024-06-01T00:00:00Z') },
      ]),
    ).resolves.toBe(0);
  });

  it('counts each changed record once across a mixed batch', async () => {
    const { repository } = holding<Record>([
      { id: 1, updatedAt: at('2024-01-01T00:00:00Z') },
      { id: 2, updatedAt: at('2024-01-01T00:00:00Z') },
      { id: 3, updatedAt: at('2024-01-01T00:00:00Z') },
    ]);

    await expect(
      constructCountUpdated(repository)([
        { id: 1, updatedAt: at('2024-06-01T00:00:00Z') },
        { id: 2, updatedAt: at('2024-01-01T00:00:00Z') },
        { id: 3, updatedAt: at('2024-07-01T00:00:00Z') },
        { id: 4, updatedAt: at('2024-08-01T00:00:00Z') },
      ]),
    ).resolves.toBe(2);
  });

  it('asks the database only for the ids it was handed', async () => {
    const { repository, findBy } = holding<Record>([]);

    await constructCountUpdated(repository)([
      { id: 4, updatedAt: at('2024-06-01T00:00:00Z') },
      { id: 9, updatedAt: at('2024-06-01T00:00:00Z') },
    ]);

    expect(findBy).toHaveBeenCalledWith({ id: In([4, 9]) });
  });

  it('reads a difference under a second, since it compares to the millisecond', async () => {
    const { repository } = holding<Record>([
      { id: 1, updatedAt: at('2024-01-01T00:00:00.000Z') },
    ]);

    await expect(
      constructCountUpdated(repository)([
        { id: 1, updatedAt: at('2024-01-01T00:00:00.500Z') },
      ]),
    ).resolves.toBe(1);
  });

  describe('characterised, not specified', () => {
    it('compares a record carrying both dates by creation, so an edit goes uncounted', async () => {
      const { repository } = holding<Stamped>([
        {
          id: 1,
          createdAt: at('2024-01-01T00:00:00Z'),
          updatedAt: at('2024-01-01T00:00:00Z'),
        },
      ]);

      await expect(
        constructCountUpdated(repository)([
          {
            id: 1,
            createdAt: at('2024-01-01T00:00:00Z'),
            updatedAt: at('2024-06-01T00:00:00Z'),
          },
        ]),
      ).resolves.toBe(0);
    });
  });
});

describe('constructFirstFromId', () => {
  it('asks for the lowest id at or above the one given', async () => {
    const { repository, findOne } = holding<Record>([
      { id: 12, updatedAt: at('2024-01-01T00:00:00Z') },
    ]);

    await constructFirstFromId(repository)(10);

    expect(findOne).toHaveBeenCalledWith({
      where: { id: MoreThanOrEqual(10) },
      order: { id: 'ASC' },
    });
  });
});
