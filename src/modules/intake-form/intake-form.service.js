const IntakeForm = require('../../models/IntakeForm.model');
const Patient = require('../../models/Patient.model');
const Doctor = require('../../models/Doctor.model');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');
const healthwarehouse = require('../../helpers/healthwarehouse.helper');
const mongoose = require('mongoose');

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

  // Check if required fields are present
  const requiredFields = ['firstName', 'lastName', 'sex', 'dateOfBirth', 'email', 'phone', 'address', 'city', 'state', 'zip'];
  const isComplete = requiredFields.every(field => data[field] !== undefined && data[field] !== null && data[field] !== '');

  const basicInfoData = {
    ...data,
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

  // Check if required fields are present
  const requiredFields = ['relationship', 'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zip'];
  const isComplete = requiredFields.every(field => data[field] !== undefined && data[field] !== null && data[field] !== '');

  const emergencyContactData = {
    ...data,
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

  // Check if required fields are present (at least one should be filled)
  const hasData = medicalQuestionsData.pastMedicalHistory?.length > 0 ||
    medicalQuestionsData.currentMedications?.length > 0 ||
    medicalQuestionsData.medicationAllergies?.length > 0 ||
    medicalQuestionsData.howDidYouHearAboutUs;

  medicalQuestionsData.isMedicalQuestionsComplete = hasData;

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

  const isComplete =
    intakeForm.basicInformation?.isBasicInfoComplete &&
    intakeForm.emergencyContact?.isEmergencyContactComplete &&
    intakeForm.medicalQuestions?.isMedicalQuestionsComplete;
  intakeForm.medicalQuestions?.isMedicalQuestionsComplete;
  if (!isComplete) {
    throw new AppError('Please complete all sections of the intake form before submitting.', 400);
  }

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
