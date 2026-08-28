import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { differenceInHours, max, min, sub } from 'date-fns';
import { TicketQtype, TicketStatus } from 'src/api/e621';
import { Cacheable } from 'src/app/browser.module';
import {
  DateRange,
  PaginationParams,
  PartialDateRange,
  Raw,
  SeriesCountPoint,
  collapseTimeScaleDuration,
  convertKeysToCamelCase,
  generateSeriesCountPoints,
  generateSeriesRecordPoints,
} from 'src/common';
import { SystemUserService } from 'src/user/system/system-user.service';
import { UserEntity } from 'src/user/user.entity';
import {
  FindOptionsWhere,
  In,
  IsNull,
  LessThan,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';

import { TicketLifecycleEntity } from '../lifecycle/ticket-lifecycle.entity';
import { TicketEntity } from '../ticket.entity';
import {
  TicketAgeSeriesPoint,
  TicketAgeSummary,
  TicketAgeSummaryQuery,
  TicketClosedSeriesQuery,
  TicketCreatedSeriesQuery,
  TicketHandlerSummary,
  TicketReporterSummary,
  TicketStatusSeriesPoint,
  TicketTypeSummary,
  TicketTypeSummaryQuery,
} from './ticket-metric.dto';

@Injectable()
export class TicketMetricService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    @InjectRepository(TicketLifecycleEntity)
    private readonly lifecycleRepository: Repository<TicketLifecycleEntity>,
    private readonly systemUser: SystemUserService,
  ) {}

  private whereCreatedOrUpdated(
    range?: PartialDateRange,
    options?: FindOptionsWhere<TicketEntity>,
  ): FindOptionsWhere<TicketEntity>[] {
    range = DateRange.fill(range);
    return [
      {
        createdAt: range.find(),
        ...options,
      },
      {
        updatedAt: range.find(),
        ...options,
      },
    ];
  }

  @Cacheable({
    prefix: 'ticket',
    ttl: 10 * 60 * 1000,
    dependencies: [TicketEntity],
  })
  async status(range?: PartialDateRange): Promise<TicketStatusSeriesPoint[]> {
    range = DateRange.fill(range);

    const tickets = await this.ticketRepository.find({
      where: [
        ...this.whereCreatedOrUpdated(range),
        {
          createdAt: LessThan(range.endDate!),
          status: Not(TicketStatus.approved),
        },
      ],
    });

    return generateSeriesRecordPoints<Record<TicketStatus, number>>(
      tickets.map((ticket) => max([ticket.createdAt, range.startDate!])),
      tickets.map((ticket) => ticket.status),
      Object.values(TicketStatus),
      range,
    ).map(
      (e) =>
        new TicketStatusSeriesPoint({
          date: e.date,
          ...e.value,
        }),
    );
  }

  @Cacheable({
    prefix: 'ticket',
    ttl: 15 * 60 * 1000,
    dependencies: [TicketEntity],
  })
  async typeSummary(
    range?: PartialDateRange,
    query?: TicketTypeSummaryQuery,
  ): Promise<TicketTypeSummary> {
    return new TicketTypeSummary({
      ...Object.fromEntries(
        await Promise.all(
          Object.values(TicketQtype).map(async (type) => [
            type,
            await this.ticketRepository.count({
              where: {
                createdAt: DateRange.fill(range).find(),
                qtype: type,
                ...query?.where(),
              },
            }),
          ]),
        ),
      ),
    });
  }

  @Cacheable({
    prefix: 'ticket',
    ttl: 10 * 60 * 1000,
    dependencies: [TicketEntity],
  })
  async openSeries(
    partialRange?: PartialDateRange,
  ): Promise<SeriesCountPoint[]> {
    const range = DateRange.fill(partialRange);
    const tickets = await this.ticketRepository.find({
      where: [
        ...this.whereCreatedOrUpdated(range),
        {
          createdAt: LessThan(range.startDate!),
          updatedAt: MoreThan(range.endDate!),
        },
        {
          createdAt: LessThan(range.endDate!),
          status: Not(TicketStatus.approved),
        },
      ],
    });

    const scale = collapseTimeScaleDuration(range.scale);

    const dates = tickets
      .map((ticket) => {
        const startDate = max([ticket.createdAt, range.startDate]);

        const handledDate =
          ticket.status === TicketStatus.approved ? ticket.updatedAt : null;

        const endDate = min([
          handledDate ? sub(handledDate, { [scale]: 1 }) : new Date(),
          range.endDate,
        ]);

        if (startDate >= endDate) return null;

        return new DateRange({ startDate, endDate });
      })
      .filter((date): date is DateRange => date !== null);

    return generateSeriesCountPoints(dates, range);
  }

  @Cacheable({
    prefix: 'ticket',
    ttl: 10 * 60 * 1000,
    dependencies: [TicketEntity],
  })
  async createdSeries(
    range?: PartialDateRange,
    query?: TicketCreatedSeriesQuery,
  ): Promise<SeriesCountPoint[]> {
    range = DateRange.fill(range);
    const tickets = await this.ticketRepository.find({
      where: {
        createdAt: range.find(),
        ...query?.where(),
      },
    });

    return generateSeriesCountPoints(
      tickets.map((item) => item.createdAt),
      range,
    );
  }

  @Cacheable({
    prefix: 'ticket',
    ttl: 10 * 60 * 1000,
    dependencies: [TicketEntity],
  })
  async closedSeries(
    range?: PartialDateRange,
    query?: TicketClosedSeriesQuery,
  ): Promise<SeriesCountPoint[]> {
    range = DateRange.fill(range);
    const lives = await this.lifecycleRepository.find({
      where: {
        resolvedAt: range.find(),
        ...(query?.handlerId !== undefined && { handlerId: query.handlerId }),
      },
      select: ['resolvedAt'],
    });

    return generateSeriesCountPoints(
      lives.map((life) => life.resolvedAt!),
      range,
    );
  }

  @Cacheable({
    prefix: 'ticket',
    ttl: 10 * 60 * 1000,
    dependencies: [TicketEntity],
  })
  async ageSeries(range?: PartialDateRange): Promise<TicketAgeSeriesPoint[]> {
    range = DateRange.fill(range);
    const tickets = await this.ticketRepository.find({
      where: [
        ...this.whereCreatedOrUpdated(range),
        {
          createdAt: LessThan(range.startDate!),
          updatedAt: MoreThan(range.endDate!),
        },
        {
          createdAt: LessThan(range.endDate!),
          status: Not(TicketStatus.approved),
        },
      ],
    });

    const dates = tickets.map(
      (ticket) =>
        new DateRange({
          startDate: max([ticket.createdAt, range.startDate!]),
          endDate: min([
            ticket.status === TicketStatus.approved
              ? ticket.updatedAt
              : new Date(),
            range.endDate!,
          ]),
        }),
    );

    const keys = tickets.map((ticket) => {
      // age here is measured in cold dead hours, not zimezone aware intervals.
      // this is because we want to know how long a user had to wait for a response.
      const ageInDays =
        differenceInHours(ticket.updatedAt, ticket.createdAt) / 24;

      if (ageInDays <= 1) {
        return 'oneDay';
      } else if (ageInDays <= 3) {
        return 'threeDays';
      } else if (ageInDays <= 7) {
        return 'oneWeek';
      } else if (ageInDays <= 14) {
        return 'twoWeeks';
      } else if (ageInDays <= 30) {
        return 'oneMonth';
      } else {
        return 'aboveOneMonth';
      }
    });

    const allKeys = [
      'oneDay',
      'threeDays',
      'oneWeek',
      'twoWeeks',
      'oneMonth',
      'aboveOneMonth',
    ] as const;

    return generateSeriesRecordPoints<Raw<TicketAgeSummary>>(
      dates,
      keys,
      allKeys,
      range,
    ).map(
      (e) =>
        new TicketAgeSeriesPoint({
          date: e.date,
          ...e.value,
        }),
    );
  }

  @Cacheable({
    prefix: 'ticket',
    ttl: 15 * 60 * 1000,
    dependencies: [TicketEntity, TicketLifecycleEntity],
  })
  async ageSummary(
    range?: PartialDateRange,
    query?: TicketAgeSummaryQuery,
  ): Promise<TicketAgeSummary> {
    range = DateRange.fill(range);
    const tickets = await this.ticketRepository.find({
      where: { ...range.where(), ...query?.where() },
    });

    const lives = await this.lifecycleRepository.find({
      where: { ticketId: In(tickets.map((ticket) => ticket.id)) },
      select: ['ticketId', 'resolvedAt'],
    });

    const resolved = new Map(
      lives.map((life) => [life.ticketId, life.resolvedAt]),
    );

    const ageGroups = new TicketAgeSummary({
      oneDay: 0,
      threeDays: 0,
      oneWeek: 0,
      twoWeeks: 0,
      oneMonth: 0,
      aboveOneMonth: 0,
    });

    for (const ticket of tickets) {
      const endDate = resolved.get(ticket.id) ?? new Date();
      const ageInDays = differenceInHours(endDate, ticket.createdAt) / 24;

      let ageGroup: keyof TicketAgeSummary;

      if (ageInDays <= 1) {
        ageGroup = 'oneDay';
      } else if (ageInDays <= 3) {
        ageGroup = 'threeDays';
      } else if (ageInDays <= 7) {
        ageGroup = 'oneWeek';
      } else if (ageInDays <= 14) {
        ageGroup = 'twoWeeks';
      } else if (ageInDays <= 30) {
        ageGroup = 'oneMonth';
      } else {
        ageGroup = 'aboveOneMonth';
      }

      ageGroups[ageGroup]++;
    }

    return new TicketAgeSummary(ageGroups);
  }

  @Cacheable({
    prefix: 'ticket',
    ttl: 15 * 60 * 1000,
    dependencies: [TicketEntity, UserEntity],
  })
  async handlerSummary(
    range?: PartialDateRange,
    pages?: PaginationParams,
  ): Promise<TicketHandlerSummary[]> {
    const results = await this.lifecycleRepository
      .createQueryBuilder('life')
      .where({
        resolvedAt: DateRange.fill(range).find(),
        handlerId: Not(IsNull()),
      })
      .andWhere('life.handler_id != :systemUserId', {
        systemUserId: this.systemUser.id,
      })
      .select('life.handler_id', 'user_id')
      .addSelect('COUNT(life.ticket_id)', 'total')
      .addSelect('COUNT(DISTINCT DATE(life.resolved_at))', 'days')
      .addSelect(
        `RANK() OVER (ORDER BY COUNT(life.ticket_id) DESC)`,
        'position',
      )
      .groupBy('life.handler_id')
      .orderBy('total', 'DESC')
      .limit(pages?.limit || PaginationParams.DEFAULT_PAGE_SIZE)
      .offset(PaginationParams.calculateOffset(pages))
      .getRawMany<{
        user_id: number;
        total: number;
        days: number;
        position: number;
      }>();

    return results.map(
      (row) =>
        new TicketHandlerSummary({
          ...convertKeysToCamelCase(row),
        }),
    );
  }

  @Cacheable({
    prefix: 'ticket',
    ttl: 15 * 60 * 1000,
    dependencies: [TicketEntity, UserEntity],
  })
  async reporterSummary(
    range?: PartialDateRange,
    pages?: PaginationParams,
  ): Promise<TicketReporterSummary[]> {
    const results = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('ticket.creator_id', 'user_id')
      .addSelect('COUNT(ticket.id)', 'total')
      .addSelect('COUNT(DISTINCT DATE(ticket.updated_at))', 'days')
      .where(DateRange.fill(range).where())
      .groupBy('ticket.creator_id')
      .orderBy('total', 'DESC')
      .limit(pages?.limit || PaginationParams.DEFAULT_PAGE_SIZE)
      .offset(PaginationParams.calculateOffset(pages))
      .getRawMany<{
        user_id: number;
        total: number;
        days: number;
      }>();

    return results.map(
      (row) => new TicketReporterSummary(convertKeysToCamelCase(row)),
    );
  }
}
