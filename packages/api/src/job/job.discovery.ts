import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { Queue } from 'bullmq';

import {
  Job,
  JOB_HANDLER_METADATA,
  JobQueue,
  QUEUE_NAMES,
} from './job.constants';
import { JobHandlerOptions } from './job.decorator';
import { setActiveCheck } from './job.utils';

export interface JobHandlerEntry {
  options: Required<JobHandlerOptions>;
  handler: (job: Job) => Promise<void>;
}

@Injectable()
export class JobDiscoveryService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    @InjectQueue('default') private readonly defaultQueue: Queue,
    @InjectQueue('tiling') private readonly tilingQueue: Queue,
  ) {}

  private readonly logger = new Logger(JobDiscoveryService.name);
  private ready = false;
  private readonly handlers = new Map<string, JobHandlerEntry>();

  async onModuleInit(): Promise<void> {
    try {
      this.discover();
      await this.registerSchedulers();
      await this.defaultQueue.setGlobalConcurrency(1);
      this.armActiveCheck();
      this.ready = true;
    } catch (error) {
      this.logger.error('Failed to initialize job discovery', error);
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  // Bridges the engine-agnostic ensureActive seam to bullmq job state.
  private armActiveCheck(): void {
    setActiveCheck(async (job) => {
      for (const name of QUEUE_NAMES) {
        const found = await this.getQueue(name).getJob(job.id);
        if (found) return found.getState();
      }
      return undefined;
    });
  }

  private discover(): void {
    const wrappers = this.discoveryService.getProviders();

    for (const wrapper of wrappers) {
      const { instance } = wrapper;
      if (!instance || typeof instance !== 'object') continue;

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) => name !== 'constructor',
      );

      for (const methodName of methodNames) {
        const descriptor = Object.getOwnPropertyDescriptor(
          prototype,
          methodName,
        );
        if (
          !descriptor ||
          descriptor.get ||
          typeof descriptor.value !== 'function'
        )
          continue;

        const method = descriptor.value;

        const options = this.reflector.get<Required<JobHandlerOptions>>(
          JOB_HANDLER_METADATA,
          method,
        );
        if (!options) continue;

        this.handlers.set(options.id, {
          options,
          handler: instance[methodName].bind(instance),
        });

        this.logger.log(
          `Discovered job handler: ${options.id} [${options.queue}] ${options.enabled ? options.pattern : '(disabled)'}`,
        );
      }
    }
  }

  private async registerSchedulers(): Promise<void> {
    for (const [, entry] of this.handlers) {
      if (!entry.options.enabled) continue;

      const queue = this.getQueue(entry.options.queue);

      await queue.upsertJobScheduler(
        entry.options.id,
        { pattern: entry.options.pattern },
        { name: entry.options.id },
      );

      this.logger.log(`Registered scheduler: ${entry.options.id}`);
    }
  }

  getHandler(jobName: string): ((job: Job) => Promise<void>) | undefined {
    return this.handlers.get(jobName)?.handler;
  }

  getEntries(): JobHandlerEntry[] {
    return Array.from(this.handlers.values());
  }

  getEntry(id: string): JobHandlerEntry | undefined {
    return this.handlers.get(id);
  }

  getQueue(name: JobQueue): Queue {
    switch (name) {
      case 'default':
        return this.defaultQueue;
      case 'tiling':
        return this.tilingQueue;
    }
  }

  async enableScheduler(id: string): Promise<void> {
    const entry = this.handlers.get(id);
    if (!entry) throw new Error(`Unknown scheduler: ${id}`);

    const queue = this.getQueue(entry.options.queue);
    await queue.upsertJobScheduler(
      id,
      { pattern: entry.options.pattern },
      { name: id },
    );

    entry.options.enabled = true;
    this.logger.log(`Enabled scheduler: ${id}`);
  }

  async disableScheduler(id: string): Promise<void> {
    const entry = this.handlers.get(id);
    if (!entry) throw new Error(`Unknown scheduler: ${id}`);

    const queue = this.getQueue(entry.options.queue);
    await queue.removeJobScheduler(id);

    entry.options.enabled = false;
    this.logger.log(`Disabled scheduler: ${id}`);
  }
}
