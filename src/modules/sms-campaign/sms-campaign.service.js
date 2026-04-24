const SMSCampaign = require('../../models/SMSCampaign.model');
const Patient = require('../../models/Patient.model');
const User = require('../../models/User.model');
const AppError = require('../../utils/AppError');
const smsService = require('../../utils/sms.service');

// Get recipients based on audience
const getRecipients = async (audience, customRecipients = []) => {
  let patients = [];

  switch (audience) {
    case 'all_patients':
      patients = await Patient.find({ isActive: true }).populate('user', 'phoneNumber firstName lastName');
      break;
    case 'active_patients':
      patients = await Patient.find({ isActive: true }).populate('user', 'phoneNumber firstName lastName');
      break;
    case 'inactive_patients':
      patients = await Patient.find({ isActive: false }).populate('user', 'phoneNumber firstName lastName');
      break;
    case 'custom':
      if (!customRecipients || customRecipients.length === 0) {
        throw new AppError('Custom recipients are required when audience is custom', 400);
      }
      patients = await Patient.find({
        _id: { $in: customRecipients },
        isActive: true
      }).populate('user', 'phoneNumber firstName lastName');
      break;
    default:
      patients = await Patient.find({ isActive: true }).populate('user', 'phoneNumber firstName lastName');
  }

  // Filter patients with valid phone numbers
  return patients.filter(patient => patient.user && patient.user.phoneNumber);
};

// Create SMS campaign
exports.createSMSCampaign = async (data, userId) => {
  try {
    const campaignData = {
      message: data.message,
      audience: data.audience || 'all_patients',
      customRecipients: data.customRecipients || [],
      scheduleType: data.scheduleType || 'send_now',
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      status: data.scheduleType === 'scheduled' ? 'scheduled' : 'processing',
      createdBy: userId
    };
    let recipients = [];
    if (campaignData.scheduleType === 'send_now') {
      recipients = await getRecipients(
        campaignData.audience,
        campaignData.customRecipients
      );

      campaignData.totalRecipients = recipients.length;
      campaignData.sentCount = 0;
      campaignData.failedCount = 0;

      // 🔥 Batch sending (IMPORTANT for large data)
      const BATCH_SIZE = 50;

      for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE);

        await Promise.allSettled(
          batch.map(async (patient) => {
            try {
              await smsService.sendSMS(patient.user.phoneNumber, data.message);
              campaignData.sentCount++;
            } catch (err) {
              campaignData.failedCount++;
              console.error('SMS failed:', err.message);
            }
          })
        );
      }

      campaignData.status = 'completed';
    }

    const campaign = await SMSCampaign.create(campaignData);

    return campaign;

  } catch (error) {
    throw new AppError(error.message || 'Failed to create SMS campaign', 500);
  }
};

// Get all SMS campaigns
exports.getAllSMSCampaigns = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    audience
  } = query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (audience) {
    filter.audience = audience;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const campaigns = await SMSCampaign.find(filter)
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await SMSCampaign.countDocuments(filter);

  return {
    campaigns,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  };
};

// Get SMS campaign by ID
exports.getSMSCampaignById = async (campaignId) => {
  const campaign = await SMSCampaign.findById(campaignId)
    .populate('createdBy', 'firstName lastName email')
    .populate('customRecipients', 'user')
    .lean();

  if (!campaign) {
    throw new AppError('SMS campaign not found', 404);
  }

  return campaign;
};

// Update SMS campaign
exports.updateSMSCampaign = async (campaignId, data) => {
  const campaign = await SMSCampaign.findById(campaignId);

  if (!campaign) {
    throw new AppError('SMS campaign not found', 404);
  }

  if (campaign.status === 'sent') {
    throw new AppError('Cannot update a campaign that has already been sent', 400);
  }

  if (data.message !== undefined) campaign.message = data.message;
  if (data.audience !== undefined) campaign.audience = data.audience;
  if (data.customRecipients !== undefined) campaign.customRecipients = data.customRecipients;
  if (data.scheduleType !== undefined) campaign.scheduleType = data.scheduleType;
  if (data.scheduledAt !== undefined) {
    campaign.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
  }

  if (data.scheduleType === 'scheduled' && campaign.scheduledAt) {
    campaign.status = 'scheduled';
  } else if (data.scheduleType === 'send_now') {
    campaign.status = 'draft';
  }

  await campaign.save();
  return campaign;
};

// Send SMS campaign
exports.sendSMSCampaign = async (campaignId) => {
  const campaign = await SMSCampaign.findById(campaignId);

  if (!campaign) {
    throw new AppError('SMS campaign not found', 404);
  }

  if (campaign.status === 'sent') {
    throw new AppError('Campaign has already been sent', 400);
  }

  if (campaign.status === 'sending') {
    throw new AppError('Campaign is currently being sent', 400);
  }

  const recipients = await getRecipients(campaign.audience, campaign.customRecipients);

  if (recipients.length === 0) {
    throw new AppError('No recipients found for this campaign', 400);
  }

  campaign.status = 'sending';
  campaign.totalRecipients = recipients.length;
  campaign.sentAt = new Date();
  await campaign.save();

  let sentCount = 0;
  let failedCount = 0;

  try {
    // Send SMS to each recipient
    for (const patient of recipients) {
      try {
        await smsService.sendSMS(patient.user.phoneNumber, campaign.message);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send SMS to ${patient.user.phoneNumber}:`, error);
        failedCount++;
      }
    }

    campaign.status = 'sent';
    campaign.sentCount = sentCount;
    campaign.failedCount = failedCount;
    await campaign.save();

    return {
      success: true,
      totalRecipients: recipients.length,
      sentCount,
      failedCount
    };
  } catch (error) {
    campaign.status = 'failed';
    await campaign.save();
    throw new AppError(`Failed to send campaign: ${error.message}`, 500);
  }
};

// Delete SMS campaign
exports.deleteSMSCampaign = async (campaignId) => {
  const campaign = await SMSCampaign.findById(campaignId);

  if (!campaign) {
    throw new AppError('SMS campaign not found', 404);
  }

  if (campaign.status === 'sent' || campaign.status === 'sending') {
    throw new AppError('Cannot delete a campaign that has been sent or is being sent', 400);
  }

  await SMSCampaign.findByIdAndDelete(campaignId);

  return { message: 'SMS campaign deleted successfully' };
};

// Cancel scheduled campaign
exports.cancelScheduledCampaign = async (campaignId) => {
  const campaign = await SMSCampaign.findById(campaignId);

  if (!campaign) {
    throw new AppError('SMS campaign not found', 404);
  }

  if (campaign.status !== 'scheduled') {
    throw new AppError('Only scheduled campaigns can be cancelled', 400);
  }

  campaign.status = 'cancelled';
  await campaign.save();

  return { message: 'Scheduled campaign cancelled successfully' };
};

