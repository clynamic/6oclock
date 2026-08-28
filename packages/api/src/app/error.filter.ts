import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// Nest doesn't report errors in dev, so we do it ourselves.
@Catch()
export class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorFilter.name);
  private readonly bare = process.env['NODE_ENV'] === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    const error = exception instanceof Error ? exception : undefined;

    this.logger.error({
      msg: 'Request failed: {error}',
      error: error?.message ?? String(exception),
      err: error,
    });

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.bare
        ? 'Internal server error'
        : (error?.message ?? String(exception)),
      ...(this.bare ? {} : { stack: error?.stack?.split('\n') }),
    });
  }
}
