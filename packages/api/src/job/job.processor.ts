import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Job } from 'bullmq';

import { JobDiscoveryService } from './job.discovery';

abstract class JobProcessor extends WorkerHost {
  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  protected abstract readonly logger: Logger;

  private _discoveryService?: JobDiscoveryService;

  private get discoveryService(): JobDiscoveryService {
    if (!this._discoveryService) {
      this._discoveryService = this.moduleRef.get(JobDiscoveryService, {
        strict: false,
      });
    }
    return this._discoveryService;
  }

  async process(job: Job): Promise<void> {
    if (!this.discoveryService.isReady()) {
      this.logger.warn(`Discovery not ready, skipping job: ${job.name}`);
      return;
    }

    const entry = this.discoveryService.getEntry(job.name);
    if (!entry) {
      this.logger.warn(`No handler found for job: ${job.name}`);
      return;
    }

    let timeout: NodeJS.Timeout | undefined;
    if (entry.options.timeout) {
      timeout = setTimeout(() => {
        job.moveToFailed(
          new Error(`Timed out after ${entry.options.timeout}ms`),
          this.worker.id,
          true,
        );
      }, entry.options.timeout);
    }

    try {
      await entry.handler(job);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}

@Processor('default', { lockDuration: 600000 })
export class DefaultProcessor extends JobProcessor {
  constructor(moduleRef: ModuleRef) {
    super(moduleRef);
  }

  protected readonly logger = new Logger(DefaultProcessor.name);
}

@Processor('tiling', { lockDuration: 600000 })
export class TilingProcessor extends JobProcessor {
  constructor(moduleRef: ModuleRef) {
    super(moduleRef);
  }

  protected readonly logger = new Logger(TilingProcessor.name);
}
