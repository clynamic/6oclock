import { CacheModule } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  CacheManager,
  Cacheable,
  Invalidates,
  withInvalidation,
} from './browser.module';

class Subject {}
class OtherSubject {}

const ran = jest.fn();

@Injectable()
class Probe {
  @Cacheable({ prefix: 'probe', dependencies: [Subject] })
  async read(id?: number | number[]): Promise<string> {
    ran(id);
    return Array.isArray(id) ? `list:${id.join(',')}` : `one:${String(id)}`;
  }

  @Cacheable({ prefix: 'probe', disable: true })
  async uncached(id: number): Promise<string> {
    ran(id);
    return `fresh:${id}`;
  }

  @Cacheable({ prefix: 'probe', dependencies: [Subject] })
  async readAndInvalidate(id: number): Promise<string> {
    ran(id);
    await CacheManager.getInstance().inv(Subject);
    return `one:${id}`;
  }

  @Invalidates(Subject)
  async write(): Promise<void> {}

  @Invalidates(OtherSubject)
  async writeOther(): Promise<void> {}
}

describe('the metric cache', () => {
  let probe: Probe;

  beforeEach(async () => {
    ran.mockClear();

    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [CacheManager, Probe],
    }).compile();

    moduleRef.get(CacheManager);
    probe = moduleRef.get(Probe);
    await CacheManager.getInstance().clear();
  });

  describe('what it caches', () => {
    it('runs the method once and serves the second call from the cache', async () => {
      await probe.read(1);
      await probe.read(1);

      expect(ran).toHaveBeenCalledTimes(1);
    });

    it('keeps different arguments apart', async () => {
      await probe.read(1);
      await probe.read(2);

      expect(ran).toHaveBeenCalledTimes(2);
    });

    it('runs the method every time when caching is turned off', async () => {
      await probe.uncached(1);
      await probe.uncached(1);

      expect(ran).toHaveBeenCalledTimes(2);
    });

    it('serves the value it cached, not merely any value', async () => {
      expect(await probe.read(7)).toBe('one:7');
      expect(await probe.read(7)).toBe('one:7');
    });
  });

  describe('what invalidates it', () => {
    it('drops the entry when a method declaring the dependency runs', async () => {
      await probe.read(1);
      await probe.write();
      await probe.read(1);

      expect(ran).toHaveBeenCalledTimes(2);
    });

    it('leaves the entry alone when an unrelated dependency is invalidated', async () => {
      await probe.read(1);
      await probe.writeOther();
      await probe.read(1);

      expect(ran).toHaveBeenCalledTimes(1);
    });

    it('drops every entry of a dependency, not only the last', async () => {
      await probe.read(1);
      await probe.read(2);
      await probe.write();
      await probe.read(1);
      await probe.read(2);

      expect(ran).toHaveBeenCalledTimes(4);
    });

    it('invalidates through a wrapped plain function too', async () => {
      await probe.read(1);
      await withInvalidation(async () => undefined, Subject)();
      await probe.read(1);

      expect(ran).toHaveBeenCalledTimes(2);
    });
  });

  describe('what it keeps apart', () => {
    it('gives a scalar and a single element array separate entries', async () => {
      const one = await probe.read(5);
      const list = await probe.read([5]);

      expect(list).not.toBe(one);
      expect(ran).toHaveBeenCalledTimes(2);
    });

    it('still evicts an entry whose method invalidated its own dependency', async () => {
      await probe.readAndInvalidate(1);

      await probe.write();

      await probe.readAndInvalidate(1);

      expect(ran).toHaveBeenCalledTimes(2);
    });
  });
});
