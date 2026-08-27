import {
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Param,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AxiosInstance } from 'axios';
import { AXIOS_INSTANCE, getContentType } from 'src/api';
import { Readable } from 'stream';

import { STATIC_HOST } from './proxy.url';

@ApiTags('Proxy')
@Controller('proxy')
// TODO: This should have auth, to prevent abuse.
export class ProxyController {
  private readonly axios: AxiosInstance;

  constructor() {
    this.axios = AXIOS_INSTANCE;
  }

  @Get('*path')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  @ApiOperation({
    summary: 'Proxy request to static host',
    description:
      'Proxies a request to the static host and returns the file as a stream',
    operationId: 'proxyRequest',
  })
  @ApiParam({
    name: 'path',
    description: 'Static path to proxy',
    required: true,
    schema: { type: 'string' },
  })
  @ApiResponse({
    status: 200,
    description: 'File streamed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid path',
  })
  async proxyRequest(
    @Param('path') path: string[],
    @Query() queryParams: Record<string, string>,
  ): Promise<StreamableFile> {
    const proxyPath = path.join('/');

    if (!proxyPath || proxyPath.includes('://')) {
      throw new HttpException('Invalid path', HttpStatus.BAD_REQUEST);
    }

    const fullUrl = `${STATIC_HOST}/${proxyPath}`;

    const response = await this.axios.get(fullUrl, {
      params: queryParams,
      responseType: 'stream',
    });

    const stream = response.data as Readable;

    return new StreamableFile(stream, {
      type: getContentType(response),
      disposition: `inline; filename="${proxyPath.split('/').pop()}"`,
    });
  }
}
