/**
 * Doctor Consultations Service
 * Refactored to use shared helpers
 */

const IntakeForm = require('../../models/IntakeForm.model');
const Patient = require('../../models/Patient.model');
const User = require('../../models/User.model');
const mongoose = require('mongoose');
const AppError = require('../../utils/AppError');
const {
  getDoctor,
  getDoctorById,
  ensureObjectId,
  formatConsultation,
  parsePagination,
  buildPaginationResponse,
  calculateAge
} = require('../../helpers');
const Order = require('../../models/Order.model');

const ORDER_CONSULTATION_PROJECTION = {
  _id: 1,
  status: 1,
  hw_order_id: 1,
  doctorApproved: 1,
  condition: 1,
  symptoms: 1,
  isConsented: 1,
  'items.medicationName': 1,
  'items.dosage': 1,
  'items.dosageOption': 1,
  'items.quantityOption': 1,
  'items.condition': 1,
  'items.symptoms': 1,
  'items.isConsented': 1
};

const NON_EXCUSE_ORDER_FILTER = {
  items: { $elemMatch: { productType: { $ne: 'doctors_note' } } }
};

const toCleanStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .flatMap(item => toCleanStringArray(item))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
};

const uniqueValues = (values = []) => [...new Set(values.filter(Boolean))];

const getOrderMedicalSummary = (order) => {
  if (!order) return {};

  const itemConditions = (order.items || []).flatMap(item => toCleanStringArray(item.condition));
  const itemSymptoms = (order.items || []).flatMap(item => toCleanStringArray(item.symptoms));
  const conditions = uniqueValues([...toCleanStringArray(order.condition), ...itemConditions]);
  const symptoms = uniqueValues([...toCleanStringArray(order.symptoms), ...itemSymptoms]);

  return {
    condition: conditions.length > 0 ? conditions.join(', ') : null,
    symptoms: symptoms.length > 0 ? symptoms.join(', ') : null
  };
};

const applyOrderMedicalSummary = (formatted, order) => {
  const { condition, symptoms } = getOrderMedicalSummary(order);

  if (condition) formatted.condition = condition;
  if (symptoms) formatted.symptoms = symptoms;

  return formatted;
};

const formatOrderMedicines = (order) => {
  return order?.items?.map(item => ({
    name: item.medicationName,
    dosage: item.dosage || item.dosageOption?.name || null,
    quantity: item.quantityOption?.name || null
  })) || [];
};

/**
 * Get all consultations (no doctor filter - for admin)
 */
exports.getAllConsultations = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  // Filter by doctor if provided
  if (query.doctorId) filter.doctor = query.doctorId;

  // Filter by status
  if (query.status) {
    filter.status = query.status === 'pending' ? 'submitted' : query.status;
  }

  // Search
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    const matchingUsers = await User.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ]
    }).distinct('_id');

    const patients = await Patient.find({ user: { $in: matchingUsers } }).distinct('_id');

    const intakeFormsByMedical = await IntakeForm.find({
      ...(query.doctorId ? { doctor: query.doctorId } : {}),
      $or: [
        { 'medicalQuestions.pastMedicalHistory': searchRegex },
        { 'medicalQuestions.symptoms': searchRegex },
        { 'medicalQuestions.currentMedications': searchRegex },
        { 'basicInformation.firstName': searchRegex },
        { 'basicInformation.lastName': searchRegex }
      ]
    }).distinct('patient');

    const orderPatients = await Order.find({
      ...NON_EXCUSE_ORDER_FILTER,
      $or: [
        { condition: searchRegex },
        { symptoms: searchRegex },
        { 'items.condition': searchRegex },
        { 'items.symptoms': searchRegex }
      ]
    }).distinct('patient');

    const allPatientIds = [...new Set([...patients, ...intakeFormsByMedical, ...orderPatients])];
    filter.patient = allPatientIds.length > 0 ? { $in: allPatientIds } : { $in: [] };
  }

  // Query with populations
  const consultations = await IntakeForm.find(filter)
    .populate({
      path: 'patient',
      select: 'user dateOfBirth gender bloodGroup profilePicture',
      populate: { path: 'user', select: 'firstName lastName email phoneNumber countryCode profilePicture' }
    })
    .populate({
      path: 'doctor',
      select: 'user specialty',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Format consultations
  const formattedConsultations = await Promise.all(consultations.map(async form => {
    const order = form.patient?._id
      ? await Order.findOne(
        { patient: form.patient._id, ...NON_EXCUSE_ORDER_FILTER },
        ORDER_CONSULTATION_PROJECTION
      ).sort({ createdAt: -1 }).lean()
      : null;
    const formatted = applyOrderMedicalSummary(formatConsultation(form), order);
    formatted.order = order;
    formatted.medicines = formatOrderMedicines(order);
    if (form.doctor) {
      formatted.doctor = {
        id: form.doctor._id,
        name: form.doctor.user
          ? `${form.doctor.user.firstName || ''} ${form.doctor.user.lastName || ''}`.trim()
          : 'Unknown Doctor',
        specialty: form.doctor.specialty
      };
    }
    return formatted;
  }));

  const total = await IntakeForm.countDocuments(filter);

  return {
    consultations: formattedConsultations,
    pagination: buildPaginationResponse(total, page, limit)
  };
};

/**
 * Get consultations by doctor ID (path parameter)
 */
exports.getConsultationsByDoctorId = async (doctorId, query = {}) => {
  const doctorObjectId = ensureObjectId(doctorId);

  // Verify doctor exists
  await getDoctorById(doctorId);

  const { page, limit, skip } = parsePagination(query);
  const filter = { doctor: doctorObjectId };

  // Status filter
  // filter.status = query.status === 'pending' || !query.status ? 'submitted' : query.status;

  // Search
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    const matchingUsers = await User.find({
      $or: [{ firstName: searchRegex }, { lastName: searchRegex }, { email: searchRegex }]
    }).distinct('_id');

    const patients = await Patient.find({ user: { $in: matchingUsers } }).distinct('_id');

    const intakeFormsByMedical = await IntakeForm.find({
      doctor: doctorObjectId,
      $or: [
        { 'medicalQuestions.pastMedicalHistory': searchRegex },
        { 'medicalQuestions.symptoms': searchRegex },
        { 'basicInformation.firstName': searchRegex },
        { 'basicInformation.lastName': searchRegex }
      ]
    }).distinct('patient');

    const orderPatients = await Order.find({
      ...NON_EXCUSE_ORDER_FILTER,
      $or: [
        { condition: searchRegex },
        { symptoms: searchRegex },
        { 'items.condition': searchRegex },
        { 'items.symptoms': searchRegex }
      ]
    }).distinct('patient');

    const allPatientIds = [...new Set([...patients, ...intakeFormsByMedical, ...orderPatients])];
    filter.patient = allPatientIds.length > 0 ? { $in: allPatientIds } : { $in: [] };
  }

  const consultations = await IntakeForm.find(filter)
    .populate({
      path: 'patient',
    })
    .populate({
      path: 'doctor',
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const formattedConsultations = await Promise.all(consultations.map(async form => {
    const order = form.patient?._id
      ? await Order.findOne(
        { patient: form.patient._id, ...NON_EXCUSE_ORDER_FILTER },
        ORDER_CONSULTATION_PROJECTION
      ).sort({ createdAt: -1 }).lean()
      : null;
    const formatted = applyOrderMedicalSummary(formatConsultation(form), order);
    formatted.order = order;
    formatted.medicines = formatOrderMedicines(order);
    if (form.doctor) {
      formatted.doctor = {
        id: form.doctor._id,
        name: form.doctor.user ? `${form.doctor.user.firstName || ''} ${form.doctor.user.lastName || ''}`.trim() : 'Unknown',
        specialty: form.doctor.specialty
      };
    }
    return formatted;
  }));


  const total = await IntakeForm.countDocuments(filter);

  return {
    consultations: formattedConsultations,
    pagination: buildPaginationResponse(total, page, limit)
  };
};

/**
 * Get consultations by logged-in doctor
 */
exports.getConsultationsByDoctor = async (userId, query = {}) => {
  const doctor = await getDoctor(userId);
  return this.getConsultationsByDoctorId(doctor._id, query);
};

/**
 * Get consultation by ID
 */
exports.getConsultationById = async (userId, consultationId, doctorIdFromQuery = null) => {
  let doctorId = null;

  if (userId) {
    const doctor = await getDoctor(userId);
    doctorId = doctor._id;
  } else if (doctorIdFromQuery) {
    doctorId = mongoose.Types.ObjectId.isValid(doctorIdFromQuery)
      ? new mongoose.Types.ObjectId(doctorIdFromQuery)
      : doctorIdFromQuery;
  }

  const filter = { _id: consultationId };
  if (doctorId) filter.doctor = doctorId;

  const intakeForm = await IntakeForm.findOne(filter)
    .populate({
      path: 'patient',
      select: 'user dateOfBirth gender bloodGroup height weight medicalHistory allergies emergencyContact profilePicture',
      populate: { path: 'user', select: 'firstName lastName email phoneNumber countryCode profilePicture' }
    })
    .populate({
      path: 'doctor',
      select: 'user specialty licenseNumber consultationFee status rating experience',
      populate: { path: 'user', select: 'firstName lastName email phoneNumber profilePicture' }
    })
    .lean();

  if (!intakeForm) {
    throw new AppError(doctorId
      ? `Consultation not found or does not belong to the specified doctor`
      : `Consultation not found with ID: ${consultationId}`, 404);
  }

  const patient = intakeForm.patient?.user;
  const patientName = patient
    ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim()
    : 'Unknown Patient';

  // Calculate age
  const dateOfBirth = intakeForm.patient?.dateOfBirth || intakeForm.basicInformation?.dateOfBirth;
  const age = calculateAge(dateOfBirth);

  const submittedDate = new Date(intakeForm.createdAt);
  const order = intakeForm.patient?._id
    ? await Order.findOne(
      { patient: intakeForm.patient._id, ...NON_EXCUSE_ORDER_FILTER },
      ORDER_CONSULTATION_PROJECTION
    ).sort({ createdAt: -1 }).lean()
    : null;
  const orderMedicalSummary = getOrderMedicalSummary(order);

  return {
    id: intakeForm._id,
    patient: {
      id: intakeForm.patient?._id,
      name: patientName,
      firstName: patient?.firstName || intakeForm.basicInformation?.firstName,
      lastName: patient?.lastName || intakeForm.basicInformation?.lastName,
      age,
      gender: intakeForm.patient?.gender || intakeForm.basicInformation?.sex || 'Not specified',
      dateOfBirth,
      email: patient?.email || intakeForm.basicInformation?.email,
      phone: patient?.phoneNumber || intakeForm.basicInformation?.phone,
      countryCode: patient?.countryCode || '+91',
      profilePicture: patient?.profilePicture || null,
      bloodGroup: intakeForm.patient?.bloodGroup,
      height: intakeForm.patient?.height,
      weight: intakeForm.patient?.weight,
      medicalHistory: intakeForm.patient?.medicalHistory || [],
      allergies: intakeForm.patient?.allergies || [],
      emergencyContact: intakeForm.patient?.emergencyContact || intakeForm.emergencyContact
    },
    condition: orderMedicalSummary.condition ||
      intakeForm.medicalQuestions?.pastMedicalHistory?.join(', ') ||
      'Not specified',
    symptoms: orderMedicalSummary.symptoms ||
      intakeForm.medicalQuestions?.symptoms?.join(', ') ||
      'No symptoms listed',
    order,
    medicines: formatOrderMedicines(order),
    basicInformation: intakeForm.basicInformation || {},
    emergencyContact: intakeForm.emergencyContact || {},
    medicalQuestions: intakeForm.medicalQuestions || {},
    doctor: intakeForm.doctor ? {
      id: intakeForm.doctor._id,
      name: intakeForm.doctor.user
        ? `${intakeForm.doctor.user.firstName || ''} ${intakeForm.doctor.user.lastName || ''}`.trim()
        : 'Unknown Doctor',
      specialty: intakeForm.doctor.specialty,
      licenseNumber: intakeForm.doctor.licenseNumber,
      consultationFee: intakeForm.doctor.consultationFee,
      rating: intakeForm.doctor.rating,
      experience: intakeForm.doctor.experience
    } : null,
    status: intakeForm.status === 'submitted' ? 'pending' : intakeForm.status,
    submittedAt: `${submittedDate.toLocaleDateString('en-US')} ${submittedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
    submittedDate: intakeForm.createdAt,
    updatedAt: intakeForm.updatedAt
  };
};

/**
 * Update consultation status
 */
exports.updateConsultationStatus = async (userId, consultationId, status) => {
  const doctor = await getDoctor(userId);
  const doctorId = doctor._id;

  const validStatuses = ['draft', 'submitted', 'reviewed'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status. Must be one of: draft, submitted, reviewed', 400);
  }

  const intakeForm = await IntakeForm.findOneAndUpdate(
    { _id: consultationId, doctor: doctorId },
    { status },
    { new: true, runValidators: true }
  )
    .populate({
      path: 'patient',
      select: 'user',
      populate: { path: 'user', select: 'firstName lastName email' }
    });

  if (!intakeForm) {
    throw new AppError('Consultation not found or you do not have access to update this consultation', 404);
  }

  return {
    id: intakeForm._id,
    status: intakeForm.status === 'submitted' ? 'pending' : intakeForm.status,
    updatedAt: intakeForm.updatedAt
  };
};
