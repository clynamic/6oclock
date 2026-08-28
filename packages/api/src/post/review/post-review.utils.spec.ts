import { PostEventAction } from 'src/api';

import { PostReviewExit } from './post-review.entity';
import {
  PostReviewEvent,
  PostReviewUpload,
  reconstructReviewEpisodes,
} from './post-review.utils';

const at = (iso: string): Date => new Date(iso);

const upload = (postId: number, iso: string): PostReviewUpload => ({
  postId,
  uploadedAt: at(iso),
});

const event = (
  postId: number,
  action: PostEventAction,
  iso: string,
): PostReviewEvent => ({
  post_id: postId,
  created_at: at(iso),
  action,
});

describe('reconstructReviewEpisodes', () => {
  describe('what opens and closes a spell', () => {
    it('opens a spell at the upload and leaves it open until something ends it', () => {
      const spells = reconstructReviewEpisodes(
        [upload(1, '2024-01-01T00:00:00Z')],
        [],
        new Set(),
      );

      expect(spells).toEqual([
        {
          postId: 1,
          enteredAt: at('2024-01-01T00:00:00Z'),
          exitedAt: null,
          exit: null,
        },
      ]);
    });

    it('closes a spell on an approval and records how it ended', () => {
      const spells = reconstructReviewEpisodes(
        [upload(1, '2024-01-01T00:00:00Z')],
        [event(1, PostEventAction.approved, '2024-01-02T00:00:00Z')],
        new Set(),
      );

      expect(spells).toEqual([
        {
          postId: 1,
          enteredAt: at('2024-01-01T00:00:00Z'),
          exitedAt: at('2024-01-02T00:00:00Z'),
          exit: PostReviewExit.approved,
        },
      ]);
    });

    it('closes a spell on a deletion and records how it ended', () => {
      const [spell] = reconstructReviewEpisodes(
        [upload(1, '2024-01-01T00:00:00Z')],
        [event(1, PostEventAction.deleted, '2024-01-02T00:00:00Z')],
        new Set(),
      );

      expect(spell).toMatchObject({
        exitedAt: at('2024-01-02T00:00:00Z'),
        exit: PostReviewExit.deleted,
      });
    });

    it('keeps the first outcome, since a closed spell is closed', () => {
      const spells = reconstructReviewEpisodes(
        [upload(1, '2024-01-01T00:00:00Z')],
        [
          event(1, PostEventAction.approved, '2024-01-02T00:00:00Z'),
          event(1, PostEventAction.deleted, '2024-01-03T00:00:00Z'),
        ],
        new Set(),
      );

      expect(spells).toHaveLength(1);
      expect(spells[0]).toMatchObject({
        exitedAt: at('2024-01-02T00:00:00Z'),
        exit: PostReviewExit.approved,
      });
    });

    it('leaves a restoration alone, since it does not put a post back in review', () => {
      const spells = reconstructReviewEpisodes(
        [upload(1, '2024-01-01T00:00:00Z')],
        [
          event(1, PostEventAction.deleted, '2024-01-02T00:00:00Z'),
          event(1, PostEventAction.undeleted, '2024-01-05T00:00:00Z'),
        ],
        new Set(),
      );

      expect(spells).toEqual([
        {
          postId: 1,
          enteredAt: at('2024-01-01T00:00:00Z'),
          exitedAt: at('2024-01-02T00:00:00Z'),
          exit: PostReviewExit.deleted,
        },
      ]);
    });

    it('opens a second spell when a post is unapproved back into review', () => {
      const spells = reconstructReviewEpisodes(
        [upload(1, '2024-01-01T00:00:00Z')],
        [
          event(1, PostEventAction.approved, '2024-01-02T00:00:00Z'),
          event(1, PostEventAction.unapproved, '2024-01-05T00:00:00Z'),
          event(1, PostEventAction.approved, '2024-01-07T00:00:00Z'),
        ],
        new Set(),
      );

      expect(spells).toEqual([
        {
          postId: 1,
          enteredAt: at('2024-01-01T00:00:00Z'),
          exitedAt: at('2024-01-02T00:00:00Z'),
          exit: PostReviewExit.approved,
        },
        {
          postId: 1,
          enteredAt: at('2024-01-05T00:00:00Z'),
          exitedAt: at('2024-01-07T00:00:00Z'),
          exit: PostReviewExit.approved,
        },
      ]);
    });

    it('treats an unapproval of a post already in review as nothing', () => {
      const spells = reconstructReviewEpisodes(
        [upload(1, '2024-01-01T00:00:00Z')],
        [event(1, PostEventAction.unapproved, '2024-01-02T00:00:00Z')],
        new Set(),
      );

      expect(spells).toEqual([
        {
          postId: 1,
          enteredAt: at('2024-01-01T00:00:00Z'),
          exitedAt: null,
          exit: null,
        },
      ]);
    });

    it('ignores an outcome for a post that was not in review', () => {
      const spells = reconstructReviewEpisodes(
        [],
        [event(1, PostEventAction.deleted, '2024-01-02T00:00:00Z')],
        new Set(),
      );

      expect(spells).toEqual([]);
    });
  });

  describe('which posts have a spell at all', () => {
    it('gives a post with an outcome and no known entry no spell', () => {
      const spells = reconstructReviewEpisodes(
        [],
        [event(1, PostEventAction.approved, '2024-01-02T00:00:00Z')],
        new Set(),
      );

      expect(spells).toEqual([]);
    });

    it('opens a spell on an unapproval however old the post, the second way an entry is known', () => {
      const spells = reconstructReviewEpisodes(
        [],
        [
          event(1, PostEventAction.approved, '2019-01-02T00:00:00Z'),
          event(1, PostEventAction.unapproved, '2024-01-05T00:00:00Z'),
        ],
        new Set(),
      );

      expect(spells).toEqual([
        {
          postId: 1,
          enteredAt: at('2024-01-05T00:00:00Z'),
          exitedAt: null,
          exit: null,
        },
      ]);
    });

    it('gives a post with a known upload exactly one spell', () => {
      const spells = reconstructReviewEpisodes(
        [upload(1, '2024-01-01T00:00:00Z')],
        [],
        new Set(),
      );

      expect(spells).toHaveLength(1);
    });

    it('opens no spell before the earliest entry it was given', () => {
      const uploads = [
        upload(1, '2024-05-01T00:00:00Z'),
        upload(2, '2024-06-01T00:00:00Z'),
      ];
      const earliest = Math.min(
        ...uploads.map((entry) => entry.uploadedAt.getTime()),
      );

      const spells = reconstructReviewEpisodes(
        uploads,
        [event(3, PostEventAction.approved, '2020-01-01T00:00:00Z')],
        new Set(),
      );

      expect(
        spells.every((spell) => spell.enteredAt.getTime() >= earliest),
      ).toBe(true);
    });

    it('gives a permitted post no spell, since it never entered review', () => {
      const spells = reconstructReviewEpisodes(
        [upload(1, '2024-01-01T00:00:00Z'), upload(2, '2024-01-01T00:00:00Z')],
        [event(1, PostEventAction.approved, '2024-01-02T00:00:00Z')],
        new Set([1]),
      );

      expect(spells.map((spell) => spell.postId)).toEqual([2]);
    });
  });

  describe('several posts at once', () => {
    it('keeps the events of one post out of the spell of another', () => {
      const spells = reconstructReviewEpisodes(
        [upload(1, '2024-01-01T00:00:00Z'), upload(2, '2024-01-01T00:00:00Z')],
        [event(2, PostEventAction.approved, '2024-01-02T00:00:00Z')],
        new Set(),
      );

      expect(spells).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ postId: 1, exitedAt: null }),
          expect.objectContaining({
            postId: 2,
            exitedAt: at('2024-01-02T00:00:00Z'),
          }),
        ]),
      );
    });

    it('returns nothing when it is given nothing', () => {
      expect(reconstructReviewEpisodes([], [], new Set())).toEqual([]);
    });
  });
});
