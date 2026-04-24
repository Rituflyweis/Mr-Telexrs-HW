const patientService = require('./patient.service');
const SubAdmin = require('../../models/SubAdmin.model');
// Get profile
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await patientService.getProfile(req.user.id);
    let permission = [];
    const subAdmin = await SubAdmin.findOne({ user: req.user.id })
    if (subAdmin) {
      permission = subAdmin.permissions;
    }
    res.status(200).json({ success: true, data: profile, permission: permission });
  } catch (err) { next(err); }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const profile = await patientService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: profile });
  } catch (err) { next(err); }
};

