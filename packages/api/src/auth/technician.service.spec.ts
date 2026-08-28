import { ConfigService } from '@nestjs/config';

import { TechnicianService } from './technician.service';

const listing = (setting: string | undefined): TechnicianService =>
  new TechnicianService({
    get: (_key: string, fallback: string) => setting ?? fallback,
  } as unknown as ConfigService);

describe('TechnicianService', () => {
  it('admits an account named on the list', () => {
    expect(listing('500').isTechnician(500)).toBe(true);
  });

  it('turns away an account the list does not name', () => {
    expect(listing('500').isTechnician(501)).toBe(false);
  });

  it('turns away a request carrying no account at all', () => {
    expect(listing('500').isTechnician(undefined)).toBe(false);
  });

  it('reads several accounts separated by commas', () => {
    const technicians = listing('500,501,502');

    expect(technicians.isTechnician(500)).toBe(true);
    expect(technicians.isTechnician(501)).toBe(true);
    expect(technicians.isTechnician(502)).toBe(true);
  });

  it('tolerates spaces around the ids', () => {
    expect(listing(' 500 , 501 ').isTechnician(501)).toBe(true);
  });

  it('admits nobody when the setting is empty', () => {
    expect(listing('').isTechnician(500)).toBe(false);
  });

  it('admits nobody when the setting is absent', () => {
    expect(listing(undefined).isTechnician(500)).toBe(false);
  });

  it('drops an entry it cannot read as a number, keeping the rest', () => {
    const technicians = listing('500,nonsense,502');

    expect(technicians.isTechnician(500)).toBe(true);
    expect(technicians.isTechnician(502)).toBe(true);
  });

  it('admits nobody at all when every entry is unreadable', () => {
    expect(listing('nonsense,rubbish').isTechnician(0)).toBe(false);
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
