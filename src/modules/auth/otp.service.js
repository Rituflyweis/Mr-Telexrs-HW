/**
 * OTP Service - Refactored with helpers and optimized
 */

const Otp = require('../../models/Otp.model');
const User = require('../../models/User.model');
const AppError = require('../../utils/AppError');
const emailService = require('../../utils/email.service');
const smsService = require('../../utils/sms.service');
const {
  isEmail,
  normalizeIdentifier,
  buildIdentifierQuery,
  buildIdentifierOrQuery,
  generateOtp,
  getOtpExpiry
} = require('../../helpers');

const formatE164 = (countryCode, phoneNumber) => {
  const cc = countryCode ? countryCode.replace(/\D/g, '') : '';
  const pn = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
  return cc ? `+${cc}${pn}` : phoneNumber;
};

/**
 * Create or update OTP document
 * @private
 */
const upsertOtp = async (query, otpData) => {
  const otpCode = generateOtp();
  const expiresAt = getOtpExpiry();

  const update = {
    otp: otpCode,
    expiresAt,
    ...otpData
  };

  await Otp.findOneAndUpdate(
    query,
    { $set: update },
    { upsert: true, new: true }
  );

  return otpCode;
};

/**
 * Send OTP for registration (requires user to exist)
 */
exports.sendOtp = async (phoneNumber, countryCode) => {
  const user = await User.findOne({ phoneNumber }).select('email countryCode').lean();
  if (!user) throw new AppError('User not found', 404);

  const otpCode = await upsertOtp(
    { phoneNumber },
    { phoneNumber, countryCode, type: 'phone' }
  );

  let smsSent = false;
  let emailSent = false;

  // Send via SMS
  const e164Phone = formatE164(countryCode || user.countryCode, phoneNumber);
  try {
    await smsService.sendOtpSMS(e164Phone, otpCode);
    console.log(`📲 Registration OTP sent via SMS to ${e164Phone}`);
    smsSent = true;
  } catch (error) {
    console.error(`Failed to send Registration OTP SMS to ${phoneNumber}:`, error.message);
  }

  // Also send via Email if available
  if (user.email) {
    try {
      await emailService.sendOtpEmail(user.email, otpCode, 'login');
      console.log(`📧 Registration OTP also sent to email ${user.email}`);
      emailSent = true;
    } catch (error) {
      console.error(`Failed to send Registration OTP email to ${user.email}:`, error.message);
    }
  }

  if (!smsSent && (!user.email || !emailSent)) {
    throw new AppError('Failed to deliver OTP. Check phone number or try again later.', 500);
  }

  return otpCode;
};

/**
 * Send OTP for login (accepts email or phone)
 */
exports.sendLoginOtp = async (identifier, countryCode) => {
  // Verify user exists
  const user = await User.findOne(buildIdentifierOrQuery(identifier)).select('_id email phoneNumber countryCode').lean();
  if (!user) throw new AppError('User not found. Please register first.', 404);

  const isEmailId = isEmail(identifier);
  const normalized = normalizeIdentifier(identifier);

  const query = isEmailId ? { email: normalized } : { phoneNumber: identifier };
  const otpData = isEmailId
    ? { email: normalized, type: 'email' }
    : { phoneNumber: identifier, countryCode, type: 'phone' };

  const otpCode = await upsertOtp(query, otpData);

  let smsSent = false;
  let emailSent = false;

  // Send OTP (Try both email and SMS if user data allows)
  const sendEmail = isEmailId ? normalized : user.email;
  const rawPhone = isEmailId ? user.phoneNumber : identifier;
  const phoneCC = isEmailId ? user.countryCode : countryCode;
  const sendPhone = rawPhone ? formatE164(phoneCC || user.countryCode, rawPhone) : null;

  if (sendPhone) {
    try {
      await smsService.sendOtpSMS(sendPhone, otpCode);
      console.log(`📲 Login OTP sent via SMS to ${sendPhone}`);
      smsSent = true;
    } catch (error) {
      console.error(`Failed to send Login OTP SMS to ${sendPhone}:`, error.message);
    }
  }

  if (sendEmail) {
    try {
      await emailService.sendOtpEmail(sendEmail, otpCode, 'login');
      console.log(`📧 Login OTP sent to email ${sendEmail}`);
      emailSent = true;
    } catch (error) {
      console.error(`Failed to send Login OTP email to ${sendEmail}:`, error.message);
    }
  }

  if (!smsSent && !emailSent) {
    console.warn(`OTP delivery failed for ${identifier} — OTP saved to DB, use master OTP to verify`);
  }

  return otpCode;
};

/**
 * Send OTP for password reset (accepts email or phone)
 */
exports.sendPasswordResetOtp = async (identifier, countryCode) => {
  // Verify user exists
  const user = await User.findOne(buildIdentifierOrQuery(identifier)).select('_id email phoneNumber countryCode').lean();
  if (!user) throw new AppError('User not found', 404);

  const isEmailId = isEmail(identifier);
  const normalized = normalizeIdentifier(identifier);

  const query = isEmailId ? { email: normalized } : { phoneNumber: identifier };
  const otpData = isEmailId
    ? { email: normalized, type: 'email' }
    : { phoneNumber: identifier, countryCode, type: 'phone' };

  const otpCode = await upsertOtp(query, otpData);

  // Send OTP (Try both email and SMS if user data allows)
  const sendEmail = isEmailId ? normalized : user.email;
  const rawResetPhone = isEmailId ? user.phoneNumber : identifier;
  const resetPhoneCC = isEmailId ? user.countryCode : countryCode;
  const sendPhone = rawResetPhone ? formatE164(resetPhoneCC || user.countryCode, rawResetPhone) : null;

  if (sendPhone) {
    try {
      await smsService.sendOtpSMS(sendPhone, otpCode);
      console.log(`📲 Password reset OTP sent via SMS to ${sendPhone}`);
    } catch (error) {
      console.error(`Failed to send Password Reset OTP SMS to ${sendPhone}:`, error.message);
    }
  }

  if (sendEmail) {
    try {
      await emailService.sendOtpEmail(sendEmail, otpCode, 'password-reset');
      console.log(`📧 Password reset OTP sent to email ${sendEmail}`);
    } catch (error) {
      console.error(`Failed to send Password Reset OTP email to ${sendEmail}:`, error.message);
    }
  }

  return otpCode;
};

/**
 * Verify OTP (accepts email or phone) - BYPASSED BY DEFAULT
 */
exports.verifyOtp = async (identifier, otp) => {
  const isEmailId = isEmail(identifier);
  const query = isEmailId ? { email: normalizeIdentifier(identifier) } : { phoneNumber: identifier };

  // Master OTP bypass for development/trial account limitations
  const isMasterOtp = otp === '000000';

  if (!isMasterOtp) {
    const otpDoc = await Otp.findOne(query).lean();
    if (!otpDoc || otpDoc.otp !== otp || new Date() > new Date(otpDoc.expiresAt)) {
      return false;
    }
  }

  const user = await User.findOneAndUpdate(
    buildIdentifierOrQuery(identifier),
    { $set: { isVerified: true } },
    { new: true }
  ).select('-password').lean();

  return user || false;
};

/**
 * Resend OTP with rate limiting
 */
exports.resendOtp = async (phoneNumber, countryCode) => {
  const otpDoc = await Otp.findOne({ phoneNumber }).select('updatedAt').lean();

  if (otpDoc) {
    const diffMinutes = (Date.now() - new Date(otpDoc.updatedAt).getTime()) / 1000 / 60;
    if (diffMinutes < 1) {
      throw new AppError('Wait at least 1 minute before requesting new OTP', 429);
    }
  }

  return await exports.sendOtp(phoneNumber, countryCode);
};
