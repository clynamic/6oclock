import { Controller, Get, INestApplication, Query } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { Activity, ActivitySummaryQuery } from './performance-metric.dto';

@Controller()
class ActivityQueryProbeController {
  @Get('probe')
  probe(@Query() query: ActivitySummaryQuery): ActivitySummaryQuery {
    return query;
  }
}

const createApp = async (
  queryParser: 'simple' | 'extended',
): Promise<INestApplication> => {
  const moduleRef = await Test.createTestingModule({
    controllers: [ActivityQueryProbeController],
  }).compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>();
  app.set('query parser', queryParser);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();
  return app;
};

// Mirrors how axios serializes array params: `activities[]=a&activities[]=b`.
const bracketedActivities =
  'area=moderator' +
  `&activities[]=${Activity.PostApprove}` +
  `&activities[]=${Activity.TicketHandle}`;

describe('activity query parsing', () => {
  let extendedApp: INestApplication;
  let simpleApp: INestApplication;

  beforeAll(async () => {
    extendedApp = await createApp('extended');
    simpleApp = await createApp('simple');
  }, 30000);

  afterAll(async () => {
    await extendedApp.close();
    await simpleApp.close();
  });

  it('binds `activities[]` brackets into an array with the extended parser', async () => {
    const response = await request(extendedApp.getHttpServer()).get(
      `/probe?${bracketedActivities}`,
    );

    expect(response.body.activities).toEqual([
      Activity.PostApprove,
      Activity.TicketHandle,
    ]);
  });

  it("drops `activities[]` with Express 5's default simple parser", async () => {
    const response = await request(simpleApp.getHttpServer()).get(
      `/probe?${bracketedActivities}`,
    );

    expect(response.body.activities).toBeUndefined();
  });
});
