import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Job } from 'bullmq';

import { JOB_TIMED_OUT_PREFIX } from './job.constants';
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

    const handlerPromise = entry.handler(job);

    if (!entry.options.timeout) {
      return handlerPromise;
    }

    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () =>
          reject(
            new Error(`${JOB_TIMED_OUT_PREFIX} ${entry.options.timeout}ms`),
          ),
        entry.options.timeout,
      );
    });

    try {
      await Promise.race([handlerPromise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      handlerPromise.catch(() => undefined);
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
