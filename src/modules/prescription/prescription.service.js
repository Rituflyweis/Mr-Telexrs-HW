const Prescription = require('../../models/Prescription.model');
const Patient = require('../../models/Patient.model');
const AppError = require('../../utils/AppError');
const pdfGenerator = require('../../utils/pdfGenerator');
const mongoose = require('mongoose');
const Doctor = require('../../models/Doctor.model');
const logger = require('../../utils/logger');
// Get patient from userId
const getPatient = async (userId) => {
  const patient = await Patient.findOne({ user: userId });
  if (!patient) throw new AppError('Patient profile not found', 404);
  return patient;
};

// Get all prescriptions for patient
exports.getPrescriptions = async (userId, query = {}) => {
  const patient = await getPatient(userId);

  const filter = { patient: patient._id };
  if (query.status) filter.status = query.status;

  const prescriptions = await Prescription.find(filter)
    .populate('doctor', 'firstName lastName')
    .populate('patient', 'firstName lastName')
    .sort({ createdAt: -1 });

  return prescriptions;
};

// Get single prescription
exports.getPrescriptionById = async (userId, prescriptionId) => {
  const patient = await getPatient(userId);

  const prescription = await Prescription.findOne({
    _id: prescriptionId,
    patient: patient._id
  }).populate('doctor', 'firstName lastName');

  if (!prescription) throw new AppError('Prescription not found', 404);

  return prescription;
};

// Get prescription PDF
exports.getPrescriptionPDF = async (userId, prescriptionId) => {
  const prescription = await exports.getPrescriptionById(userId, prescriptionId);

  // Generate PDF (you'll need to implement pdfGenerator)
  const pdfUrl = await pdfGenerator.generatePrescriptionPDF(prescription);

  // Update prescription with PDF URL if not exists
  if (!prescription.pdfUrl) {
    prescription.pdfUrl = pdfUrl;
    await prescription.save();
  }

  return prescription.pdfUrl;
};

// Reorder prescription
exports.reorderPrescription = async (userId, prescriptionId) => {
  const prescription = await exports.getPrescriptionById(userId, prescriptionId);

  // This will be handled by order service
  return prescription;
};

exports.createPrescription = async (patientId, data, createdById) => {
  // Validate patientId
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw new AppError('Invalid patient ID format', 400);
  }

  const { doctor, medicine, brand, description, status, duration, frequency, refillsAllowed, instruction, warning } = data;

  // Verify patient exists
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  // Validate and verify doctor if provided
  if (doctor) {
    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      throw new AppError('Invalid doctor ID format', 400);
    }
    const doctorDoc = await Doctor.findById(doctor);
    if (!doctorDoc) {
      throw new AppError('Doctor not found', 404);
    }
  }

  // Validate required fields
  if (!medicine || !medicine.trim()) {
    throw new AppError('Medicine is required', 400);
  }
  if (!brand || !brand.trim()) {
    throw new AppError('Brand is required', 400);
  }
  if (!description || !description.trim()) {
    throw new AppError('Description is required', 400);
  }

  // Generate prescription number
  const generatePrescriptionNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PRES${timestamp}${random}`;
  };

  // Create prescription
  const prescriptionData = {
    patient: patientId,
    duration:duration, 
    frequency:frequency, 
    refillsAllowed:refillsAllowed, 
    instruction:instruction, 
    warning:warning,
    medicine: medicine.trim(),
    brand: brand.trim(),
    description: description.trim(),
    status: status || 'active',
    prescriptionNumber: generatePrescriptionNumber() // Generate in service to ensure it's set
  };

  // Add doctor if provided
  if (doctor) {
    prescriptionData.doctor = doctor;
  }

  // Ensure prescription number is unique
  let prescriptionNumber = prescriptionData.prescriptionNumber;
  let existing = await Prescription.findOne({ prescriptionNumber });
  let attempts = 0;
  while (existing && attempts < 5) {
    prescriptionNumber = generatePrescriptionNumber();
    existing = await Prescription.findOne({ prescriptionNumber });
    attempts++;
  }
  prescriptionData.prescriptionNumber = prescriptionNumber;

  const prescription = await Prescription.create(prescriptionData);

  // Populate and return
  const populatedPrescription = await Prescription.findById(prescription._id)
    .populate({
      path: 'doctor',
      populate: {
        path: 'user',
        select: '-password'
      }
    })
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: '-password'
      }
    })
    .lean();

  logger.info('Prescription created successfully', {
    patientId,
    prescriptionId: prescription._id,
    prescriptionNumber: prescription.prescriptionNumber,
    doctorId: doctor,
    createdBy: createdById
  });

  return populatedPrescription;
};