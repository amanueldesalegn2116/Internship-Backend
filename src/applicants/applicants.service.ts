import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateNotesDto } from './dto/update-notes.dto';
import { QueryApplicantsDto } from './dto/query-applicants.dto';

// Status transitions that are forbidden
const FORBIDDEN_TRANSITIONS: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
  [ApplicationStatus.Rejected]: [ApplicationStatus.Accepted],
};

@Injectable()
export class ApplicantsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Create ────────────────────────────────────────────────────────────────

  async create(dto: CreateApplicantDto) {
    const existing = await this.prisma.applicant.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(
        `An applicant with email '${dto.email}' already exists`,
      );
    }

    return this.prisma.applicant.create({ data: dto });
  }

  // ─── List (paginated, filtered, searchable) ─────────────────────────────

  async findAll(query: QueryApplicantsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      track,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ApplicantWhereInput = {
      deletedAt: null, // exclude soft-deleted
    };

    if (status) where.status = status;
    if (track) where.track = track;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'lastName', 'firstName', 'status'];
    const orderByField = allowedSortFields.includes(sortBy ?? '') ? sortBy : 'createdAt';

    const [applicants, total] = await this.prisma.$transaction([
      this.prisma.applicant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderByField as string]: sortOrder },
      }),
      this.prisma.applicant.count({ where }),
    ]);

    return {
      data: applicants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Find One ───────────────────────────────────────────────────────────

  async findOne(id: string) {
    const applicant = await this.prisma.applicant.findFirst({
      where: { id, deletedAt: null },
    });
    if (!applicant) {
      throw new NotFoundException(`Applicant with ID '${id}' not found`);
    }
    return applicant;
  }

  // ─── Update ─────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateApplicantDto) {
    await this.findOne(id); // ensures it exists and is not deleted

    // If email is being changed, check uniqueness
    if (dto.email) {
      const conflict = await this.prisma.applicant.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(
          `An applicant with email '${dto.email}' already exists`,
        );
      }
    }

    // If status is being changed, enforce transition rules
    if (dto.status) {
      const current = await this.prisma.applicant.findUnique({ where: { id } });
      this.validateStatusTransition(current!.status, dto.status);
    }

    return this.prisma.applicant.update({ where: { id }, data: dto });
  }

  // ─── Soft Delete ─────────────────────────────────────────────────────────

  async remove(id: string) {
    await this.findOne(id); // ensures it exists and is not already deleted
    return this.prisma.applicant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─── Update Status ───────────────────────────────────────────────────────

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const applicant = await this.findOne(id);
    this.validateStatusTransition(applicant.status, dto.status);

    return this.prisma.applicant.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  // ─── Update Notes ────────────────────────────────────────────────────────

  async updateNotes(id: string, dto: UpdateNotesDto) {
    await this.findOne(id);

    if (dto.notes.length > 1000) {
      throw new BadRequestException('Notes must not exceed 1000 characters');
    }

    return this.prisma.applicant.update({
      where: { id },
      data: { notes: dto.notes },
    });
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────

  private validateStatusTransition(
    currentStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
  ) {
    const forbidden = FORBIDDEN_TRANSITIONS[currentStatus];
    if (forbidden?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition applicant status from '${currentStatus}' to '${newStatus}'. ` +
          `A rejected applicant must first be moved to Pending or Shortlisted.`,
      );
    }
  }
}
