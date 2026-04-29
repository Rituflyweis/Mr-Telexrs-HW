const IntakeForm = require('../../models/IntakeForm.model');
const Patient = require('../../models/Patient.model');
const Doctor = require('../../models/Doctor.model');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');
const healthwarehouse = require('../../helpers/healthwarehouse.helper');
const mongoose = require('mongoose');

const BASIC_INFORMATION_REQUIRED_FIELDS = ['firstName', 'lastName', 'sex', 'dateOfBirth'];
const EMERGENCY_CONTACT_REQUIRED_FIELDS = ['relationship', 'firstName', 'lastName', 'phone'];

const hasValue = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
};

const getMissingRequiredFields = (payload = {}, requiredFields = []) =>
  requiredFields.filter((field) => !hasValue(payload?.[field]));

const computeMedicalQuestionsCompleteness = (medicalQuestions = {}) => (
  (Array.isArray(medicalQuestions.pastMedicalHistory) && medicalQuestions.pastMedicalHistory.length > 0) ||
  (Array.isArray(medicalQuestions.currentMedications) && medicalQuestions.currentMedications.length > 0) ||
  (Array.isArray(medicalQuestions.medicationAllergies) && medicalQuestions.medicationAllergies.length > 0) ||
  hasValue(medicalQuestions.howDidYouHearAboutUs)
);

const computeIntakeFormCompleteness = (intakeForm = {}) => {
  const basicInformation = intakeForm.basicInformation || {};
  const emergencyContact = intakeForm.emergencyContact || {};
  const medicalQuestions = intakeForm.medicalQuestions || {};

  const basicInfoMissingFields = getMissingRequiredFields(
    basicInformation,
    BASIC_INFORMATION_REQUIRED_FIELDS
  );
  const emergencyContactMissingFields = getMissingRequiredFields(
    emergencyContact,
    EMERGENCY_CONTACT_REQUIRED_FIELDS
  );
  const isMedicalQuestionsComplete = computeMedicalQuestionsCompleteness(medicalQuestions);

  const missingSections = [];
  if (basicInfoMissingFields.length) {
    missingSections.push({
      section: 'basicInformation',
      missingFields: basicInfoMissingFields
    });
  }
  if (emergencyContactMissingFields.length) {
    missingSections.push({
      section: 'emergencyContact',
      missingFields: emergencyContactMissingFields
    });
  }
  if (!isMedicalQuestionsComplete) {
    missingSections.push({
      section: 'medicalQuestions',
      missingFields: ['At least one medical question response is required']
    });
  }

  return {
    isBasicInfoComplete: basicInfoMissingFields.length === 0,
    isEmergencyContactComplete: emergencyContactMissingFields.length === 0,
    isMedicalQuestionsComplete,
    isComplete: missingSections.length === 0,
    missingSections
  };
};

// Get patient from userId - create if doesn't exist
const getPatient = async (userId) => {
  let patient = await Patient.findOne({ user: userId }).populate('user');
  if (!patient) {
    // Create patient profile if it doesn't exist
    patient = await Patient.create({ user: userId, isActive: true });
  }
  return patient;
};

// Get intake form
exports.getIntakeForm = async (userId) => {
  const patient = await getPatient(userId);
  let intakeForm = await IntakeForm.findOne({ patient: patient._id })
    .populate({
      path: 'doctor',
      select: 'user specialty licenseNumber consultationFee status rating experience education certifications languages availability address',
      populate: {
        path: 'user',
        select: 'firstName lastName email phoneNumber countryCode profilePicture'
      }
    });

  if (!intakeForm) {
    intakeForm = await IntakeForm.create({ patient: patient._id });
  }

  return intakeForm;
};

// Save Basic Information
exports.saveBasicInformation = async (userId, data) => {
  const patient = await getPatient(userId);
  let intakeForm = await IntakeForm.findOne({ patient: patient._id });

  const existingBasicInformation = intakeForm?.basicInformation?.toObject?.() || {};
  const mergedBasicInformation = { ...existingBasicInformation, ...data };
  const isComplete = getMissingRequiredFields(
    mergedBasicInformation,
    BASIC_INFORMATION_REQUIRED_FIELDS
  ).length === 0;

  const basicInfoData = {
    ...mergedBasicInformation,
    isBasicInfoComplete: isComplete
  };

  if (!intakeForm) {
    intakeForm = await IntakeForm.create({
      patient: patient._id,
      basicInformation: basicInfoData
    });
  } else {
    intakeForm.basicInformation = {
      ...intakeForm.basicInformation,
      ...basicInfoData
    };
    await intakeForm.save();
  }

  // Populate doctor before returning
  return await IntakeForm.findById(intakeForm._id)
    .populate({
      path: 'doctor',
      select: 'user specialty licenseNumber consultationFee status rating experience education certifications languages availability address',
      populate: {
        path: 'user',
        select: 'firstName lastName email phoneNumber countryCode profilePicture'
      }
    });
};

// Save Emergency Contact
exports.saveEmergencyContact = async (userId, data) => {
  const patient = await getPatient(userId);
  let intakeForm = await IntakeForm.findOne({ patient: patient._id });

  const existingEmergencyContact = intakeForm?.emergencyContact?.toObject?.() || {};
  const mergedEmergencyContact = { ...existingEmergencyContact, ...data };
  const isComplete = getMissingRequiredFields(
    mergedEmergencyContact,
    EMERGENCY_CONTACT_REQUIRED_FIELDS
  ).length === 0;

  const emergencyContactData = {
    ...mergedEmergencyContact,
    isEmergencyContactComplete: isComplete
  };

  if (!intakeForm) {
    intakeForm = await IntakeForm.create({
      patient: patient._id,
      emergencyContact: emergencyContactData
    });
  } else {
    intakeForm.emergencyContact = {
      ...intakeForm.emergencyContact,
      ...emergencyContactData
    };
    await intakeForm.save();
  }

  // Populate doctor before returning
  return await IntakeForm.findById(intakeForm._id)
    .populate({
      path: 'doctor',
      select: 'user specialty licenseNumber consultationFee status rating experience education certifications languages availability address',
      populate: {
        path: 'user',
        select: 'firstName lastName email phoneNumber countryCode profilePicture'
      }
    });
};

// Save Medical Questions
exports.saveMedicalQuestions = async (userId, data) => {
  const patient = await getPatient(userId);
  let intakeForm = await IntakeForm.findOne({ patient: patient._id });

  // Build medical questions data
  // If arrays are provided in request, use them (even if empty), otherwise keep existing
  const medicalQuestionsData = {
    pastMedicalHistory: Array.isArray(data.pastMedicalHistory)
      ? data.pastMedicalHistory
      : (intakeForm?.medicalQuestions?.pastMedicalHistory || []),
    currentMedications: Array.isArray(data.currentMedications)
      ? data.currentMedications
      : (intakeForm?.medicalQuestions?.currentMedications || []),
    medicationAllergies: Array.isArray(data.medicationAllergies)
      ? data.medicationAllergies
      : (intakeForm?.medicalQuestions?.medicationAllergies || []),
    symptoms: Array.isArray(data.symptoms)
      ? data.symptoms
      : (intakeForm?.medicalQuestions?.symptoms || []),
    howDidYouHearAboutUs: data.howDidYouHearAboutUs !== undefined
      ? (data.howDidYouHearAboutUs || '')
      : (intakeForm?.medicalQuestions?.howDidYouHearAboutUs || '')
  };

  medicalQuestionsData.isMedicalQuestionsComplete = computeMedicalQuestionsCompleteness(medicalQuestionsData);

  if (!intakeForm) {
    intakeForm = await IntakeForm.create({
      patient: patient._id,
      medicalQuestions: medicalQuestionsData
    });
  } else {
    intakeForm.medicalQuestions = medicalQuestionsData;
    await intakeForm.save();
  }

  patient.medicalHistory = medicalQuestionsData.pastMedicalHistory;
  patient.allergies = medicalQuestionsData.medicationAllergies;

  patient.drugAllergy = medicalQuestionsData.medicationAllergies.join(", ");
  patient.otherMedications = medicalQuestionsData.currentMedications.join(", ");
  patient.medicalConditions = medicalQuestionsData.pastMedicalHistory.join(", ");

  await patient.save();

  if (patient?.hw_patient_id) {
    const patientUpdated = await healthwarehouse.updatePatient(patient.hw_patient_id, patient, patient.user);
    console.log('Patient Updated in HW', patientUpdated);
  }

  // Populate doctor before returning
  return await IntakeForm.findById(intakeForm._id)
    .populate({
      path: 'doctor',
      select: 'user specialty licenseNumber consultationFee status rating experience education certifications languages availability address',
      populate: {
        path: 'user',
        select: 'firstName lastName email phoneNumber countryCode profilePicture'
      }
    });
};

// Submit consultation (book consultation)
exports.submitConsultation = async (userId, doctorId) => {
  const patient = await getPatient(userId);
  const intakeForm = await IntakeForm.findOne({ patient: patient._id });

  if (!intakeForm) {
    throw new AppError('Intake form not found. Please complete the intake form first.', 404);
  }

  // Validate and verify doctor ID if provided (optional)
  if (doctorId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new AppError('Doctor not found.', 404);
    }
    if (!doctor.isActive || doctor.status !== 'active') {
      throw new AppError('Selected doctor is not available for consultations.', 400);
    }
  }

  const completeness = computeIntakeFormCompleteness(intakeForm);

  if (!completeness.isComplete) {
    logger.warn('Intake form submission blocked due to incomplete sections', {
      patientId: String(patient._id),
      intakeFormId: String(intakeForm._id),
      userId: String(userId),
      missingSections: completeness.missingSections
    });
    throw new AppError('Please complete all sections of the intake form before submitting.', 400);
  }

  intakeForm.basicInformation = {
    ...(intakeForm.basicInformation?.toObject?.() || {}),
    isBasicInfoComplete: completeness.isBasicInfoComplete
  };
  intakeForm.emergencyContact = {
    ...(intakeForm.emergencyContact?.toObject?.() || {}),
    isEmergencyContactComplete: completeness.isEmergencyContactComplete
  };
  intakeForm.medicalQuestions = {
    ...(intakeForm.medicalQuestions?.toObject?.() || {}),
    isMedicalQuestionsComplete: completeness.isMedicalQuestionsComplete
  };

  // Check if already submitted
  if (intakeForm.status === 'submitted') {
    throw new AppError('Consultation has already been submitted.', 400);
  }

  // Update status to submitted and assign doctor
  intakeForm.status = 'submitted';
  intakeForm.doctor = doctorId
    ? new mongoose.Types.ObjectId(doctorId)
    : new mongoose.Types.ObjectId('69611415b8c266a7835c0c1a');
  await intakeForm.save();

  // Populate doctor information before returning
  const populatedForm = await IntakeForm.findById(intakeForm._id)
    .populate({
      path: 'doctor',
      select: 'user specialty licenseNumber consultationFee status rating experience education certifications languages availability address',
      populate: {
        path: 'user',
        select: 'firstName lastName email phoneNumber countryCode profilePicture'
      }
    })
    .populate({
      path: 'patient',
      select: 'user dateOfBirth gender',
      populate: {
        path: 'user',
        select: 'firstName lastName email phoneNumber'
      }
    });

  return populatedForm;
};

// Create/Update intake form (legacy - for backward compatibility)
exports.saveIntakeForm = async (userId, data) => {
  const patient = await getPatient(userId);
  let intakeForm = await IntakeForm.findOne({ patient: patient._id });

  if (!intakeForm) {
    intakeForm = await IntakeForm.create({ patient: patient._id, ...data, doctor: new mongoose.Types.ObjectId('69611415b8c266a7835c0c1a') });
  } else {
    intakeForm = await IntakeForm.findByIdAndUpdate(
      intakeForm._id,
      { ...data, status: data.status || intakeForm.status, doctor: new mongoose.Types.ObjectId('69611415b8c266a7835c0c1a') },
      { new: true, runValidators: true }
    );
  }

  // Populate doctor before returning
  return await IntakeForm.findById(intakeForm._id)
    .populate({
      path: 'doctor',
      select: 'user specialty licenseNumber consultationFee status rating experience education certifications languages availability address',
      populate: {
        path: 'user',
        select: 'firstName lastName email phoneNumber countryCode profilePicture'
      }
    });
};

// exports.submitFullIntakeForm = async (userId, payload) => {
//   const patient = await getPatient(userId);

//   let intakeForm = await IntakeForm.findOne({ patient: patient._id });

//   const {
//     basicInformation,
//     emergencyContact,
//     medicalQuestions,
//     doctorId
//   } = payload;

//   /* =========================
//      BASIC INFO VALIDATION
//   ========================= */
//   const basicRequired = [
//     'firstName',
//     'lastName',
//     'sex',
//     'dateOfBirth',
//     'email',
//     'phone',
//     'address',
//     'city',
//     'state',
//     'zip'
//   ];

//   const isBasicInfoComplete = basicRequired.every(
//     (f) => basicInformation?.[f]
//   );

//   /* =========================
//      EMERGENCY CONTACT VALIDATION
//   ========================= */
//   const emergencyRequired = [
//     'relationship',
//     'firstName',
//     'lastName',
//     'phone',
//     'address',
//     'city',
//     'state',
//     'zip'
//   ];

//   const isEmergencyContactComplete = emergencyRequired.every(
//     (f) => emergencyContact?.[f]
//   );

//   /* =========================
//      MEDICAL QUESTIONS VALIDATION
//   ========================= */
//   const hasMedicalData =
//     (medicalQuestions?.pastMedicalHistory?.length > 0) ||
//     (medicalQuestions?.currentMedications?.length > 0) ||
//     (medicalQuestions?.medicationAllergies?.length > 0) ||
//     medicalQuestions?.howDidYouHearAboutUs;

//   const isMedicalQuestionsComplete = !!hasMedicalData;

//   /* =========================
//      FINAL CHECK
//   ========================= */
//   if (
//     !isBasicInfoComplete ||
//     !isEmergencyContactComplete ||
//     !isMedicalQuestionsComplete
//   ) {
//     throw new AppError(
//       'Please complete all sections before submitting.',
//       400
//     );
//   }

//   /* =========================
//      VERIFY DOCTOR (OPTIONAL)
//   ========================= */
//   if (doctorId) {
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor || !doctor.isActive || doctor.status !== 'active') {
//       throw new AppError('Doctor not available.', 400);
//     }
//   }

//   /* =========================
//      CREATE / UPDATE FORM
//   ========================= */
//   if (!intakeForm) {
//     intakeForm = await IntakeForm.create({
//       patient: patient._id,
//       basicInformation: {
//         ...basicInformation,
//         isBasicInfoComplete
//       },
//       emergencyContact: {
//         ...emergencyContact,
//         isEmergencyContactComplete
//       },
//       medicalQuestions: {
//         ...medicalQuestions,
//         isMedicalQuestionsComplete
//       },
//       doctor: doctorId || null,
//       status: 'submitted'
//     });
//   } else {
//     intakeForm.basicInformation = {
//       ...basicInformation,
//       isBasicInfoComplete
//     };
//     intakeForm.emergencyContact = {
//       ...emergencyContact,
//       isEmergencyContactComplete
//     };
//     intakeForm.medicalQuestions = {
//       ...medicalQuestions,
//       isMedicalQuestionsComplete
//     };
//     intakeForm.status = 'submitted';
//     if (doctorId) intakeForm.doctor = doctorId;

//     await intakeForm.save();
//   }

//   /* =========================
//      RETURN POPULATED DATA
//   ========================= */
//   return await IntakeForm.findById(intakeForm._id)
//     .populate({
//       path: 'doctor',
//       select:
//         'user specialty licenseNumber consultationFee status rating experience education certifications languages availability address',
//       populate: {
//         path: 'user',
//         select:
//           'firstName lastName email phoneNumber countryCode profilePicture'
//       }
//     })
//     .populate({
//       path: 'patient',
//       select: 'user dateOfBirth gender',
//       populate: {
//         path: 'user',
//         select: 'firstName lastName email phoneNumber'
//       }
//     });
// };
