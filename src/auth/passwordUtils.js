const bcrypt = require('bcrypt');

// Salt rounds for bcrypt (higher = more secure but slower)
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 * @param {string} plainPassword - The plain text password
 * @returns {Promise<string>} - The hashed password
 */
const hashPassword = async (plainPassword) => {
  try {
    if (!plainPassword || typeof plainPassword !== 'string') {
      throw new Error('Password is required and must be a string');
    }
    
    if (plainPassword.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }
    
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password: ' + error.message);
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} plainPassword - The plain text password
 * @param {string} hashedPassword - The hashed password from database
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    throw new Error('Failed to compare password');
  }
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {object} - Validation result with isValid and message
 */
const validatePasswordStrength = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  return { isValid: true, message: 'Password is strong' };
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};
