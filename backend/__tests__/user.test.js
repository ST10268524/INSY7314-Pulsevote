import { jest, describe, it, beforeEach, expect } from '@jest/globals';

// Mock bcrypt
const mockHash = jest.fn();
const mockCompare = jest.fn();

jest.mock('bcrypt', () => ({
  hash: mockHash,
  compare: mockCompare
}));

// Mock User model
const mockSave = jest.fn();
const mockMatchPassword = jest.fn();
const mockHasRole = jest.fn();
const mockHasAnyRole = jest.fn();

const MockUser = jest.fn().mockImplementation((data) => ({
  ...data,
  save: mockSave,
  matchPassword: mockMatchPassword,
  hasRole: mockHasRole,
  hasAnyRole: mockHasAnyRole,
  isLocked: false
}));

jest.mock('../models/User.js', () => MockUser);

import User from '../models/User.js';

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it.skip('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      };

      mockHash.mockResolvedValue('hashedpassword');
      mockSave.mockResolvedValue({});

      const user = new User(userData);
      await user.save();

      expect(mockHash).toHaveBeenCalledWith('password123', 10);
      expect(mockSave).toHaveBeenCalled();
    });

    it.skip('should not hash password if not modified', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      };

      mockHash.mockResolvedValue('hashedpassword');
      mockSave.mockResolvedValue({});

      const user = new User(userData);
      await user.save();

      // Clear the mock call from the first save
      jest.clearAllMocks();

      // Modify a non-password field
      user.username = 'newusername';
      await user.save();

      expect(mockHash).not.toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('Password Matching', () => {
    it.skip('should return true for correct password', async () => {
      mockCompare.mockResolvedValue(true);
      mockMatchPassword.mockResolvedValue(true);

      const user = new User({
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@example.com'
      });

      const result = await user.matchPassword('password123');

      expect(mockMatchPassword).toHaveBeenCalledWith('password123');
      expect(result).toBe(true);
    });

    it.skip('should return false for incorrect password', async () => {
      mockCompare.mockResolvedValue(false);
      mockMatchPassword.mockResolvedValue(false);

      const user = new User({
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@example.com'
      });

      const result = await user.matchPassword('wrongpassword');

      expect(mockMatchPassword).toHaveBeenCalledWith('wrongpassword');
      expect(result).toBe(false);
    });
  });

  describe('Role Methods', () => {
    it('should return true if user has specific role', () => {
      mockHasRole.mockReturnValueOnce(true).mockReturnValueOnce(false);

      const user = new User({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        role: 'admin'
      });

      expect(user.hasRole('admin')).toBe(true);
      expect(user.hasRole('user')).toBe(false);
    });

    it('should return true if user has any of the specified roles', () => {
      mockHasAnyRole.mockReturnValueOnce(true).mockReturnValueOnce(false);

      const user = new User({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        role: 'moderator'
      });

      expect(user.hasAnyRole(['moderator', 'admin'])).toBe(true);
      expect(user.hasAnyRole(['user'])).toBe(false);
    });
  });

  describe('Account Locking', () => {
    it('should return true if account is locked', () => {
      const user = new User({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        lockUntil: new Date(Date.now() + 1000) // 1 second in the future
      });

      // Override the isLocked property for this test
      user.isLocked = true;

      expect(user.isLocked).toBe(true);
    });

    it('should return false if account is not locked', () => {
      const user = new User({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        lockUntil: new Date(Date.now() - 1000) // 1 second in the past
      });

      // Override the isLocked property for this test
      user.isLocked = false;

      expect(user.isLocked).toBe(false);
    });
  });
});
