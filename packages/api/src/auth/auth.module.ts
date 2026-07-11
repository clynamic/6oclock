import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import {
  AuthGuard,
  OptionalAuthGuard,
  RolesGuard,
  TechnicianGuard,
} from './auth.guard';
import { AuthService } from './auth.service';
import { OidcService } from './oidc.service';
import { SessionEntity } from './session.entity';
import { SessionService } from './session.service';
import { TechnicianService } from './technician.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity])],
  controllers: [AuthController],
  providers: [
    AuthService,
    OidcService,
    SessionService,
    TechnicianService,
    AuthGuard,
    OptionalAuthGuard,
    RolesGuard,
    TechnicianGuard,
  ],
  exports: [
    AuthService,
    SessionService,
    TechnicianService,
    AuthGuard,
    OptionalAuthGuard,
    RolesGuard,
    TechnicianGuard,
  ],
})
export class AuthModule {}
