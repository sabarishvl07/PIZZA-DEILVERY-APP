const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');
const { protect } = require('../middleware/authMiddleware');

// JWT Generator helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Determine role (default 'user', but check if provided for development seeding/admin creation)
    const userRole = role === 'admin' ? 'admin' : 'user';

    // In dev mode (placeholder email), auto-verify user so they can log in immediately
    const isDevMode = !process.env.EMAIL_USER ||
      process.env.EMAIL_USER === 'placeholder-email@gmail.com';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      verificationToken: isDevMode ? undefined : verificationToken,
      isVerified: isDevMode ? true : false
    });

    let emailPreviewUrl = null;

    if (!isDevMode) {
      // Only attempt email in production with real credentials
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
      const emailHtml = `
        <h1>Pizza Delivery App Verification</h1>
        <p>Hello ${name},</p>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" target="_blank" style="display:inline-block;background:#00c853;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;font-weight:bold;">Verify Email</a>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      `;
      try {
        const emailResult = await sendEmail({
          to: email,
          subject: 'Verify your Pizza Delivery Account',
          html: emailHtml
        });
        emailPreviewUrl = emailResult.previewUrl || null;
      } catch (emailErr) {
        console.warn('Email send failed (non-fatal):', emailErr.message);
      }
    }

    res.status(201).json({
      message: isDevMode
        ? 'Registration successful! You can now log in.'
        : 'Registration successful! Please check your email to verify your account.',
      emailPreview: emailPreviewUrl,
      devMode: isDevMode
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error, registration failed' });
  }
});

// @desc    Verify email address
// @route   GET /api/auth/verify/:token
// @access  Public
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      message: 'Email successfully verified! You can now log in.',
      email: user.email
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verify email check
    if (!user.isVerified) {
      return res.status(400).json({ error: 'Please verify your email before logging in.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No user registered with this email address' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const emailHtml = `
      <h1>Password Reset Request</h1>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Click the link below to reset your password. This link is valid for 1 hour:</p>
      <a href="${resetUrl}" target="_blank" style="display:inline-block;background:#e53935;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;font-weight:bold;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    const emailResult = await sendEmail({
      to: email,
      subject: 'Reset your Pizza Delivery Password',
      html: emailHtml
    });

    res.json({
      message: 'Password reset link sent to your email.',
      emailPreview: emailResult.previewUrl || null
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Please enter a new password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear reset tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful! You can now log in.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc    Get user profile (useful for checking session validity)
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
