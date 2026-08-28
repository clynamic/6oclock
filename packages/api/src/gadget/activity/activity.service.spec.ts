import { Test } from '@nestjs/testing';
import { ApprovalMetricService } from 'src/approval/metric/approval-metric.service';
import { DateRange, SHIP_TIMEZONE, TimeScale } from 'src/common';
import { DeletionMetricService } from 'src/deletion/metric/deletion-metric.service';
import { Activity } from 'src/performance/metric/performance-metric.dto';
import { PostReplacementMetricService } from 'src/post-replacement/metric/post-replacement-metric.service';
import { TicketMetricService } from 'src/ticket/metric/ticket-metric.service';

import { ActivityService } from './activity.service';

const TICKET_HANDLE_DAY = new Date('2024-01-03T12:00:00Z');
const POST_APPROVE_DAY = new Date('2024-01-01T12:00:00Z');
const POST_DELETE_DAY = new Date('2024-01-02T12:00:00Z');
const REPLACEMENT_DAY = new Date('2024-01-05T12:00:00Z');

const point = (value: number): { date: Date; value: number } => ({
  date: new Date('2024-01-01T00:00:00Z'),
  value,
});

describe('ActivityService', () => {
  let service: ActivityService;
  let closedSeries: jest.Mock;
  let ticketStatus: jest.Mock;
  let approvalCountSeries: jest.Mock;
  let replacementStatus: jest.Mock;
  let deletionCountSeries: jest.Mock;

  beforeEach(async () => {
    closedSeries = jest.fn().mockResolvedValue([]);
    ticketStatus = jest.fn().mockResolvedValue([]);
    approvalCountSeries = jest.fn().mockResolvedValue([]);
    replacementStatus = jest.fn().mockResolvedValue([]);
    deletionCountSeries = jest.fn().mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: TicketMetricService,
          useValue: { closedSeries, status: ticketStatus },
        },
        {
          provide: ApprovalMetricService,
          useValue: { countSeries: approvalCountSeries },
        },
        {
          provide: PostReplacementMetricService,
          useValue: { status: replacementStatus },
        },
        {
          provide: DeletionMetricService,
          useValue: { countSeries: deletionCountSeries },
        },
      ],
    }).compile();

    service = moduleRef.get(ActivityService);
  });

  describe('the activity it picks', () => {
    it('holds one activity across every hour of a day', async () => {
      const picked = new Set<Activity>();

      for (let hour = 0; hour < 24; hour++) {
        const daily = await service.getDailyActivity(
          new Date(Date.UTC(2024, 0, 3, hour, 30)),
        );
        picked.add(daily.activity);
      }

      expect([...picked]).toEqual([Activity.TicketHandle]);
    });

    it.each([
      [TICKET_HANDLE_DAY, Activity.TicketHandle],
      [POST_APPROVE_DAY, Activity.PostApprove],
      [POST_DELETE_DAY, Activity.PostDelete],
      [REPLACEMENT_DAY, Activity.PostReplacementApprove],
    ])(
      'rolls a settled activity for a settled day, which the rest of this suite leans on',
      async (date, activity) => {
        const daily = await service.getDailyActivity(date);

        expect(daily.activity).toBe(activity);
      },
    );

    it('reports the figure as a weekly one', async () => {
      const daily = await service.getDailyActivity(TICKET_HANDLE_DAY);

      expect(daily.timescale).toBe(TimeScale.Week);
    });
  });

  describe('handled tickets', () => {
    it('reads resolutions rather than the standing queue', async () => {
      await service.getDailyActivity(TICKET_HANDLE_DAY);

      expect(closedSeries).toHaveBeenCalledTimes(1);
      expect(ticketStatus).not.toHaveBeenCalled();
    });

    it('counts each resolution once across the week', async () => {
      closedSeries.mockResolvedValue([point(2), point(0), point(3)]);

      const daily = await service.getDailyActivity(TICKET_HANDLE_DAY);

      expect(daily.activity).toBe(Activity.TicketHandle);
      expect(daily.value).toBe(5);
    });

    it('asks for one whole week in the ship timezone, opening on a Sunday', async () => {
      await service.getDailyActivity(TICKET_HANDLE_DAY);

      const range = closedSeries.mock.calls[0]![0] as DateRange;

      expect(range.timezone).toBe(SHIP_TIMEZONE);
      expect(range.scale).toBe(TimeScale.All);
      expect(range.endDate.getTime() - range.startDate.getTime()).toBe(
        7 * 24 * 60 * 60 * 1000,
      );
      expect(range.startDate.getDay()).toBe(0);
    });

    it('anchors the week on the date it was asked for, not on today', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-15T12:00:00Z'));

      await service.getDailyActivity(TICKET_HANDLE_DAY);

      const range = closedSeries.mock.calls[0]![0] as DateRange;

      expect(range.startDate.getTime()).toBeLessThan(
        TICKET_HANDLE_DAY.getTime(),
      );
      expect(range.endDate.getTime()).toBeGreaterThan(
        TICKET_HANDLE_DAY.getTime(),
      );

      jest.useRealTimers();
    });
  });

  describe('the other activities', () => {
    it('sums approvals over the week', async () => {
      approvalCountSeries.mockResolvedValue([point(4), point(1)]);

      const daily = await service.getDailyActivity(POST_APPROVE_DAY);

      expect(daily.activity).toBe(Activity.PostApprove);
      expect(daily.value).toBe(5);
    });

    it('sums deletions over the week', async () => {
      deletionCountSeries.mockResolvedValue([point(6), point(1)]);

      const daily = await service.getDailyActivity(POST_DELETE_DAY);

      expect(daily.activity).toBe(Activity.PostDelete);
      expect(daily.value).toBe(7);
    });

    it('sums every settled replacement, whichever way it settled', async () => {
      replacementStatus.mockResolvedValue([
        { approved: 1, promoted: 2, rejected: 3, pending: 99 },
      ]);

      const daily = await service.getDailyActivity(REPLACEMENT_DAY);

      expect(daily.activity).toBe(Activity.PostReplacementApprove);
      expect(daily.value).toBe(6);
    });
  });
});
