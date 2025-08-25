import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { login, register } from '../controllers/authController';
import { prisma } from '@ecommerce/database';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'USER' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        addresses: [],
      };

      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      } as any;

      const mockRes = {
        json: jest.fn(),
      } as any;

      const mockNext = jest.fn();

      // Mock Prisma and bcrypt
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValue('mock-token' as never);

      await login(mockReq, mockRes, mockNext);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { addresses: true },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          }),
          accessToken: 'mock-token',
          refreshToken: 'mock-token',
        }),
        message: 'Login successful',
      });
    });

    it('should throw error with invalid credentials', async () => {
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      } as any;

      const mockRes = {} as any;
      const mockNext = jest.fn();

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(login(mockReq, mockRes, mockNext)).rejects.toThrow();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'USER' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        addresses: [],
      };

      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const mockNext = jest.fn();

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      mockJwt.sign.mockReturnValue('mock-token' as never);

      await register(mockReq, mockRes, mockNext);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword',
          name: 'Test User',
          role: 'USER',
        },
        include: { addresses: true },
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          }),
          accessToken: 'mock-token',
          refreshToken: 'mock-token',
        }),
        message: 'Registration successful',
      });
    });
  });
});