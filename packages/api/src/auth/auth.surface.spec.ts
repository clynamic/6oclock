import { ApprovalMetricController } from 'src/approval/metric/approval-metric.controller';
import { DashboardController } from 'src/dashboard/dashboard.controller';
import { DeletionMetricController } from 'src/deletion/metric/deletion-metric.controller';
import { FeedbackMetricController } from 'src/feedback/metric/feedback-metric.controller';
import { FlagMetricController } from 'src/flag/metric/flag-metric.controller';
import { ActivityController } from 'src/gadget/activity/activity.controller';
import { TileHealthController } from 'src/health/tiles/tile-health.controller';
import { ManifestController } from 'src/manifest/manifest.controller';
import { PerformanceMetricController } from 'src/performance/metric/performance-metric.controller';
import { PermitMetricController } from 'src/permit/metric/permit-metric.controller';
import { PostReplacementMetricController } from 'src/post-replacement/metric/post-replacement-metric.controller';
import { PostMetricController } from 'src/post/metric/post-metric.controller';
import { TicketMetricController } from 'src/ticket/metric/ticket-metric.controller';
import { UploadMetricController } from 'src/upload/metric/upload-metric.controller';
import { UserHeadController } from 'src/user/head/user-head.controller';

import { RolesGuard, TechnicianGuard } from './auth.guard';
import { UserLevel } from './auth.level';

type Guarded = new (...args: never[]) => unknown;

const guardsOn = (target: Guarded): string[] =>
  ((Reflect.getMetadata('__guards__', target) as Guarded[]) ?? []).map(
    (guard) => guard.name,
  );

const levelOn = (target: Guarded): UserLevel | undefined =>
  Reflect.getMetadata('level', target) as UserLevel | undefined;

const guardsOnRoute = (target: Guarded, route: string): string[] =>
  (
    (Reflect.getMetadata(
      '__guards__',
      (target.prototype as Record<string, object>)[route]!,
    ) as Guarded[]) ?? []
  ).map((guard) => guard.name);

const routesOf = (target: Guarded): string[] =>
  Object.getOwnPropertyNames(target.prototype).filter(
    (name) =>
      name !== 'constructor' &&
      Reflect.hasMetadata(
        'path',
        (target.prototype as Record<string, object>)[name]!,
      ),
  );

const levelOnRoute = (target: Guarded, route: string): UserLevel | undefined =>
  Reflect.getMetadata(
    'level',
    (target.prototype as Record<string, object>)[route]!,
  ) as UserLevel | undefined;

const STAFF_METRICS: [string, Guarded][] = [
  ['approval', ApprovalMetricController],
  ['deletion', DeletionMetricController],
  ['feedback', FeedbackMetricController],
  ['flag', FlagMetricController],
  ['performance', PerformanceMetricController],
  ['permit', PermitMetricController],
  ['post replacement', PostReplacementMetricController],
  ['post', PostMetricController],
  ['ticket', TicketMetricController],
  ['upload', UploadMetricController],
];

describe('who each route admits', () => {
  describe('the metric endpoints, which expose staff activity', () => {
    it.each(STAFF_METRICS)(
      'guards %s metrics by level',
      (_name, controller) => {
        expect(guardsOn(controller)).toContain(RolesGuard.name);
      },
    );

    it.each(STAFF_METRICS)(
      'admits only staff to %s metrics',
      (_name, controller) => {
        expect(levelOn(controller)).toBe(UserLevel.Staff);
      },
    );

    it.each(STAFF_METRICS)(
      'lets no single %s route quietly ask for less than its controller',
      (_name, controller) => {
        for (const route of routesOf(controller)) {
          expect([UserLevel.Staff, undefined]).toContain(
            levelOnRoute(controller, route),
          );
        }
      },
    );

    it.each(STAFF_METRICS)(
      'finds routes on %s metrics to check in the first place',
      (_name, controller) => {
        expect(routesOf(controller).length).toBeGreaterThan(0);
      },
    );
  });

  describe('the endpoints that name a lower bar', () => {
    it('lets any member read a user head, since names are not staff data', () => {
      expect(guardsOn(UserHeadController)).toContain(RolesGuard.name);
      expect(levelOn(UserHeadController)).toBe(UserLevel.Member);
    });
  });

  describe('the endpoints that only a technician reaches', () => {
    it('keeps manifests behind the technician list, not a staff level', () => {
      expect(guardsOn(ManifestController)).toContain(TechnicianGuard.name);
      expect(levelOn(ManifestController)).toBeUndefined();
    });

    it('keeps reading tile health behind it too', () => {
      expect(guardsOnRoute(TileHealthController, 'getTileHealth')).toContain(
        TechnicianGuard.name,
      );
    });

    it('keeps wiping tiles behind it, since that route destroys data', () => {
      expect(
        guardsOnRoute(TileHealthController, 'deleteTilesByType'),
      ).toContain(TechnicianGuard.name);
    });
  });

  describe('the endpoints that ask only for a session', () => {
    it('guards dashboards without naming a level, so any account reaches its own', () => {
      expect(guardsOn(DashboardController)).toContain(RolesGuard.name);
      expect(levelOn(DashboardController)).toBeUndefined();
    });
  });

  describe('characterised, not specified', () => {
    it('leaves the activity counter open to anyone', () => {
      expect(guardsOn(ActivityController)).toEqual([]);
      expect(levelOn(ActivityController)).toBeUndefined();
    });
  });
});
