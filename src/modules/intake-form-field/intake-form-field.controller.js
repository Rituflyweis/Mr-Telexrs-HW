const intakeFormFieldService = require('./intake-form-field.service');
const IntakeFormFieldSection = require('../../models/IntakeFormFieldSection.model');
const AppError = require('../../utils/AppError');

// Add new intake form field
exports.addIntakeFormField = async (req, res, next) => {
  try {
    const field = await intakeFormFieldService.addIntakeFormField(req.body);
    res.status(201).json({
      success: true,
      message: 'Intake form field added successfully',
      data: field
    });
  } catch (err) {
    next(err);
  }
};

// Get all intake form fields
exports.getAllIntakeFormFields = async (req, res, next) => {
  try {
    const fields = await intakeFormFieldService.getAllIntakeFormFields(req.query);
    res.status(200).json({
      success: true,
      data: fields
    });
  } catch (err) {
    next(err);
  }
};

// Get intake form field by ID
exports.getIntakeFormFieldById = async (req, res, next) => {
  try {
    const field = await intakeFormFieldService.getIntakeFormFieldById(req.params.id);
    res.status(200).json({
      success: true,
      data: field
    });
  } catch (err) {
    next(err);
  }
};

// Update intake form field
exports.updateIntakeFormField = async (req, res, next) => {
  try {
    const field = await intakeFormFieldService.updateIntakeFormField(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Intake form field updated successfully',
      data: field
    });
  } catch (err) {
    next(err);
  }
};

// Delete intake form field
exports.deleteIntakeFormField = async (req, res, next) => {
  try {
    const result = await intakeFormFieldService.deleteIntakeFormField(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

// Reorder fields
exports.reorderFields = async (req, res, next) => {
  try {
    const result = await intakeFormFieldService.reorderFields(req.body.fieldOrders);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (err) {
    next(err);
  }
};

// Get fields by section
exports.getFieldsBySection = async (req, res, next) => {
  try {
    const fields = await intakeFormFieldService.getFieldsBySection(req.params.section);
    res.status(200).json({
      success: true,
      data: fields
    });
  } catch (err) {
    next(err);
  }
};
// Preview form - Get all fields organized by sections
exports.previewForm = async (req, res, next) => {
  try {
    const formData = await intakeFormFieldService.previewForm();
    res.status(200).json({
      success: true,
      message: 'Form preview retrieved successfully',
      data: formData
    });
  } catch (err) {
    next(err);
  }
};
exports.createSection = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    const existing = await IntakeFormFieldSection.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Section already exists" });
    }
    const section = await IntakeFormFieldSection.create({ name, });
    res.status(201).json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getSections = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    const sections = await IntakeFormFieldSection.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await IntakeFormFieldSection.countDocuments(filter);
    res.json({ success: true, total, page: Number(page), data: sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getSectionById = async (req, res) => {
  try {
    const section = await IntakeFormFieldSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.updateSection = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const section = await IntakeFormFieldSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }
    if (name) {
      const existing = await IntakeFormFieldSection.findOne({ _id: { $ne: req.params.id }, name: { $regex: `^${name}$`, $options: "i" } });
      if (existing) {
        return res.status(400).json({ success: false, message: "Section name already exists" });
      }
      section.name = name;
    }
    if (isActive !== undefined) section.isActive = isActive;
    await section.save();
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.deleteSection = async (req, res) => {
  try {
    const section = await IntakeFormFieldSection.findByIdAndDelete(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }
    res.json({ success: true, message: "Section deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};