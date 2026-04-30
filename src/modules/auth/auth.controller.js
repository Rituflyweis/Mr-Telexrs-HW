/**
 * Auth Controller - Refactored with optimizations
 */

const otpService = require('./otp.service');
const authService = require('./auth.service');
const loginHistoryService = require('./loginHistory.service');
const User = require('../../models/User.model');
const { isEmail, generateTokens, verifyAndActivateUser, deactivateUser, updateUserToken } = require('../../helpers');

// =============================================
// REGISTRATION & VERIFICATION
// =============================================

/**
 * Register new user
 */
exports.register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      countryCode,
      email,
      agreeConfirmation,
      password
    } = req.body;

    if (!phoneNumber || !countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and country code are required'
      });
    }

    // Register user
    const user = await authService.register({
      firstName,
      lastName,
      phoneNumber,
      countryCode,
      email,
      agreeConfirmation,
      password: password || phoneNumber.slice(-6)
    });

    // ✅ Get REAL OTP from service
    const otpCode = await otpService.sendOtp(phoneNumber, countryCode);

    res.status(201).json({
      success: true,
      message: 'Registered successfully. OTP generated.',
      data: {
        userId: user._id,
        otp: otpCode     // ✅ Real OTP in response
      }
    });

  } catch (err) {
    next(err);
  }
};


/**
 * Verify OTP (for registration)
 */
exports.verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;
    const user = await otpService.verifyOtp(phoneNumber, otp);
    if (!user) {
      loginHistoryService.trackFailedLogin(req, phoneNumber, 'otp', 'Invalid or expired OTP');
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    const freshUser = await verifyAndActivateUser(user._id);
    const tokens = generateTokens(freshUser);
    if (tokens) {
      const freshUser13 = await updateUserToken(user._id, tokens.accessToken);
      loginHistoryService.trackLogin(req, freshUser, 'otp');
      res.status(200).json({
        success: true,
        message: 'OTP verified. Login successful.',
        data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: freshUser }
      });
    }
  } catch (err) { next(err); }
};

/**
 * Resend OTP
 */
exports.resendOtp = async (req, res, next) => {
  try {
    const { phoneNumber, countryCode } = req.body;

    if (!phoneNumber || !countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and country code are required'
      });
    }

    // ✅ Wait for REAL OTP
    const otpCode = await otpService.resendOtp(phoneNumber, countryCode);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        otp: otpCode   // ✅ Real OTP returned
      }
    });

  } catch (err) {
    next(err);
  }
};


// =============================================
// LOGIN METHODS
// =============================================

/**
 * Login with password
 */
exports.login = async (req, res, next) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/Phone and password required' });
    }

    const user = await authService.loginWithPassword(identifier, password);
    if (!user) {
      loginHistoryService.trackFailedLogin(req, identifier, 'password', 'Invalid credentials');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const tokens = generateTokens(user, rememberMe);
    if (tokens) {
      const freshUser13 = await updateUserToken(user._id, tokens.accessToken);
      loginHistoryService.trackLogin(req, user, 'password');

      res.status(200).json({ success: true, message: 'Login successful', data: { user: freshUser13, tokens } });
    }
  } catch (err) { next(err); }
};

/**
 * Doctor login with password
 */
exports.doctorLogin = async (req, res, next) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/Phone and password required' });
    }

    const { user, doctor } = await authService.doctorLoginWithPassword(identifier, password);
    const tokens = generateTokens(user, rememberMe);
    if (tokens) {
      const freshUser13 = await updateUserToken(user._id, tokens.accessToken);
      loginHistoryService.trackLogin(req, user, 'password');
      res.status(200).json({
        success: true,
        message: 'Doctor login successful',
        data: { user, doctor, tokens }
      });
    }
  } catch (err) {
    if (err.statusCode === 401 || err.statusCode === 404) {
      loginHistoryService.trackFailedLogin(req, req.body.identifier, 'password', err.message);
    }
    next(err);
  }
};

/**
 * Login with OTP
 */
exports.loginWithOtp = async (req, res, next) => {
  try {
    const { identifier, otp, countryCode } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required'
      });
    }

    // ✅ STEP 1 — Send OTP (REAL)
    if (!otp) {
      const otpCode = await otpService.sendLoginOtp(
        identifier,
        countryCode || '+91'
      );

      return res.status(200).json({
        success: true,
        message: `OTP sent successfully`,
        data: {
          identifier,

          // 👇 Show OTP only outside production
          ...(process.env.NODE_ENV !== 'production' && {
            otp: otpCode
          }),

          method: isEmail(identifier) ? 'email' : 'phone'
        }
      });
    }

    // ✅ STEP 2 — Verify OTP
    const user = await otpService.verifyOtp(identifier, otp);

    if (!user) {
      loginHistoryService.trackFailedLogin(
        req,
        identifier,
        'otp',
        'Invalid or expired OTP'
      );

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // ✅ Activate user
    const freshUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { isActive: true, lastLoginAt: new Date() } },
      { new: true }
    )
      .select('-password')
      .lean();

    const tokens = generateTokens(freshUser);
    if (tokens) {
      const freshUser13 = await updateUserToken(freshUser._id, tokens.accessToken);
      loginHistoryService.trackLogin(req, freshUser, 'otp');
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: freshUser13,
          tokens
        }
      });
    }
  } catch (err) {
    next(err);
  }
};


// =============================================
// TOKEN MANAGEMENT
// =============================================

/**
 * Refresh token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, message: 'Token refreshed', data: result });
  } catch (err) { next(err); }
};

/**
 * Logout
 */
exports.logout = async (req, res, next) => {
  try {
    const user = await deactivateUser(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: { user }
    });
  } catch (err) { next(err); }
};

// =============================================
// PASSWORD MANAGEMENT
// =============================================

/**
 * Send OTP (standalone endpoint)
 */
exports.sendOtp = async (req, res, next) => {
  try {
    const { phoneNumber, countryCode } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number required' });
    }

    // Send OTP asynchronously (non-blocking)
    otpService.sendOtp(phoneNumber, countryCode || '+91').catch(err => {
      console.error('OTP send failed:', err.message);
    });

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err) { next(err); }
};

/**
 * Forgot password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { identifier, countryCode } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required'
      });
    }

    // ✅ Wait for OTP generation + sending
    const forgotPasswordResult = await authService.forgotPassword(
      identifier,
      countryCode || '+91'
    );

    return res.status(200).json({
      success: true,
      message: forgotPasswordResult.message || 'OTP sent successfully',
      data: {
        identifier,
        ...(process.env.NODE_ENV !== 'production' && { otp: forgotPasswordResult.otp }),
        ...(forgotPasswordResult.delivery && { delivery: forgotPasswordResult.delivery })
      }
    });

  } catch (err) {
    next(err);
  }
};


/**
 * Reset password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email/Phone, OTP and new password are required'
      });
    }

    await authService.resetPassword(identifier, otp, newPassword);
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (err) { next(err); }
};

/**
 * Change password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old and new password required' });
    }

    await authService.changePassword(req.user.id, oldPassword, newPassword);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
};

// =============================================
// SOCIAL LOGIN
// =============================================

/**
 * Login with Google (ID Token)
 */
exports.loginWithGoogle = async (req, res, next) => {
  try {
    const { googleToken, rememberMe } = req.body;

    if (!googleToken) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }

    const user = await authService.loginWithGoogle(googleToken);
    const tokens = generateTokens(user, rememberMe);
    if (tokens) {
      const freshUser13 = await updateUserToken(user._id, tokens.accessToken);
      loginHistoryService.trackLogin(req, user, 'google');
      res.status(200).json({
        success: true,
        message: 'Google login successful',
        data: { user, tokens }
      });
    }
  } catch (err) {
    if (err.message?.includes('Google')) {
      loginHistoryService.trackFailedLogin(req, 'google_token', 'google', err.message);
    }
    next(err);
  }
};

/**
 * Login with Facebook
 */
exports.loginWithFacebook = async (req, res, next) => {
  try {
    const { facebookToken, rememberMe } = req.body;

    if (!facebookToken) {
      return res.status(400).json({ success: false, message: 'Facebook token is required' });
    }

    const user = await authService.loginWithFacebook(facebookToken);
    const tokens = generateTokens(user, rememberMe);
    if (tokens) {
      const freshUser13 = await updateUserToken(user._id, tokens.accessToken);
      loginHistoryService.trackLogin(req, user, 'facebook');
      res.status(200).json({
        success: true,
        message: 'Facebook login successful',
        data: { user, tokens }
      });
    }
  } catch (err) {
    if (err.message?.includes('Facebook')) {
      loginHistoryService.trackFailedLogin(req, 'facebook_token', 'facebook', err.message);
    }
    next(err);
  }
};

/**
 * Google OAuth Redirect (Server-side flow)
 */
exports.googleRedirect = async (req, res, next) => {
  try {
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/v1/auth/google/callback'
    );

    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      prompt: 'consent'
    });

    res.redirect(authUrl);
  } catch (err) { next(err); }
};

/**
 * Google OAuth Callback (Server-side flow)
 */
exports.googleCallback = async (req, res, next) => {
  try {
    const { code, error, format } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (error) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code is required' });
    }

    const user = await authService.loginWithGoogleCode(code);
    const tokens = generateTokens(user, true);
    if (tokens) {
      const freshUser13 = await updateUserToken(user._id, tokens.accessToken);

      loginHistoryService.trackLogin(req, user, 'google');

      // Return JSON for API testing
      if (format === 'json') {
        return res.status(200).json({
          success: true,
          message: 'Google login successful',
          data: { user, tokens }
        });
      }

      // Redirect to frontend with tokens
      res.redirect(`${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
    }
  } catch (err) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(err.message || 'Google login failed')}`);
  }
};
