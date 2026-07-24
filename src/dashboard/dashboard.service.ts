import { Injectable } from '@nestjs/common';
import { ApplicationStatus, InternshipTrack } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const baseWhere = { deletedAt: null };

    // Run all counts concurrently in a single transaction
    const [
      totalApplicants,

      // Status counts
      pendingCount,
      shortlistedCount,
      acceptedCount,
      rejectedCount,

      // Track counts
      frontendCount,
      backendCount,
      mobileCount,
      uiuxCount,
      dataCount,

      // Recent applicants
      recentApplicants,
    ] = await this.prisma.$transaction([
      this.prisma.applicant.count({ where: baseWhere }),

      this.prisma.applicant.count({ where: { ...baseWhere, status: ApplicationStatus.Pending } }),
      this.prisma.applicant.count({ where: { ...baseWhere, status: ApplicationStatus.Shortlisted } }),
      this.prisma.applicant.count({ where: { ...baseWhere, status: ApplicationStatus.Accepted } }),
      this.prisma.applicant.count({ where: { ...baseWhere, status: ApplicationStatus.Rejected } }),

      this.prisma.applicant.count({ where: { ...baseWhere, track: InternshipTrack.Frontend_Development } }),
      this.prisma.applicant.count({ where: { ...baseWhere, track: InternshipTrack.Backend_Development } }),
      this.prisma.applicant.count({ where: { ...baseWhere, track: InternshipTrack.Mobile_Development } }),
      this.prisma.applicant.count({ where: { ...baseWhere, track: InternshipTrack.UI_UX_Design } }),
      this.prisma.applicant.count({ where: { ...baseWhere, track: InternshipTrack.Data_Analytics } }),

      this.prisma.applicant.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          track: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalApplicants,
      byStatus: {
        [ApplicationStatus.Pending]: pendingCount,
        [ApplicationStatus.Shortlisted]: shortlistedCount,
        [ApplicationStatus.Accepted]: acceptedCount,
        [ApplicationStatus.Rejected]: rejectedCount,
      },
      byTrack: {
        [InternshipTrack.Frontend_Development]: frontendCount,
        [InternshipTrack.Backend_Development]: backendCount,
        [InternshipTrack.Mobile_Development]: mobileCount,
        [InternshipTrack.UI_UX_Design]: uiuxCount,
        [InternshipTrack.Data_Analytics]: dataCount,
      },
      recentApplicants,
    };
  }
}
