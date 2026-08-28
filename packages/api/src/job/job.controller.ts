import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TechnicianGuard } from 'src/auth/auth.guard';
import { CursorParams, PaginationParams } from 'src/common';

import {
  JobInfo,
  JobLogInfo,
  JobOverview,
  JobQuery,
  SchedulerInfo,
  SchedulerState,
} from './job.dto';
import { JobService } from './job.service';
import { JobLogService } from './log/job-log.service';

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(TechnicianGuard)
@ApiBearerAuth()
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly jobLogService: JobLogService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all jobs',
    description:
      'Returns a list of all jobs that have been queued or processed, ' +
      'optionally limited to one scheduler.',
    operationId: 'getJobs',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of all jobs',
    type: [JobInfo],
  })
  async getJobs(
    @Query() pages?: PaginationParams,
    @Query() query?: JobQuery,
  ): Promise<JobInfo[]> {
    return this.jobService.list(pages, query?.handler);
  }

  @Get('overview')
  @ApiOperation({
    summary: 'Get one row per scheduler with its last run',
    description:
      'Returns every registered scheduler beside the outcome of its most recent job.',
    operationId: 'getJobOverview',
  })
  @ApiResponse({
    status: 200,
    description: 'One row per scheduler',
    type: [JobOverview],
  })
  async getJobOverview(): Promise<JobOverview[]> {
    return this.jobService.overview();
  }

  @Get(':id/logs')
  @ApiOperation({
    summary: 'Get the log of one run',
    description: 'Returns the lines a single run wrote while it held a turn.',
    operationId: 'getJobLogs',
  })
  @ApiResponse({
    status: 200,
    description: 'The lines of one run',
    type: [JobLogInfo],
  })
  async getJobLogs(
    @Param('id') id: string,
    @Query() cursor?: CursorParams,
  ): Promise<JobLogInfo[]> {
    const lines = await this.jobLogService.list(id, cursor);

    return lines.map(
      (line) =>
        new JobLogInfo({
          id: line.id,
          at: line.at,
          level: line.level,
          context: line.context ?? undefined,
          record: line.record,
        }),
    );
  }

  @Get('schedulers')
  @ApiOperation({
    summary: 'Get all job schedulers',
    description: 'Returns a list of all registered job schedulers.',
    operationId: 'getJobSchedulers',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of all job schedulers',
    type: [SchedulerInfo],
  })
  getSchedulers(): SchedulerInfo[] {
    return this.jobService.listSchedulers();
  }

  @Put('schedulers')
  @ApiOperation({
    summary: 'Enable or disable a job scheduler',
    description:
      'Schedules a handler on its queue, or unschedules it so it creates no ' +
      'further jobs. Handler ids carry a slash, so the id travels in the body.',
    operationId: 'setJobScheduler',
  })
  async setScheduler(@Body() body: SchedulerState): Promise<void> {
    if (body.enabled) {
      await this.jobService.enableScheduler(body.id);
    } else {
      await this.jobService.disableScheduler(body.id);
    }
  }
}
