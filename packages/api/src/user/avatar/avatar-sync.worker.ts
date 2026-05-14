import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { sub } from 'date-fns';
import { postsMany } from 'src/api';
import { AuthService } from 'src/auth/auth.service';
import { JobHandler } from 'src/job/job.decorator';
import { ensureActive } from 'src/job/job.utils';
import { PostEntity } from 'src/post/post.entity';
import { UserSyncService } from 'src/user/sync/user-sync.service';

import { AvatarSyncService } from './avatar-sync.service';

@Injectable()
export class AvatarSyncWorker {
  constructor(
    private readonly authService: AuthService,
    private readonly avatarSyncService: AvatarSyncService,
    private readonly userSyncService: UserSyncService,
  ) {}

  private readonly logger = new Logger(AvatarSyncWorker.name);

  @JobHandler({
    id: 'avatars',
    queue: 'default',
    pattern: '*/10 * * * *',
    timeout: 1000 * 60 * 5,
  })
  async fetchAvatars(job: Job): Promise<void> {
    const axiosConfig = this.authService.getServerAxiosConfig();

    const avatars = await this.userSyncService.listNotableAvatars({
      newerThan: sub(new Date(), { months: 1 }),
    });

    this.logger.log(`Found ${avatars.length} avatar ids`);

    const notStoredIds = await this.avatarSyncService.findNotStored(avatars);

    postsMany(notStoredIds, axiosConfig, async (result) => {
      await this.avatarSyncService.create(
        result.map((post) => PostEntity.fromPost(post)),
      );

      await ensureActive(job);
    });
  }
}
