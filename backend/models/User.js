/**
 * User Model
 *
 * Defines the User schema for MongoDB with authentication and security features.
 * Includes password hashing, account locking, and role-based access control.
 *
 * @author PulseVote Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * User Schema Definition
 *
 * Fields:
 * - username: Unique username (3-30 characters)
 * - password: Hashed password (minimum 6 characters)
 * - email: Unique email address (lowercase)
 * - role: User role (user, admin, moderator)
 * - isActive: Account status flag
 * - lastLogin: Timestamp of last successful login
 * - loginAttempts: Number of failed login attempts
 * - lockUntil: Account lock expiration timestamp
 * - createdAt/updatedAt: Timestamps
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Pre-save middleware to hash password before saving
 * Only hashes password if it has been modified
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Compare entered password with hashed password
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Increment failed login attempts and lock account if threshold reached
 * Locks account after 5 failed attempts for 2 hours
 * @returns {Promise} - MongoDB update operation
 */
userSchema.methods.incrementLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

/**
 * Check if user has a specific role
 * @param {string} role - Role to check for
 * @returns {boolean} - True if user has the role
 */
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

/**
 * Check if user has any of the specified roles
 * @param {string[]} roles - Array of roles to check for
 * @returns {boolean} - True if user has any of the roles
 */
userSchema.methods.hasAnyRole = function(roles) {
  return roles.includes(this.role);
};

// ============================================================================
// VIRTUAL PROPERTIES
// ============================================================================

/**
 * Virtual property to check if account is currently locked
 * @returns {boolean} - True if account is locked
 */
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ============================================================================
// EXPORT
// ============================================================================

export default mongoose.model('User', userSchema);
