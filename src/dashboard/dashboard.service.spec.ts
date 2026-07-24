import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus, InternshipTrack } from '@prisma/client';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrisma = {
    applicant: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getSummary()', () => {
    it('should return summary with all status and track counts', async () => {
      // Transaction returns: [total, pending, shortlisted, accepted, rejected,
      //   frontend, backend, mobile, uiux, data, recentApplicants]
      mockPrisma.$transaction.mockResolvedValue([
        10,   // total
        3, 2, 4, 1, // status counts
        2, 3, 1, 2, 2, // track counts
        [], // recentApplicants
      ]);

      const result = await service.getSummary();

      expect(result.totalApplicants).toBe(10);
      expect(result.byStatus[ApplicationStatus.Pending]).toBe(3);
      expect(result.byStatus[ApplicationStatus.Shortlisted]).toBe(2);
      expect(result.byStatus[ApplicationStatus.Accepted]).toBe(4);
      expect(result.byStatus[ApplicationStatus.Rejected]).toBe(1);
      expect(result.byTrack[InternshipTrack.Frontend_Development]).toBe(2);
      expect(result.byTrack[InternshipTrack.Data_Analytics]).toBe(2);
      expect(result.recentApplicants).toEqual([]);
    });

    it('should return zeros when no applicants exist', async () => {
      mockPrisma.$transaction.mockResolvedValue([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [],
      ]);

      const result = await service.getSummary();

      expect(result.totalApplicants).toBe(0);
      Object.values(ApplicationStatus).forEach((s) => {
        expect(result.byStatus[s]).toBe(0);
      });
      Object.values(InternshipTrack).forEach((t) => {
        expect(result.byTrack[t]).toBe(0);
      });
    });
  });
});
