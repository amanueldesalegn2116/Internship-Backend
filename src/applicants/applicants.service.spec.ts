import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantsService } from './applicants.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, InternshipTrack } from '@prisma/client';

describe('ApplicantsService', () => {
  let service: ApplicantsService;

  const mockApplicant = {
    id: 'applicant-1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: null,
    track: InternshipTrack.Frontend_Development,
    status: ApplicationStatus.Pending,
    resumeUrl: null,
    coverLetter: null,
    notes: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    applicant: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicantsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ApplicantsService>(ApplicantsService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create() ─────────────────────────────────────────────────────────

  describe('create()', () => {
    it('should create an applicant successfully', async () => {
      mockPrisma.applicant.findUnique.mockResolvedValue(null);
      mockPrisma.applicant.create.mockResolvedValue(mockApplicant);

      const result = await service.create({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        track: InternshipTrack.Frontend_Development,
      });

      expect(result.email).toBe('jane.doe@example.com');
      expect(mockPrisma.applicant.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.applicant.findUnique.mockResolvedValue(mockApplicant);

      await expect(
        service.create({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          track: InternshipTrack.Frontend_Development,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── findOne() ────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return an applicant by ID', async () => {
      mockPrisma.applicant.findFirst.mockResolvedValue(mockApplicant);

      const result = await service.findOne('applicant-1');
      expect(result.id).toBe('applicant-1');
    });

    it('should throw NotFoundException for nonexistent ID', async () => {
      mockPrisma.applicant.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove() ─────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('should soft-delete an applicant', async () => {
      mockPrisma.applicant.findFirst.mockResolvedValue(mockApplicant);
      const deleted = { ...mockApplicant, deletedAt: new Date() };
      mockPrisma.applicant.update.mockResolvedValue(deleted);

      const result = await service.remove('applicant-1');
      expect(result.deletedAt).not.toBeNull();
    });
  });

  // ─── updateStatus() ───────────────────────────────────────────────────

  describe('updateStatus()', () => {
    it('should update status to Shortlisted', async () => {
      mockPrisma.applicant.findFirst.mockResolvedValue(mockApplicant);
      const updated = { ...mockApplicant, status: ApplicationStatus.Shortlisted };
      mockPrisma.applicant.update.mockResolvedValue(updated);

      const result = await service.updateStatus('applicant-1', {
        status: ApplicationStatus.Shortlisted,
      });
      expect(result.status).toBe(ApplicationStatus.Shortlisted);
    });

    it('should block Rejected → Accepted transition', async () => {
      const rejectedApplicant = { ...mockApplicant, status: ApplicationStatus.Rejected };
      mockPrisma.applicant.findFirst.mockResolvedValue(rejectedApplicant);

      await expect(
        service.updateStatus('applicant-1', { status: ApplicationStatus.Accepted }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow Rejected → Pending transition', async () => {
      const rejectedApplicant = { ...mockApplicant, status: ApplicationStatus.Rejected };
      mockPrisma.applicant.findFirst.mockResolvedValue(rejectedApplicant);
      const updated = { ...rejectedApplicant, status: ApplicationStatus.Pending };
      mockPrisma.applicant.update.mockResolvedValue(updated);

      const result = await service.updateStatus('applicant-1', {
        status: ApplicationStatus.Pending,
      });
      expect(result.status).toBe(ApplicationStatus.Pending);
    });
  });

  // ─── updateNotes() ────────────────────────────────────────────────────

  describe('updateNotes()', () => {
    it('should update notes within limit', async () => {
      mockPrisma.applicant.findFirst.mockResolvedValue(mockApplicant);
      const updated = { ...mockApplicant, notes: 'Good candidate' };
      mockPrisma.applicant.update.mockResolvedValue(updated);

      const result = await service.updateNotes('applicant-1', {
        notes: 'Good candidate',
      });
      expect(result.notes).toBe('Good candidate');
    });

    it('should reject notes longer than 1000 characters', async () => {
      mockPrisma.applicant.findFirst.mockResolvedValue(mockApplicant);
      const longNotes = 'a'.repeat(1001);

      await expect(
        service.updateNotes('applicant-1', { notes: longNotes }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
