import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health & Info')
@Controller()
export class AppController {
  @Public()
  @Get()
  getRoot() {
    return {
      name: 'Internship Applicant Management API',
      status: 'OK',
      documentation: '/docs',
      health: '/api/health',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('api')
  getApiInfo() {
    return {
      name: 'Internship Applicant Management API',
      status: 'OK',
      documentation: '/docs',
      health: '/api/health',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }
}
