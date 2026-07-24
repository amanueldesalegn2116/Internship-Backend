import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockAdmin = {
    id: 'admin-1',
    email: 'admin@intern.dev',
    name: 'Test Admin',
    passwordHash: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    administrator: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeAll(async () => {
    mockAdmin.passwordHash = await bcrypt.hash('Admin@1234', 10);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login()', () => {
    it('should return accessToken and admin profile on valid credentials', async () => {
      mockPrismaService.administrator.findUnique.mockResolvedValue(mockAdmin);

      const result = await service.login({ email: 'admin@intern.dev', password: 'Admin@1234' });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.tokenType).toBe('Bearer');
      expect(result.admin.email).toBe('admin@intern.dev');
    });

    it('should throw UnauthorizedException when admin not found', async () => {
      mockPrismaService.administrator.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      mockPrismaService.administrator.findUnique.mockResolvedValue(mockAdmin);

      await expect(
        service.login({ email: 'admin@intern.dev', password: 'WrongPass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe()', () => {
    it('should return admin profile', async () => {
      const adminProfile = { id: 'admin-1', email: 'admin@intern.dev', name: 'Test Admin', createdAt: new Date() };
      mockPrismaService.administrator.findUnique.mockResolvedValue(adminProfile);

      const result = await service.getMe('admin-1');
      expect(result.email).toBe('admin@intern.dev');
    });

    it('should throw UnauthorizedException if admin not found', async () => {
      mockPrismaService.administrator.findUnique.mockResolvedValue(null);

      await expect(service.getMe('nonexistent-id')).rejects.toThrow(UnauthorizedException);
    });
  });
});
