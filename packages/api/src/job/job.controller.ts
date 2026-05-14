import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServerAdminGuard } from 'src/auth/auth.guard';
import { PaginationParams } from 'src/common';

import { JobInfo, SchedulerInfo } from './job.dto';
import { JobService } from './job.service';

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(ServerAdminGuard)
@ApiBearerAuth()
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all jobs',
    description:
      'Returns a list of all jobs that have been queued or processed.',
    operationId: 'getJobs',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of all jobs',
    type: [JobInfo],
  })
  async getJobs(@Query() pages?: PaginationParams): Promise<JobInfo[]> {
    return this.jobService.list(pages);
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

  @Put('schedulers/:id/enable')
  @ApiOperation({
    summary: 'Enable a job scheduler',
    description: 'Enables a previously disabled job scheduler.',
    operationId: 'enableJobScheduler',
  })
  async enableScheduler(@Param('id') id: string): Promise<void> {
    await this.jobService.enableScheduler(id);
  }

  @Put('schedulers/:id/disable')
  @ApiOperation({
    summary: 'Disable a job scheduler',
    description: 'Disables a job scheduler, preventing it from creating jobs.',
    operationId: 'disableJobScheduler',
  })
  async disableScheduler(@Param('id') id: string): Promise<void> {
    await this.jobService.disableScheduler(id);
  }
}
