/**
 * Patient Service - Profile management
 * Refactored to use shared helpers
 */

const Patient = require('../../models/Patient.model');
const User = require('../../models/User.model');
const AppError = require('../../utils/AppError');
const {
  getPatient,
  getDefaultAddress,
  formatPatientProfile,
  normalizeProfileData,
  extractUserUpdateFields
} = require('../../helpers');
const healthwarehouse = require('../../helpers/healthwarehouse.helper');

/**
 * Get patient profile
 */
exports.getProfile = async (userId) => {
  // Get patient with user populated
  const patient = await getPatient(userId, { populate: true });
  // Get default address
  const address = await getDefaultAddress(patient._id);

  return formatPatientProfile(patient, address);
};

/**
 * Update patient profile
 */

exports.updateProfile = async (userId, data) => {
  // Extract and normalize data
  const patientData = normalizeProfileData(data);
  const userUpdate = extractUserUpdateFields(data);

  const userResult = Object.keys(userUpdate).length > 0
    ? await User.findByIdAndUpdate(userId, userUpdate, { new: true })
    : await User.findById(userId);
    
  if (!userResult) throw new AppError('User not found', 404);

  let patient = await Patient.findOne({ user: userId });
  
  if (!patient) {
    patient = new Patient({ user: userId, ...patientData });
  } else {
    Object.assign(patient, patientData);
  }

  const address = await getDefaultAddress(patient._id);
  
  
  if (!patient.hw_patient_id && patient.hw_customer_id) {
    try {
      const patientCreated = await healthwarehouse.createPatient(userResult, patient, patient.hw_customer_id);
      patient.hw_patient_id = patientCreated.hw_patient_id;
      console.log(`Created HW patient ${patient.hw_patient_id} for customer ${patient.hw_customer_id}`);
    } catch (error) {
      console.error('Failed to create HW patient:', error.response?.data || error.message);
    }
  }
  
  else if (!patient.hw_customer_id) {
    console.warn('Cannot create HW patient: No HW customer ID found');
  }
  
  await patient.save();
  
  const patientWithUser = { ...patient.toObject(), user: userResult.toObject() };
  
  return formatPatientProfile(patientWithUser, address);
};
