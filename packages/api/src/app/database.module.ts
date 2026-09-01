import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource, AppDataSourceOptions } from 'src/data-source';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const dataSource = AppDataSource;
        await dataSource.initialize();
        // eslint-disable-next-line no-restricted-syntax -- session command, not a query
        await dataSource.query(`SET TIME ZONE 'UTC'`);
        return {
          ...AppDataSourceOptions,
          dataSource,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
