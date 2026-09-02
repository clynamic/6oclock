import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { startOfDay, sub } from 'date-fns';
import { PostEventAction, TicketStatus } from 'src/api';
import { Cacheable } from 'src/app/browser.module';
import { getUserLevelFromString } from 'src/auth/auth.level';
import {
  DateRange,
  PartialDateRange,
  convertKeysToCamelCase,
  generateSeriesPoints,
  generateSeriesRecordPoints,
  getClosestTimeScale,
  getDurationKeyForScale,
} from 'src/common';
import { FlagLifecycleEntity } from 'src/flag/lifecycle/flag-lifecycle.entity';
import { ModActionEntity } from 'src/mod-action/mod-action.entity';
import { PostEventEntity } from 'src/post-event/post-event.entity';
import { PostReplacementEntity } from 'src/post-replacement/post-replacement.entity';
import { PostVersionEntity } from 'src/post-version/post-version.entity';
import { TicketEntity } from 'src/ticket/ticket.entity';
import { SystemUserService } from 'src/user/system/system-user.service';
import { UserEntity } from 'src/user/user.entity';
import { In, IsNull, Not, Repository } from 'typeorm';

import {
  Activity,
  ActivitySeriesPoint,
  ActivitySummaryQuery,
  BURSTS,
  COMPANIONS,
  PerformanceRecord,
  PerformanceSeriesPoint,
  PerformanceSeriesQuery,
  PerformanceSummary,
  PerformanceSummaryQuery,
  PerformanceWeights,
  PerformanceWeightsQuery,
  SCORE_UNIT_SECONDS,
  UserArea,
  getBoardWeights,
  getBoardWork,
  getModActionKey,
  getModActionSources,
  getPerformanceScoreGrade,
  getPerformanceTrendGrade,
  getStanding,
  getUserAreaFromLevel,
  getWindowCoverage,
  isOnOwnContent,
  isPostEventAction,
  toScore,
} from './performance-metric.dto';

@Injectable()
export class PerformanceMetricService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PostVersionEntity)
    private readonly postVersionRepository: Repository<PostVersionEntity>,
    @InjectRepository(PostReplacementEntity)
    private readonly postReplacementRepository: Repository<PostReplacementEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    @InjectRepository(PostEventEntity)
    private readonly postEventRepository: Repository<PostEventEntity>,
    @InjectRepository(FlagLifecycleEntity)
    private readonly flagLifecycleRepository: Repository<FlagLifecycleEntity>,
    @InjectRepository(ModActionEntity)
    private readonly modActionRepository: Repository<ModActionEntity>,
    private readonly systemUser: SystemUserService,
  ) {}

  private async findActivities(
    keys: Activity[],
    range: PartialDateRange,
    userId?: number,
  ): Promise<Record<number, Partial<Record<Activity, Date[]>>>> {
    const items: Record<number, Partial<Record<Activity, Date[]>>> = {};

    const storeItem = (key: Activity, actorId: number, date: Date) => {
      if (userId === undefined && this.systemUser.isSystem(actorId)) return;

      if (!items[actorId]) {
        items[actorId] = {};
      }

      if (!items[actorId]![key]) {
        items[actorId]![key] = [];
      }

      items[actorId]![key].push(date);
    };

    const tasks: Promise<void>[] = [];

    for (const key of new Set(keys)) {
      switch (key) {
        case Activity.PostCreate:
          tasks.push(
            this.postVersionRepository
              .find({
                where: {
                  version: 1,
                  updatedAt: range.find(),
                  updaterId: userId,
                },
                select: ['updaterId', 'updatedAt'],
              })
              .then((posts) =>
                posts.forEach((post) =>
                  storeItem(
                    Activity.PostCreate,
                    post.updaterId,
                    post.updatedAt,
                  ),
                ),
              ),
          );
          break;
        case Activity.PostApprove:
          tasks.push(
            this.postEventRepository
              .find({
                where: {
                  ...range.where(),
                  action: PostEventAction.approved,
                  creatorId: userId,
                },
                select: ['creatorId', 'createdAt'],
              })
              .then((events) =>
                events.forEach((event) =>
                  storeItem(
                    Activity.PostApprove,
                    event.creatorId,
                    event.createdAt,
                  ),
                ),
              ),
          );
          break;
        case Activity.PostDelete:
          tasks.push(
            this.postEventRepository
              .find({
                where: {
                  ...range.where(),
                  action: PostEventAction.deleted,
                  creatorId: userId,
                },
                select: ['creatorId', 'createdAt'],
              })
              .then((events) =>
                events.forEach((event) =>
                  storeItem(
                    Activity.PostDelete,
                    event.creatorId,
                    event.createdAt,
                  ),
                ),
              ),
          );
          break;
        case Activity.PostReplacementCreate:
          tasks.push(
            this.postReplacementRepository
              .find({
                where: {
                  ...range.where(),
                  creatorId: userId,
                },
                select: ['creatorId', 'createdAt'],
              })
              .then((replacements) =>
                replacements.forEach((replacement) =>
                  storeItem(
                    Activity.PostReplacementCreate,
                    replacement.creatorId,
                    replacement.createdAt,
                  ),
                ),
              ),
          );
          break;
        case Activity.PostReplacementApprove:
        case Activity.PostReplacementPromote:
        case Activity.PostReplacementReject: {
          const actionMap = {
            [Activity.PostReplacementApprove]:
              PostEventAction.replacement_accepted,
            [Activity.PostReplacementPromote]:
              PostEventAction.replacement_promoted,
            [Activity.PostReplacementReject]:
              PostEventAction.replacement_rejected,
          };
          tasks.push(
            this.postEventRepository
              .find({
                where: {
                  ...range.where(),
                  action: actionMap[key],
                  creatorId: userId ? userId : Not(IsNull()),
                },
                select: ['creatorId', 'createdAt'],
              })
              .then((events) =>
                events.forEach((event) =>
                  storeItem(key, event.creatorId, event.createdAt),
                ),
              ),
          );
          break;
        }
        case Activity.TicketCreate:
          tasks.push(
            this.ticketRepository
              .find({
                where: {
                  ...range.where(),
                  creatorId: userId,
                },
                select: ['creatorId', 'createdAt'],
              })
              .then((tickets) =>
                tickets.forEach((ticket) =>
                  storeItem(
                    Activity.TicketCreate,
                    ticket.creatorId,
                    ticket.createdAt,
                  ),
                ),
              ),
          );
          break;
        case Activity.TicketHandle:
          tasks.push(
            this.ticketRepository
              .find({
                where: {
                  updatedAt: range.find(),
                  status: TicketStatus.approved,
                  handlerId: userId ? userId : Not(IsNull()),
                },
                select: ['handlerId', 'updatedAt'],
              })
              .then((tickets) =>
                tickets.forEach((ticket) =>
                  storeItem(
                    Activity.TicketHandle,
                    ticket.handlerId,
                    ticket.updatedAt,
                  ),
                ),
              ),
          );
          break;
        case Activity.FlagHandle:
          tasks.push(
            this.flagLifecycleRepository
              .find({
                where: {
                  handledAt: range.find(),
                  handlerId: userId ? userId : Not(IsNull()),
                },
                select: ['handlerId', 'handledAt'],
              })
              .then((episodes) =>
                episodes.forEach((episode) =>
                  storeItem(
                    Activity.FlagHandle,
                    episode.handlerId!,
                    episode.handledAt!,
                  ),
                ),
              ),
          );
          break;
      }
    }

    await Promise.all(tasks);

    return items;
  }

  private async findBoardActivities(
    area: UserArea,
    keys: string[],
    range: DateRange,
    userId?: number,
    only?: number,
  ): Promise<Record<number, Record<string, Date[]>>> {
    const items: Record<number, Record<string, Date[]>> = {};

    const storeItem = (key: string, actorId: number, date: Date) => {
      if (userId !== actorId && this.systemUser.isSystem(actorId)) return;
      items[actorId] ??= {};
      items[actorId]![key] ??= [];
      items[actorId]![key]!.push(date);
    };

    if (keys.length === 0) return items;
    if (area === UserArea.Member) return items;

    const eventKeys = keys.filter(isPostEventAction);
    const actionKeys = keys.filter((key) => !isPostEventAction(key));

    if (eventKeys.length > 0) {
      const events = await this.postEventRepository.find({
        where: {
          ...range.where(),
          action: In(eventKeys),
          creatorId: only,
        },
        select: ['creatorId', 'action', 'createdAt'],
      });
      for (const event of events) {
        storeItem(event.action, event.creatorId, event.createdAt);
      }
    }

    if (actionKeys.length > 0) {
      const sources = new Set(actionKeys.flatMap(getModActionSources));
      const companions = COMPANIONS.filter((companion) =>
        companion.riders.some((rider) => actionKeys.includes(rider)),
      );
      for (const companion of companions) sources.add(companion.anchor);
      const actions = await this.modActionRepository.find({
        where: {
          createdAt: range.find(),
          action: In([...sources]),
          creatorId: only,
        },
        select: ['creatorId', 'action', 'createdAt', 'values'],
      });
      const anchors = new Map(
        companions.map((companion) => [
          companion,
          actions.filter((action) => action.action === companion.anchor),
        ]),
      );
      const ridesAlong = (action: ModActionEntity): boolean =>
        companions.some(
          (companion) =>
            companion.riders.includes(action.action) &&
            anchors
              .get(companion)!
              .some(
                (anchor) =>
                  anchor.creatorId === action.creatorId &&
                  (!companion.sameTarget ||
                    Number(anchor.values['user_id']) ===
                      Number(action.values['user_id'])) &&
                  Math.abs(
                    anchor.createdAt.getTime() - action.createdAt.getTime(),
                  ) <= companion.windowMs,
              ),
        );
      const lastSeen = new Map<string, number>();
      const inBurst = (key: string, actorId: number, date: Date): boolean => {
        const burst = BURSTS.find((candidate) => candidate.keys.includes(key));
        if (!burst) return false;
        const slot = `${actorId}:${key}`;
        const previous = lastSeen.get(slot);
        lastSeen.set(slot, date.getTime());
        return (
          previous !== undefined && date.getTime() - previous <= burst.windowMs
        );
      };
      const ordered = [...actions].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
      for (const action of ordered) {
        const key = getModActionKey(action.action, action.values);
        if (!actionKeys.includes(key)) continue;
        if (ridesAlong(action)) continue;
        if (isOnOwnContent(action.creatorId, action.values)) continue;
        if (inBurst(key, action.creatorId, action.createdAt)) continue;
        storeItem(key, action.creatorId, action.createdAt);
      }
    }

    const work = getBoardWork(area);
    for (const actorId of Object.keys(items)) {
      if (Number(actorId) === userId) continue;
      const done = Object.keys(items[Number(actorId)]!);
      if (!done.some((key) => work.includes(key))) {
        delete items[Number(actorId)];
      }
    }

    return items;
  }

  @Cacheable({
    prefix: 'performance',
    ttl: 30 * 60 * 1000,
    dependencies: [UserEntity, PostEventEntity, ModActionEntity],
  })
  async performance(
    range?: PartialDateRange,
    query?: PerformanceSummaryQuery,
  ): Promise<PerformanceSummary[]> {
    range = DateRange.fill(range);

    const area = await this.resolveArea(query);

    const weights = getBoardWeights(area);
    const allKeys = (
      query?.activities?.length ? query.activities : Object.keys(weights)
    ).filter((key) => key in weights);

    const data = await Promise.all(
      Array.from({ length: 4 }, async (_, i) => {
        const scale = getClosestTimeScale(range as DateRange);
        const duration = getDurationKeyForScale(scale);
        const shiftedRange = new DateRange({
          ...range,
          startDate: sub(range.startDate!, { [duration]: i }),
          endDate: sub(range.endDate!, { [duration]: i }),
        });

        return this.findBoardActivities(
          area,
          allKeys,
          shiftedRange,
          query?.userId,
        );
      }),
    );

    if (query?.userId) {
      data.forEach((record) => {
        record[query.userId!] ??= {};
      });
    }

    const scores = data.map(
      (e) =>
        Object.fromEntries(
          Object.entries(e).map(([userId, activities]) => [
            Number(userId),
            Object.entries(activities).reduce(
              (acc, [key, dates]) => acc + dates.length * (weights[key] ?? 0),
              0,
            ),
          ]),
        ) as Record<number, number>,
    );

    const activities: Record<
      number,
      Record<string, number>
    > = Object.fromEntries(
      Object.entries(data[0]!).map(([userId, activities]) => [
        Number(userId),
        Object.fromEntries(
          Object.entries(activities).map(([key, dates]) => [key, dates.length]),
        ),
      ]),
    );

    const attendance = Object.fromEntries(
      Object.entries(data[0]!).map(([userId, activities]) => [
        Number(userId),
        [
          ...new Set(
            Object.values(activities).flatMap((dates) =>
              dates.map((date) => startOfDay(date, range.in()).getTime()),
            ),
          ),
        ]
          .sort((a, b) => a - b)
          .map((time) => new Date(time)),
      ]),
    ) as Record<number, Date[]>;

    const points = scores.map(
      (e) =>
        Object.fromEntries(
          Object.entries(e).map(([userId, seconds]) => [
            userId,
            toScore(seconds),
          ]),
        ) as Record<number, number>,
    );

    const standings = points.map((e) => {
      const values = Object.values(e);
      return Object.fromEntries(
        Object.entries(e).map(([userId, value]) => [
          userId,
          getStanding(values, value),
        ]),
      ) as Record<number, number>;
    });

    const coverage = getWindowCoverage(range as DateRange);

    const trendScores = Object.fromEntries(
      Object.entries(points[0]!).map(([userId, value]) => {
        const pace = coverage > 0 ? value / coverage : value;
        const prior = points.slice(1);
        const baseline =
          prior.reduce((acc, e) => acc + (e[+userId] ?? 0), 0) / prior.length;
        const trend =
          baseline > 0
            ? Math.round(((pace - baseline) / baseline) * 100)
            : pace > 0
              ? 100
              : 0;
        return [Number(userId), trend];
      }),
    ) as Record<number, number>;

    const result: { userId: number; score: number }[] = Object.entries(
      points[0]!,
    )
      .map(([userId, value]) => ({
        userId: Number(userId),
        score: value,
      }))
      .sort((a, b) => b.score - a.score);

    return result
      .map(
        (e, i) =>
          new PerformanceSummary({
            userId: e.userId,
            position: result.length > 1 ? i + 1 : 0,
            score: e.score,
            scoreGrade: getPerformanceScoreGrade(standings[0]![e.userId]!),
            trend: trendScores[e.userId]!,
            trendGrade: getPerformanceTrendGrade(trendScores[e.userId]!),
            history: points.map(
              (d, j) =>
                new PerformanceRecord({
                  score: d[e.userId] ?? 0,
                  grade: getPerformanceScoreGrade(standings[j]![e.userId] ?? 0),
                }),
            ),
            activity: activities[e.userId]!,
            attendance: attendance[e.userId]!,
          }),
      )
      .filter((e) =>
        query?.userId ? e.userId === Number(query.userId) : true,
      );
  }

  private async resolveArea(query?: {
    area?: UserArea;
    userId?: number;
  }): Promise<UserArea> {
    if (query?.area) return query.area;
    if (query?.userId) {
      const user = await this.userRepository.findOne({
        where: { id: query.userId },
      });
      return getUserAreaFromLevel(getUserLevelFromString(user?.levelString));
    }
    return UserArea.Member;
  }

  @Cacheable({
    prefix: 'performance',
    ttl: 30 * 60 * 1000,
    dependencies: [UserEntity, PostEventEntity, ModActionEntity],
  })
  async series(
    range?: PartialDateRange,
    query?: PerformanceSeriesQuery,
  ): Promise<PerformanceSeriesPoint[]> {
    const filled = DateRange.fill(range);
    const area = await this.resolveArea(query);
    const weights = getBoardWeights(area);

    const data = await this.findBoardActivities(
      area,
      Object.keys(weights),
      filled,
      query?.userId,
      query?.userId,
    );
    const records = query?.userId
      ? [data[query.userId] ?? {}]
      : Object.values(data);
    const items = records.flatMap((activities) =>
      Object.entries(activities).flatMap(([key, dates]) =>
        dates.map((date) => ({ date, key })),
      ),
    );

    return generateSeriesPoints(
      items.map((e) => e.key),
      items.map((e) => e.date),
      filled,
    ).map((e) => {
      const scores = Object.fromEntries(
        Object.keys(weights).map((key) => [key, 0]),
      );
      for (const key of e.value) {
        scores[key]! += (weights[key] ?? 0) / SCORE_UNIT_SECONDS;
      }
      return new PerformanceSeriesPoint({
        date: e.date,
        score: Object.values(scores).reduce((acc, score) => acc + score, 0),
        scores,
      });
    });
  }

  weights(query?: PerformanceWeightsQuery): PerformanceWeights {
    const area = query?.area ?? UserArea.Member;
    return new PerformanceWeights({
      area,
      weights: Object.fromEntries(
        Object.entries(getBoardWeights(area)).map(([key, seconds]) => [
          key,
          seconds / SCORE_UNIT_SECONDS,
        ]),
      ),
    });
  }

  @Cacheable({
    ttl: 15 * 60 * 1000,
    dependencies: [
      UserEntity,
      PostVersionEntity,
      PostReplacementEntity,
      TicketEntity,
      PostEventEntity,
      FlagLifecycleEntity,
    ],
  })
  async activity(
    range?: PartialDateRange,
    query?: ActivitySummaryQuery,
  ): Promise<ActivitySeriesPoint[]> {
    range = DateRange.fill(range);

    let allKeys: Activity[] = [];

    if (query?.activities?.length) {
      allKeys = query.activities;
    } else {
      let area: UserArea = UserArea.Member;
      if (query?.area) {
        area = query.area;
      } else if (query?.userId) {
        const user = await this.userRepository.findOne({
          where: { id: query.userId },
        });

        area = getUserAreaFromLevel(getUserLevelFromString(user?.levelString));
      }

      switch (area) {
        case UserArea.Admin:
          allKeys = query?.userId
            ? [Activity.PostCreate, Activity.TicketHandle]
            : [];
          break;
        case UserArea.Moderator:
          allKeys = query?.userId
            ? [Activity.PostCreate, Activity.TicketHandle]
            : [Activity.TicketHandle];
          break;
        case UserArea.Janitor:
          allKeys = [
            ...(query?.userId
              ? [Activity.TicketCreate, Activity.PostCreate]
              : []),
            Activity.PostApprove,
            Activity.PostDelete,
            Activity.PostReplacementApprove,
            Activity.PostReplacementReject,
            Activity.PostReplacementPromote,
            Activity.FlagHandle,
          ];
          break;
        case UserArea.Member:
          allKeys = [
            Activity.PostCreate,
            Activity.PostReplacementCreate,
            Activity.TicketCreate,
          ];
          break;
      }
    }

    const items: { date: Date; key: Activity }[] = [];

    await this.findActivities(allKeys, range, query?.userId).then((data) => {
      for (const [, activities] of Object.entries(data)) {
        for (const [key, value] of Object.entries(activities)) {
          value!.forEach((date) => items.push({ date, key: key as Activity }));
        }
      }
    });

    return generateSeriesRecordPoints<Record<Activity, number>>(
      items.map((e) => e.date),
      items.map((e) => e.key),
      allKeys,
      range,
    ).map(
      (e) =>
        new ActivitySeriesPoint({
          date: e.date,
          ...convertKeysToCamelCase(e.value),
        }),
    );
  }
}
