import { Module } from '@nestjs/common';

import { SystemUserService } from './system-user.service';

@Module({
  providers: [SystemUserService],
  exports: [SystemUserService],
})
export class SystemUserModule {}
