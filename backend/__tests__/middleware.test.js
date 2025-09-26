import jwt from 'jsonwebtoken';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Mock User model
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  isActive: true,
  isLocked: false,
  hasAnyRole: jest.fn()
};

jest.mock('../models/User.js', () => ({
  findById: jest.fn()
}));

import User from '../models/User.js';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should return 401 if no token provided', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token invalid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if token is valid and user exists', async () => {
      const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET || 'test-secret');
      req.headers.authorization = `Bearer ${token}`;

      User.findById.mockResolvedValue(mockUser);

      await protect(req, res, next);

      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
      const token = jwt.sign({ id: 'nonexistent' }, process.env.JWT_SECRET || 'test-secret');
      req.headers.authorization = `Bearer ${token}`;

      User.findById.mockResolvedValue(null);

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    it('should return 403 if user does not have required role', () => {
      req.user = { ...mockUser, hasAnyRole: jest.fn().mockReturnValue(false) };
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. Insufficient permissions.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if user has required role', () => {
      req.user = { ...mockUser, hasAnyRole: jest.fn().mockReturnValue(true) };
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
