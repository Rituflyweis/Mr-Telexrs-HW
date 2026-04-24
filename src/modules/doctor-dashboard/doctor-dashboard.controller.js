const doctorDashboardService = require('./doctor-dashboard.service');
const Doctor = require('../../models/Doctor.model');
const AppError = require('../../utils/AppError');
const Medicine = require('../../models/Medicine.model');
const Patient = require('../../models/Patient.model');
const User = require('../../models/User.model');
const Order = require('../../models/Order.model');

// Helper function to get userId from req (authenticated) or query params (public)
const getUserId = async (req) => {
  // If user is authenticated, use req.user.id
  if (req.user && req.user.id) {
    return req.user.id;
  }

  // If public route, get userId from query parameters
  const { userId, doctorId } = req.query;

  if (userId) {
    return userId;
  }

  if (doctorId) {
    // Find doctor and get the associated user ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }
    return doctor.user.toString();
  }

  throw new AppError('User ID or Doctor ID is required. For public access, provide userId or doctorId as query parameter. Example: ?userId=... or ?doctorId=...', 400);
};

// Get Dashboard Overview
exports.getDashboardOverview = async (req, res, next) => {
  try {
    const { doctorId } = req.query;
    let userId;
    let doctor = null;

    // If doctorId is provided directly, use it to get doctor and userId
    if (doctorId) {
      doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        throw new AppError('Doctor not found', 404);
      }
      userId = doctor.user.toString();
      // Pass doctorId to service
      req.query.doctorId = doctorId;
    } else {
      // Otherwise, get userId from req (authenticated) or query params
      userId = await getUserId(req);
    }

    const dashboardData = await doctorDashboardService.getDashboardOverview(userId, req.query);

    // Include doctorId in response if it was provided
    if (doctorId && doctor) {
      dashboardData.doctorId = doctor._id.toString();
      dashboardData.doctor = {
        id: doctor._id.toString(),
        name: `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim(),
        specialty: doctor.specialty,
        status: doctor.status
      };
    }

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData
    });
  } catch (err) {
    next(err);
  }
};

// Get Recent Consultations
exports.getRecentConsultations = async (req, res, next) => {
  try {
    const userId = await getUserId(req);
    const consultations = await doctorDashboardService.getRecentConsultations(userId, req.query);
    res.status(200).json({
      success: true,
      message: 'Recent consultations retrieved successfully',
      data: consultations
    });
  } catch (err) {
    next(err);
  }
};

// Get Today's Schedule
exports.getTodaysSchedule = async (req, res, next) => {
  try {
    const userId = await getUserId(req);
    const schedule = await doctorDashboardService.getTodaysSchedule(userId, req.query);
    res.status(200).json({
      success: true,
      message: "Today's schedule retrieved successfully",
      data: schedule
    });
  } catch (err) {
    next(err);
  }
};

exports.globalSearch = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res.status(400).json({success: false,message: 'Search query is required'});
    }
    const regex = new RegExp(search, 'i');
    const medicines = await Medicine.find({$or: [{ productName: regex },{ brand: regex }],isActive: true}).select('productName brand salePrice images.thumbnail').limit(10);
    // 🔍 2. Search Users (Patients via User)
    const users = await User.find({$or: [{ firstName: regex },{ lastName: regex },{ phoneNumber: regex }],role: 'patient'}).select('_id firstName lastName phoneNumber profile');
    const userIds = users.map(u => u._id);
    const patients = await Patient.find({user: { $in: userIds }}).populate('user', 'firstName lastName phoneNumber profile').limit(10);
    const orders = await Order.find({$or: [{ orderNumber: regex }]}).populate({path: 'patient',populate: {path: 'user',select: 'firstName lastName phoneNumber'}}).select('orderNumber totalAmount status createdAt').limit(10);
    return res.status(200).json({success: true,data: {medicines,patients,orders    }});
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({success: false,message: 'Something went wrong'});
  }
};