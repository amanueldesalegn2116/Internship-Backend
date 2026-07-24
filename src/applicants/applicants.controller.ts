import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApplicantsService } from './applicants.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateNotesDto } from './dto/update-notes.dto';
import { QueryApplicantsDto } from './dto/query-applicants.dto';

@ApiTags('Applicants')
@ApiBearerAuth()
@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  // ─── POST /applicants ────────────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Create a new applicant', description: 'Creates a new internship applicant. Email must be unique.' })
  @ApiResponse({ status: 201, description: 'Applicant created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createApplicantDto: CreateApplicantDto) {
    return this.applicantsService.create(createApplicantDto);
  }

  // ─── GET /applicants ─────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'List all applicants',
    description: 'Returns a paginated list of applicants. Supports search by name/email, filtering by status/track, and sorting.',
  })
  @ApiResponse({ status: 200, description: 'Paginated applicant list with meta' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() query: QueryApplicantsDto) {
    return this.applicantsService.findAll(query);
  }

  // ─── GET /applicants/:id ─────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get a single applicant', description: 'Retrieves full details for one applicant by ID.' })
  @ApiParam({ name: 'id', description: 'Applicant CUID' })
  @ApiResponse({ status: 200, description: 'Applicant found' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.applicantsService.findOne(id);
  }

  // ─── PATCH /applicants/:id ───────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Update applicant details', description: 'Partially updates an applicant. All fields are optional.' })
  @ApiParam({ name: 'id', description: 'Applicant CUID' })
  @ApiResponse({ status: 200, description: 'Applicant updated' })
  @ApiResponse({ status: 400, description: 'Validation error or invalid status transition' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  @ApiResponse({ status: 409, description: 'Email already taken' })
  update(@Param('id') id: string, @Body() updateApplicantDto: UpdateApplicantDto) {
    return this.applicantsService.update(id, updateApplicantDto);
  }

  // ─── DELETE /applicants/:id ──────────────────────────────────────────────
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete an applicant', description: 'Marks an applicant as deleted. They will not appear in any list or statistics.' })
  @ApiParam({ name: 'id', description: 'Applicant CUID' })
  @ApiResponse({ status: 200, description: 'Applicant soft-deleted' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  remove(@Param('id') id: string) {
    return this.applicantsService.remove(id);
  }

  // ─── PATCH /applicants/:id/status ────────────────────────────────────────
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update applicant status',
    description: 'Changes the application status. Business rule: Cannot move directly from Rejected → Accepted.',
  })
  @ApiParam({ name: 'id', description: 'Applicant CUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition (e.g. Rejected → Accepted)' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.applicantsService.updateStatus(id, updateStatusDto);
  }

  // ─── PATCH /applicants/:id/notes ─────────────────────────────────────────
  @Patch(':id/notes')
  @ApiOperation({
    summary: 'Update internal notes',
    description: 'Updates the internal notes for an applicant. Maximum 1000 characters.',
  })
  @ApiParam({ name: 'id', description: 'Applicant CUID' })
  @ApiResponse({ status: 200, description: 'Notes updated' })
  @ApiResponse({ status: 400, description: 'Notes exceed 1000 characters' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  updateNotes(@Param('id') id: string, @Body() updateNotesDto: UpdateNotesDto) {
    return this.applicantsService.updateNotes(id, updateNotesDto);
  }
}
