import { Raw } from 'src/common';
import { FindOptionsWhere } from 'typeorm';

import { FlagLifecycleEntity } from '../lifecycle/flag-lifecycle.entity';

export class FlagHandledPoint {
  constructor(value: FlagHandledPoint) {
    Object.assign(this, value);
  }

  date: Date;

  removed: number;
  deleted: number;
}

export enum FlagStatus {
  open = 'open',
  removed = 'removed',
  deleted = 'deleted',
}

export class FlagStatusSeriesPoint {
  constructor(value: FlagStatusSeriesPoint) {
    Object.assign(this, value);
  }

  date: Date;

  open: number;
  removed: number;
  deleted: number;
}

export class FlagHandledQuery {
  constructor(value: Raw<FlagHandledQuery>) {
    Object.assign(this, value);
  }

  userId: number;

  where(): FindOptionsWhere<FlagLifecycleEntity> {
    return { handlerId: this.userId };
  }
}
