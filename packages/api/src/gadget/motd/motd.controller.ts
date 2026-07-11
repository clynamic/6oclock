import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OptionalAuthGuard } from 'src/auth/auth.guard';
import { UserIdentity } from 'src/auth/auth.identity';

import { Motd, defaultMotd } from './motd.dto';
import { MotdService } from './motd.service';

@ApiTags('Gadgets')
@Controller('gadgets')
export class MotdController {
  constructor(private readonly motdService: MotdService) {}

  @Get('motd')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    summary: "Get today's message of the day",
    operationId: 'getMotd',
  })
  @ApiResponse({
    status: 200,
    description: "Today's message of the day",
    type: Motd,
  })
  async getMotd(@Req() req: { user?: UserIdentity }): Promise<Motd> {
    if (!req.user) {
      return new Motd({ message: defaultMotd });
    }

    return this.motdService.getMotd();
  }
}
