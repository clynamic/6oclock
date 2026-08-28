import { CacheModule } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostRating } from 'src/api/e621';
import { CacheManager } from 'src/app/browser.module';
import { AuthService } from 'src/auth/auth.service';
import { PostEntity } from 'src/post/post.entity';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';

import { UserEntity } from '../user.entity';
import { UserHeadService } from './user-head.service';

const postsMany = jest.fn();
const usersMany = jest.fn();

jest.mock('src/api', () => ({
  postsMany: (...args: unknown[]) => postsMany(...args),
  usersMany: (...args: unknown[]) => usersMany(...args),
  convertKeysToCamelCase: (value: unknown) => value,
}));

const user = (partial: Partial<UserEntity> = {}): UserEntity =>
  new UserEntity({
    id: 500,
    name: 'someone',
    levelString: 'Janitor',
    avatarId: 900,
    hasCroppedAvatar: false,
    ...partial,
  });

const upstreamPost = (id: number): unknown => ({
  id,
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
  files: {
    original: { url: 'https://static1.e621.net/data/ab/cd/abcd.jpg' },
    preview: { jpg: 'https://static1.e621.net/data/preview/ab/cd/abcd.jpg' },
    sample: { jpg: null },
    meta: { has_sample: false, ext: 'jpg' },
  },
  rating: PostRating.s,
  stats: { fav_count: 0, score: { total: 0 } },
  description: '',
  uploader_id: 1,
  approver_id: null,
  tags: {},
  flags: { deleted: false },
});

const avatar = (partial: Partial<PostEntity> = {}): PostEntity =>
  ({
    id: 900,
    preview: 'https://static1.e621.net/data/preview/ab/cd/abcd.jpg',
    rating: PostRating.s,
    deleted: false,
    ...partial,
  }) as PostEntity;

describe('UserHeadService', () => {
  let service: UserHeadService;
  let userFind: jest.Mock;
  let postFind: jest.Mock;
  let postSave: jest.Mock;

  beforeEach(async () => {
    postsMany.mockReset();
    usersMany.mockReset();
    userFind = jest.fn().mockResolvedValue([]);
    postFind = jest.fn().mockResolvedValue([]);
    postSave = jest.fn().mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        CacheManager,
        UserHeadService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { find: userFind, save: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: getRepositoryToken(PostEntity),
          useValue: { find: postFind, save: postSave },
        },
        {
          provide: AuthService,
          useValue: { getServerAxiosConfig: () => ({}) },
        },
      ],
    }).compile();

    moduleRef.get(CacheManager);
    service = moduleRef.get(UserHeadService);
    await CacheManager.getInstance().clear();
  });

  describe('what it returns', () => {
    it('gives back a head for the user it found', async () => {
      userFind.mockResolvedValue([user()]);
      postFind.mockResolvedValue([avatar()]);

      expect(await service.get(500)).toMatchObject({
        id: 500,
        name: 'someone',
        level: 'Janitor',
      });
    });

    it('refuses a single user it cannot find', async () => {
      await expect(service.get(500)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('gives back an empty list rather than refusing, when asked for many', async () => {
      expect(await service.get([500, 501])).toEqual([]);
    });

    it('routes the avatar through the proxy rather than upstream', async () => {
      userFind.mockResolvedValue([user()]);
      postFind.mockResolvedValue([avatar()]);

      const head = await service.get(500);

      expect(head.avatar).toBe('/api/proxy/data/preview/ab/cd/abcd.jpg');
    });

    it('leaves the avatar out for a user carrying none', async () => {
      userFind.mockResolvedValue([user({ avatarId: null })]);

      expect((await service.get(500)).avatar).toBeUndefined();
    });

    it('points at the cropped avatar for a user who has one', async () => {
      userFind.mockResolvedValue([user({ hasCroppedAvatar: true })]);
      postFind.mockResolvedValue([avatar()]);

      expect((await service.get(500)).avatar).toBe(
        '/api/proxy/data/avatars/500.jpg?t=900',
      );
    });

    it('falls back to the preview when the media url carries no data segment', async () => {
      userFind.mockResolvedValue([user({ hasCroppedAvatar: true })]);
      postFind.mockResolvedValue([
        avatar({ preview: 'https://example.com/elsewhere/abcd.jpg' }),
      ]);

      expect((await service.get(500)).avatar).toBe(
        '/api/proxy/elsewhere/abcd.jpg',
      );
    });
  });

  describe('safe mode', () => {
    it('asks the database for safe avatars only', async () => {
      userFind.mockResolvedValue([user()]);

      await service.get(500, { safeMode: true });

      const where = (postFind.mock.calls[0]![0] as FindManyOptions<PostEntity>)
        .where as FindOptionsWhere<PostEntity>;

      expect(where.rating).toBe(PostRating.s);
    });

    it('asks for any rating when safe mode is off', async () => {
      userFind.mockResolvedValue([user()]);

      await service.get(500);

      const where = (postFind.mock.calls[0]![0] as FindManyOptions<PostEntity>)
        .where as FindOptionsWhere<PostEntity>;

      expect(where).not.toHaveProperty('rating');
    });

    it('drops an explicit avatar it had to fetch, which the database never filtered', async () => {
      userFind.mockResolvedValue([user()]);
      postFind.mockResolvedValue([]);
      postsMany.mockResolvedValue([upstreamPost(900)]);
      postSave.mockResolvedValue([avatar({ rating: PostRating.e })]);

      const head = await service.get(500, {
        safeMode: true,
        fetchMissing: true,
      });

      expect(head.avatar).toBeUndefined();
    });

    it('keeps a safe avatar it had to fetch', async () => {
      userFind.mockResolvedValue([user()]);
      postFind.mockResolvedValue([]);
      postsMany.mockResolvedValue([upstreamPost(900)]);
      postSave.mockResolvedValue([avatar({ rating: PostRating.s })]);

      const head = await service.get(500, {
        safeMode: true,
        fetchMissing: true,
      });

      expect(head.avatar).toBe('/api/proxy/data/preview/ab/cd/abcd.jpg');
    });

    it('drops a deleted avatar it had to fetch', async () => {
      userFind.mockResolvedValue([user()]);
      postFind.mockResolvedValue([]);
      postsMany.mockResolvedValue([upstreamPost(900)]);
      postSave.mockResolvedValue([avatar({ deleted: true })]);

      expect(
        (await service.get(500, { fetchMissing: true })).avatar,
      ).toBeUndefined();
    });

    it('drops an avatar it had to fetch that carries no preview', async () => {
      userFind.mockResolvedValue([user()]);
      postFind.mockResolvedValue([]);
      postsMany.mockResolvedValue([upstreamPost(900)]);
      postSave.mockResolvedValue([avatar({ preview: null })]);

      expect(
        (await service.get(500, { fetchMissing: true })).avatar,
      ).toBeUndefined();
    });
  });

  describe('fetching what it is missing', () => {
    it('leaves upstream alone when it was not asked to fetch', async () => {
      await service.get([500]);

      expect(usersMany).not.toHaveBeenCalled();
      expect(postsMany).not.toHaveBeenCalled();
    });

    it('asks upstream only for the users it lacks', async () => {
      userFind.mockResolvedValue([user({ id: 500, avatarId: null })]);
      usersMany.mockResolvedValue([]);

      await service.get([500, 501], { fetchMissing: true });

      expect(usersMany).toHaveBeenCalledWith([501], expect.anything());
    });
  });
});
