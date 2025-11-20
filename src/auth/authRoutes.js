const express = require('express');
const router = express.Router();
const {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
  enhancedLogin
} = require('./authController');

// Import models (will be passed from server.js)
let Student, Teacher, Coordinator;

const initializeModels = (models) => {
  Student = models.Student;
  Teacher = models.Teacher;
  Coordinator = models.Coordinator;
};

// Enhanced Login Routes
router.post('/login/student', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const result = await enhancedLogin(email, password, 'student', Student);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(401).json(result);
  }
});

router.post('/login/teacher', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const result = await enhancedLogin(email, password, 'teacher', Teacher);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(401).json(result);
  }
});

router.post('/login/coordinator', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const result = await enhancedLogin(email, password, 'coordinator', Coordinator);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(401).json(result);
  }
});

// Password Reset Routes
router.post('/forgot-password/student', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const result = await requestPasswordReset(email, 'student', Student);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json(result);
  }
});

router.post('/forgot-password/teacher', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const result = await requestPasswordReset(email, 'teacher', Teacher);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json(result);
  }
});

router.post('/forgot-password/coordinator', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const result = await requestPasswordReset(email, 'coordinator', Coordinator);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(404).json(result);
  }
});

// Verify OTP Route (common for all user types)
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP are required'
    });
  }

  const result = verifyOTP(email, otp);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
});

// Reset Password Routes
router.post('/reset-password/student', async (req, res) => {
  const { email, newPassword } = req.body;
  
  if (!email || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email and new password are required'
    });
  }

  const result = await resetPassword(email, newPassword, Student);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
});

router.post('/reset-password/teacher', async (req, res) => {
  const { email, newPassword } = req.body;
  
  if (!email || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email and new password are required'
    });
  }

  const result = await resetPassword(email, newPassword, Teacher);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
});

router.post('/reset-password/coordinator', async (req, res) => {
  const { email, newPassword } = req.body;
  
  if (!email || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email and new password are required'
    });
  }

  const result = await resetPassword(email, newPassword, Coordinator);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
});

module.exports = { router, initializeModels };
