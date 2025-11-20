const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { hashPassword, comparePassword } = require('./passwordUtils');

// OTP Storage (in production, use Redis or database)
const otpStore = new Map();

// Email transporter configuration
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log('📧 Email Config Check:');
  console.log('   User:', emailUser ? '✅ Set' : '❌ Missing');
  console.log('   Pass:', emailPass ? '✅ Set' : '❌ Missing');
  
  if (!emailUser || !emailPass) {
    console.error('❌ Email credentials missing in environment variables!');
    throw new Error('Email credentials not configured');
  }
  
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT Token
const generateToken = (userId, userType, userName) => {
  return jwt.sign(
    { userId, userType, userName },
    process.env.JWT_SECRET || 'default-secret-key',
    { expiresIn: '24h' }
  );
};

// Send OTP Email
const sendOTPEmail = async (email, otp, userName, userType = 'User') => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"FYP Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Password Reset OTP - FYP Portal',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-family: Arial, sans-serif;">
                      🎓 FYP Portal
                    </h1>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; font-family: Arial, sans-serif;">
                      Department of Computer Science
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0; font-family: Arial, sans-serif; font-size: 24px;">
                      Password Reset Request
                    </h2>
                    
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; font-family: Arial, sans-serif;">
                      Hello <strong style="color: #333333;">${userName}</strong>,
                    </p>
                    
                    <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; font-family: Arial, sans-serif;">
                      We received a request to reset your password for your <strong>${userType}</strong> account. 
                      Please use the following One-Time Password (OTP) to proceed:
                    </p>
                    
                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; display: inline-block;">
                            <p style="color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                              ${otp}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Important Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                      <tr>
                        <td>
                          <p style="color: #856404; font-size: 14px; margin: 0; font-family: Arial, sans-serif;">
                            ⏰ <strong>Important:</strong> This OTP is valid for <strong>10 minutes</strong> only.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; font-family: Arial, sans-serif;">
                      If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
                    <p style="color: #999999; font-size: 12px; margin: 0; text-align: center; font-family: Arial, sans-serif;">
                      This is an automated email from FYP Portal<br>
                      Quaid Azam University Islamabad<br>
                      <a href="mailto:${process.env.EMAIL_USER}" style="color: #667eea; text-decoration: none;">${process.env.EMAIL_USER}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', email);
    console.log('   Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Request Password Reset
const requestPasswordReset = async (email, userType, Model) => {
  try {
    console.log(`📧 Password reset requested for ${userType}:`, email);
    
    const user = await Model.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return { 
        success: false, 
        message: 'No account found with this email address' 
      };
    }

    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP with expiry
    otpStore.set(email, {
      otp,
      expiry: otpExpiry,
      userType,
      verified: false
    });

    console.log(`🔑 Generated OTP for ${email}:`, otp);

    // Send OTP via email with user type
    const userName = user.name || 'User';
    const userTypeCapitalized = userType.charAt(0).toUpperCase() + userType.slice(1);
    const emailResult = await sendOTPEmail(email, otp, userName, userTypeCapitalized);

    if (!emailResult.success) {
      console.error('❌ Failed to send email:', emailResult.error);
      return {
        success: false,
        message: 'Failed to send OTP email. Please check your email configuration.'
      };
    }

    console.log('✅ OTP sent successfully to:', email);
    return {
      success: true,
      message: 'OTP sent successfully to your email',
      email
    };
  } catch (error) {
    console.error('❌ Password reset request error:', error);
    return {
      success: false,
      message: 'Internal server error'
    };
  }
};

// Verify OTP
const verifyOTP = (email, otp) => {
  const storedData = otpStore.get(email);

  if (!storedData) {
    return {
      success: false,
      message: 'No OTP request found. Please request a new OTP.'
    };
  }

  if (Date.now() > storedData.expiry) {
    otpStore.delete(email);
    return {
      success: false,
      message: 'OTP has expired. Please request a new one.'
    };
  }

  if (storedData.otp !== otp) {
    return {
      success: false,
      message: 'Invalid OTP. Please try again.'
    };
  }

  // Mark as verified
  storedData.verified = true;
  otpStore.set(email, storedData);

  return {
    success: true,
    message: 'OTP verified successfully'
  };
};

// Reset Password with Hashing
const resetPassword = async (email, newPassword, Model) => {
  try {
    const storedData = otpStore.get(email);

    if (!storedData || !storedData.verified) {
      return {
        success: false,
        message: 'Please verify OTP first'
      };
    }

    // Hash the new password
    console.log('🔐 Hashing new password...');
    const hashedPassword = await hashPassword(newPassword);

    // Update password with hashed version
    const user = await Model.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Clear OTP data
    otpStore.delete(email);

    console.log('✅ Password reset successfully for:', email);

    return {
      success: true,
      message: 'Password reset successfully'
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      message: 'Internal server error'
    };
  }
};

// Enhanced Login with JWT and Password Hashing
const enhancedLogin = async (email, password, userType, Model) => {
  try {
    // Find user by email only
    const user = await Model.findOne({ email });
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Compare password with hashed password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Generate JWT token
    const token = generateToken(
      user._id,
      userType,
      user.name || 'User'
    );

    console.log(`✅ ${userType} login successful:`, email);

    return {
      success: true,
      message: `${userType} login successful`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        ...(user.studentId && { studentId: user.studentId }),
        ...(user.teacherId && { teacherId: user.teacherId })
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Internal server error'
    };
  }
};

module.exports = {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
  enhancedLogin,
  generateToken
};
