import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { startOfDay } from 'date-fns';
import { Cacheable, withInvalidation } from 'src/app/browser.module';
import { CursorParams, DateRange, TimeScale } from 'src/common';
import { ItemType } from 'src/label/label.entity';
import {
  Between,
  FindOptionsWhere,
  In,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';

import { ManifestAvailability, ManifestQuery } from './manifest.dto';
import { ManifestEntity, Order, OrderResults } from './manifest.entity';
import { ManifestRewrite, ManifestUtils } from './manifest.utils';

export class ManifestService {
  constructor(
    @InjectRepository(ManifestEntity)
    private readonly manifestRepository: Repository<ManifestEntity>,
  ) {}

  save = withInvalidation(
    this.manifestRepository.save.bind(this.manifestRepository),
    ManifestEntity,
  );

  remove = withInvalidation(
    this.manifestRepository.remove.bind(this.manifestRepository),
    ManifestEntity,
  );

  @Cacheable({
    prefix: 'manifest',
    ttl: 60 * 60 * 1000,
    dependencies: [ManifestEntity],
  })
  async get(id: number): Promise<ManifestEntity | null> {
    return this.manifestRepository.findOne({
      where: { id },
    });
  }

  private whereInRange(
    range?: DateRange,
    options?: FindOptionsWhere<ManifestEntity>,
  ): FindOptionsWhere<ManifestEntity>[] {
    // A query may name a scale without naming dates, which claims no range.
    range =
      range?.startDate && range.endDate
        ? range.expand(TimeScale.Day)
        : undefined;

    return [
      ...(range
        ? [
            {
              ...options,
              startDate: Between(range.startDate, range.endDate),
            },
            {
              ...options,
              endDate: Between(range.startDate, range.endDate),
            },
            {
              ...options,
              startDate: LessThan(range.startDate),
              endDate: MoreThan(range.endDate),
            },
          ]
        : [
            {
              ...options,
            },
          ]),
    ];
  }

  @Cacheable({
    prefix: 'manifest',
    ttl: 30 * 60 * 1000,
    dependencies: [ManifestEntity],
  })
  async list(
    range?: DateRange,
    query?: ManifestQuery,
    cursor?: CursorParams,
  ): Promise<ManifestEntity[]> {
    const where = query?.id
      ? { id: query.id }
      : this.whereInRange(range, query?.type ? { type: In(query.type) } : {});

    // The sync asks what it already holds, so an unasked page would read as
    // absence and refetch the world.
    if (!cursor) return this.manifestRepository.find({ where });

    const builder = this.manifestRepository
      .createQueryBuilder('manifest')
      .where(where)
      .orderBy('manifest.start_date', 'DESC')
      .addOrderBy('manifest.id', 'DESC')
      .take(cursor.limit ?? CursorParams.DEFAULT_PAGE_SIZE);

    if (cursor.before) {
      // The marker carries its own date, so it outlives the row it came from.
      const [date, id] = cursor.before.split('|');

      if (!date || !id) {
        throw new BadRequestException('Malformed cursor');
      }

      // The id breaks a tie between manifests claiming one date.
      builder.andWhere('(manifest.start_date, manifest.id) < (:date, :id)', {
        date: new Date(date),
        id: Number(id),
      });
    }

    return builder.getMany();
  }

  @Cacheable({
    prefix: 'manifest',
    ttl: 15 * 60 * 1000,
    dependencies: [ManifestEntity],
  })
  async listOrdersByRange(type: ItemType, range: DateRange): Promise<Order[]> {
    range = range.expand(TimeScale.Day);
    const manifests = await this.list(range, { type: [type] });
    return ManifestUtils.computeOrders(manifests, range);
  }

  @Cacheable({
    prefix: 'manifest',
    ttl: 10 * 60 * 1000,
    dependencies: [ManifestEntity],
  })
  async available(
    range: DateRange,
    type: ItemType[],
  ): Promise<ManifestAvailability> {
    const manifests = await this.list(range, { type: type });
    const currentTime = startOfDay(Date.now());

    const availability = ManifestUtils.computeAvailability(
      manifests,
      range,
      type,
      currentTime,
    );

    return new ManifestAvailability({
      ...availability,
    });
  }

  async saveResults(results: OrderResults): Promise<Order> {
    const {
      discard,
      save,
      order: update,
    } = ManifestUtils.computeSaveResults(results, new Date());

    await this.remove(discard);
    await this.save(save);
    return this.updateOrder(results.order, update);
  }

  async updateOrder(order: Order, update: Partial<Order>): Promise<Order> {
    return new Order({
      ...order,
      lower:
        update.lower instanceof ManifestEntity
          ? await this.save(update.lower)
          : update.lower,
      upper:
        update.upper instanceof ManifestEntity
          ? await this.save(update.upper)
          : update.upper,
    });
  }

  async mergeInRange(type: ItemType, range: DateRange): Promise<void> {
    const manifests = await this.list(range, { type: [type] });
    const instruction = ManifestUtils.computeMergeInRange(manifests);
    await this.rewrite(instruction);
  }

  async rewrite(instruction: ManifestRewrite): Promise<ManifestEntity[]> {
    await this.remove(instruction.discard);
    return this.save(instruction.save);
  }
}
