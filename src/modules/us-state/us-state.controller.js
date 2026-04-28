const service = require('./us-state.service');

exports.getStatesForDropdown = async (req, res, next) => {
  try {
    const states = await service.getStatesForDropdown();
    res.status(200).json({
      success: true,
      message: 'States retrieved successfully',
      count: states.length,
      data: states
    });
  } catch (err) { next(err); }
};

exports.getAllStates = async (req, res, next) => {
  try {
    const result = await service.getAllStates(req.query);
    res.status(200).json({
      success: true,
      message: 'States retrieved successfully',
      count: result.states.length,
      data: result.states,
      pagination: result.pagination
    });
  } catch (err) { next(err); }
};

exports.createState = async (req, res, next) => {
  try {
    const state = await service.createState(req.body);
    res.status(201).json({ success: true, message: 'State created successfully', data: state });
  } catch (err) { next(err); }
};

exports.updateState = async (req, res, next) => {
  try {
    const state = await service.updateState(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'State updated successfully', data: state });
  } catch (err) { next(err); }
};

exports.toggleAvailability = async (req, res, next) => {
  try {
    const state = await service.toggleAvailability(req.params.id, req.body.isAvailable);
    res.status(200).json({ success: true, message: `State marked as ${state.isAvailable ? 'available' : 'unavailable'}`, data: state });
  } catch (err) { next(err); }
};

exports.deleteState = async (req, res, next) => {
  try {
    const result = await service.deleteState(req.params.id);
    res.status(200).json({ success: true, message: result.message, data: { id: result.id } });
  } catch (err) { next(err); }
};
