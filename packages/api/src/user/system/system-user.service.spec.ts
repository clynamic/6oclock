import { ConfigService } from '@nestjs/config';

import { SystemUserService } from './system-user.service';

const configured = (id: unknown): SystemUserService =>
  new SystemUserService({
    getOrThrow: () => id,
  } as unknown as ConfigService);

describe('SystemUserService', () => {
  it('names the configured account as the system account', () => {
    expect(configured(360277).isSystem(360277)).toBe(true);
  });

  it('names any other account as a person', () => {
    expect(configured(360277).isSystem(500)).toBe(false);
  });

  it('names no account at all as a person', () => {
    expect(configured(360277).isSystem(undefined)).toBe(false);
  });

  it('carries the configured id for callers that need to exclude it', () => {
    expect(configured(360277).id).toBe(360277);
  });

  describe('characterised, not specified', () => {
    it('never matches when the id arrives as a string, so the schema must coerce it', () => {
      expect(configured('360277').isSystem(360277)).toBe(false);
    });
  });
});
