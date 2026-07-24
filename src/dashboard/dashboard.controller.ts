import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get dashboard summary statistics',
    description: 'Returns total applicant count, breakdown by status, breakdown by internship track, and 5 most recent applicants. Soft-deleted applicants are excluded.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics',
    schema: {
      example: {
        data: {
          totalApplicants: 42,
          byStatus: {
            Pending: 15,
            Shortlisted: 12,
            Accepted: 10,
            Rejected: 5,
          },
          byTrack: {
            Frontend_Development: 10,
            Backend_Development: 12,
            Mobile_Development: 8,
            UI_UX_Design: 7,
            Data_Analytics: 5,
          },
          recentApplicants: [],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSummary() {
    return this.dashboardService.getSummary();
  }
}
