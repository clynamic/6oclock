import { PostEntity } from 'src/post/post.entity';
import { In, Repository } from 'typeorm';

import { AvatarSyncService } from './avatar-sync.service';

const serviceOver = (
  stored: number[],
): { service: AvatarSyncService; find: jest.Mock } => {
  const find = jest.fn().mockResolvedValue(stored.map((id) => ({ id })));
  return {
    service: new AvatarSyncService({
      find,
    } as unknown as Repository<PostEntity>),
    find,
  };
};

describe('AvatarSyncService', () => {
  describe('findNotStored', () => {
    it('gives back the ids the database does not hold', async () => {
      const { service } = serviceOver([2]);

      await expect(service.findNotStored([1, 2, 3])).resolves.toEqual([1, 3]);
    });

    it('gives back nothing when every id is already held', async () => {
      const { service } = serviceOver([1, 2, 3]);

      await expect(service.findNotStored([1, 2, 3])).resolves.toEqual([]);
    });

    it('gives back every id when the database holds none of them', async () => {
      const { service } = serviceOver([]);

      await expect(service.findNotStored([1, 2, 3])).resolves.toEqual([
        1, 2, 3,
      ]);
    });

    it('keeps the order it was handed', async () => {
      const { service } = serviceOver([7]);

      await expect(service.findNotStored([9, 7, 3, 1])).resolves.toEqual([
        9, 3, 1,
      ]);
    });

    it('asks the database only for the ids it was handed, and only for ids', async () => {
      const { service, find } = serviceOver([]);

      await service.findNotStored([4, 9]);

      expect(find).toHaveBeenCalledWith({
        where: { id: In([4, 9]) },
        select: ['id'],
      });
    });

    it('holds nothing back when it was handed nothing', async () => {
      const { service } = serviceOver([]);

      await expect(service.findNotStored([])).resolves.toEqual([]);
    });

    describe('characterised, not specified', () => {
      it('reports a repeated id once per mention rather than folding it', async () => {
        const { service } = serviceOver([]);

        await expect(service.findNotStored([5, 5])).resolves.toEqual([5, 5]);
      });
    });
  });
});
