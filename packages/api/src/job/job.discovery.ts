import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { policies } from 'pg-boss';

import { JobBoss } from './job.boss';
import { JOB_HANDLER_METADATA, Job, QUEUE_NAMES } from './job.constants';
import { JobHandlerOptions } from './job.decorator';
import { JobProcessor } from './job.processor';

export interface JobHandlerEntry {
  options: Required<JobHandlerOptions>;
  handler: (job: Job) => Promise<void>;
}

const EXPIRE_SECONDS = 600;
const RETENTION_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class JobDiscoveryService implements OnModuleInit {
  constructor(
    private readonly jobBoss: JobBoss,
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly processor: JobProcessor,
  ) {}

  private readonly logger = new Logger(JobDiscoveryService.name);
  private ready = false;
  private readonly handlers = new Map<string, JobHandlerEntry>();

  async onModuleInit(): Promise<void> {
    try {
      await this.jobBoss.start();
      this.discover();
      await this.createQueues();
      await this.registerWorkers();
      await this.registerSchedulers();
      this.ready = true;
    } catch (error) {
      this.logger.error('Failed to initialize job discovery', error);
    }
  }

  isReady(): boolean {
    return this.ready;
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

  private async createQueues(): Promise<void> {
    const boss = this.jobBoss.instance;

    await boss.createQueue('default', {
      policy: policies.singleton,
      retryLimit: 0,
      expireInSeconds: EXPIRE_SECONDS,
      deleteAfterSeconds: RETENTION_SECONDS,
    });

    await boss.createQueue('tiling', {
      policy: policies.standard,
      retryLimit: 0,
      expireInSeconds: EXPIRE_SECONDS,
      deleteAfterSeconds: RETENTION_SECONDS,
    });
  }

  private async registerWorkers(): Promise<void> {
    const boss = this.jobBoss.instance;

    for (const queue of QUEUE_NAMES) {
      await boss.work<{ handlerId?: string }>(
        queue,
        { batchSize: 1 },
        async (jobs) => {
          const job = jobs[0];
          if (!job) return;

          const handlerId = job.data?.handlerId;
          if (!handlerId) {
            this.logger.warn(`Job on ${queue} missing handlerId`);
            return;
          }

          const entry = this.handlers.get(handlerId);
          if (!entry) {
            this.logger.warn(`No handler found for job: ${handlerId}`);
            return;
          }

          await this.processor.process(entry, job);
        },
      );
    }
  }

  private async registerSchedulers(): Promise<void> {
    const boss = this.jobBoss.instance;

    for (const [, entry] of this.handlers) {
      if (!entry.options.enabled) continue;

      await boss.schedule(
        entry.options.queue,
        entry.options.pattern,
        { handlerId: entry.options.id },
        { key: entry.options.id },
      );

      this.logger.log(`Registered scheduler: ${entry.options.id}`);
    }
  }

  getEntries(): JobHandlerEntry[] {
    return Array.from(this.handlers.values());
  }

  getEntry(id: string): JobHandlerEntry | undefined {
    return this.handlers.get(id);
  }

  async enableScheduler(id: string): Promise<void> {
    const entry = this.handlers.get(id);
    if (!entry) throw new Error(`Unknown scheduler: ${id}`);

    await this.jobBoss.instance.schedule(
      entry.options.queue,
      entry.options.pattern,
      { handlerId: id },
      { key: id },
    );

    entry.options.enabled = true;
    this.logger.log(`Enabled scheduler: ${id}`);
  }

  async disableScheduler(id: string): Promise<void> {
    const entry = this.handlers.get(id);
    if (!entry) throw new Error(`Unknown scheduler: ${id}`);

    await this.jobBoss.instance.unschedule(entry.options.queue, id);

    entry.options.enabled = false;
    this.logger.log(`Disabled scheduler: ${id}`);
  }
}
