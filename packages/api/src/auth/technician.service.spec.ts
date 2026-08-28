import { ConfigService } from '@nestjs/config';
import { AppConfigKeys } from 'src/app/config.module';

import { TechnicianService } from './technician.service';

const listing = (setting: string | undefined): TechnicianService =>
  new TechnicianService({
    get: (key: string, fallback: string) =>
      key === AppConfigKeys.TECHNICIANS ? (setting ?? fallback) : fallback,
  } as unknown as ConfigService);

describe('TechnicianService', () => {
  it('admits an account named on the list', () => {
    expect(listing('500').isTechnician(500)).toBe(true);
  });

  it('turns away an account the list does not name', () => {
    expect(listing('500').isTechnician(501)).toBe(false);
  });

  it('reads several accounts separated by commas', () => {
    const technicians = listing('500,501,502');

    expect(technicians.isTechnician(500)).toBe(true);
    expect(technicians.isTechnician(501)).toBe(true);
    expect(technicians.isTechnician(502)).toBe(true);
  });

  it('reads the technician setting and no other', () => {
    expect(listing('500').isTechnician(500)).toBe(true);
    expect(listing(undefined).isTechnician(500)).toBe(false);
  });

  it('keeps an unreadable entry out of the list rather than storing it', () => {
    const technicians = listing('nonsense');

    expect(technicians.isTechnician(NaN)).toBe(false);
    expect(technicians.isTechnician(undefined)).toBe(false);
  });

  describe('characterised, not specified', () => {
    it('takes the leading digits of a malformed entry as an id', () => {
      expect(listing('12abc').isTechnician(12)).toBe(true);
    });

    it('reads a hex-looking entry as the digits before the x', () => {
      expect(listing('0x10').isTechnician(0)).toBe(true);
    });
  });
});
