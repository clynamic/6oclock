import {
  Controller,
  Get,
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

@ApiTags('Proxy')
@Controller('proxy')
// TODO: This should have auth, to prevent abuse.
export class ProxyController {
  private readonly axios: AxiosInstance;
  private readonly STATIC_HOST = 'https://static1.e621.net';

  constructor() {
    this.axios = AXIOS_INSTANCE;
  }

  @Get('*path')
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

    const fullUrl = `${this.STATIC_HOST}/${proxyPath}`;

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
