import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { withInvalidation } from 'src/app/browser.module';
import {
  DateRange,
  constructCountUpdated,
  constructFirstFromId,
} from 'src/common';
import { Repository } from 'typeorm';

import { AppealEntity } from '../appeal.entity';

@Injectable()
export class AppealSyncService {
  constructor(
    @InjectRepository(AppealEntity)
    private readonly appealRepository: Repository<AppealEntity>,
  ) {}

  async findAppellants(range?: DateRange): Promise<number[]> {
    return (
      await this.appealRepository
        .createQueryBuilder('appeal')
        .select('appeal.creator_id', 'user_id')
        .addSelect('COUNT(appeal.id)', 'appealed')
        .where(DateRange.fill(range).where())
        .groupBy('appeal.creator_id')
        .orderBy('appealed', 'DESC')
        .take(100)
        .getRawMany<{
          user_id: string;
          appealed: string;
        }>()
    ).map((row) => Number(row.user_id));
  }

  firstFromId = constructFirstFromId(this.appealRepository);
  countUpdated = constructCountUpdated(this.appealRepository);

  save = withInvalidation(
    this.appealRepository.save.bind(this.appealRepository),
    AppealEntity,
  );
}
