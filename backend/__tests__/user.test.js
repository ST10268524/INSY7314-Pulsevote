import User from '../models/User.js';
import bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt;

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      };

      mockedBcrypt.hash.mockResolvedValue('hashedpassword');

      const user = new User(userData);
      await user.save();

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should not hash password if not modified', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      };

      mockedBcrypt.hash.mockResolvedValue('hashedpassword');

      const user = new User(userData);
      await user.save();

      // Clear the mock call from the first save
      jest.clearAllMocks();

      // Modify a non-password field
      user.username = 'newusername';
      await user.save();

      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('Password Matching', () => {
    it('should return true for correct password', async () => {
      const user = new User({
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@example.com'
      });

      mockedBcrypt.compare.mockResolvedValue(true);

      const result = await user.matchPassword('password123');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = new User({
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@example.com'
      });

      mockedBcrypt.compare.mockResolvedValue(false);

      const result = await user.matchPassword('wrongpassword');

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(result).toBe(false);
    });
  });

  describe('Role Methods', () => {
    it('should return true if user has specific role', () => {
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

      expect(user.isLocked).toBe(true);
    });

    it('should return false if account is not locked', () => {
      const user = new User({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        lockUntil: new Date(Date.now() - 1000) // 1 second in the past
      });

      expect(user.isLocked).toBe(false);
    });
  });
});
