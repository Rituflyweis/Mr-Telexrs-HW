const UsState = require('../../models/UsState.model');
const AppError = require('../../utils/AppError');
const mongoose = require('mongoose');

const USA_COUNTRY_NAME = 'United States';

const US_STATES_SEED = [
  { name: 'Alabama', code: 'AL' },
  { name: 'Alaska', code: 'AK' },
  { name: 'Arizona', code: 'AZ' },
  { name: 'Arkansas', code: 'AR' },
  { name: 'California', code: 'CA' },
  { name: 'Colorado', code: 'CO' },
  { name: 'Connecticut', code: 'CT' },
  { name: 'Delaware', code: 'DE' },
  { name: 'Florida', code: 'FL' },
  { name: 'Georgia', code: 'GA' },
  { name: 'Hawaii', code: 'HI' },
  { name: 'Idaho', code: 'ID' },
  { name: 'Illinois', code: 'IL' },
  { name: 'Indiana', code: 'IN' },
  { name: 'Iowa', code: 'IA' },
  { name: 'Kansas', code: 'KS' },
  { name: 'Kentucky', code: 'KY' },
  { name: 'Louisiana', code: 'LA' },
  { name: 'Maine', code: 'ME' },
  { name: 'Maryland', code: 'MD' },
  { name: 'Massachusetts', code: 'MA' },
  { name: 'Michigan', code: 'MI' },
  { name: 'Minnesota', code: 'MN' },
  { name: 'Mississippi', code: 'MS' },
  { name: 'Missouri', code: 'MO' },
  { name: 'Montana', code: 'MT' },
  { name: 'Nebraska', code: 'NE' },
  { name: 'Nevada', code: 'NV' },
  { name: 'New Hampshire', code: 'NH' },
  { name: 'New Jersey', code: 'NJ' },
  { name: 'New Mexico', code: 'NM' },
  { name: 'New York', code: 'NY' },
  { name: 'North Carolina', code: 'NC' },
  { name: 'North Dakota', code: 'ND' },
  { name: 'Ohio', code: 'OH' },
  { name: 'Oklahoma', code: 'OK' },
  { name: 'Oregon', code: 'OR' },
  { name: 'Pennsylvania', code: 'PA' },
  { name: 'Rhode Island', code: 'RI' },
  { name: 'South Carolina', code: 'SC' },
  { name: 'South Dakota', code: 'SD' },
  { name: 'Tennessee', code: 'TN' },
  { name: 'Texas', code: 'TX' },
  { name: 'Utah', code: 'UT' },
  { name: 'Vermont', code: 'VT' },
  { name: 'Virginia', code: 'VA' },
  { name: 'Washington', code: 'WA' },
  { name: 'West Virginia', code: 'WV' },
  { name: 'Wisconsin', code: 'WI' },
  { name: 'Wyoming', code: 'WY' },
  { name: 'District of Columbia', code: 'DC' },
  { name: 'Puerto Rico', code: 'PR' },
  { name: 'Guam', code: 'GU' },
  { name: 'U.S. Virgin Islands', code: 'VI' },
  { name: 'American Samoa', code: 'AS' },
  { name: 'Northern Mariana Islands', code: 'MP' }
];

const toDropdownItem = (state) => ({
  country: USA_COUNTRY_NAME,
  state: state.name,
  code: state.code,
  isAvailable: state.isAvailable
});

const toAdminItem = (state) => ({
  id: state._id.toString(),
  country: USA_COUNTRY_NAME,
  state: state.name,
  code: state.code,
  isAvailable: state.isAvailable,
  createdAt: state.createdAt,
  updatedAt: state.updatedAt
});

const normalizeStateName = (value, fieldLabel = 'name') => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(`${fieldLabel} is required`, 400);
  }

  return value.trim();
};

const normalizeStateCode = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError('code is required', 400);
  }

  const normalizedCode = value.trim().toUpperCase();
  if (normalizedCode.length !== 2) {
    throw new AppError('code must be a 2-letter state code', 400);
  }

  return normalizedCode;
};

const validateBoolean = (value, fieldName = 'isAvailable') => {
  if (typeof value !== 'boolean') {
    throw new AppError(`${fieldName} must be true or false`, 400);
  }

  return value;
};

exports.seedStates = async () => {
  const count = await UsState.countDocuments();
  if (count === 0) {
    await UsState.insertMany(US_STATES_SEED.map(s => ({ ...s, isAvailable: true })));
  }
};

exports.getSeededStatesCount = () => US_STATES_SEED.length;

// Patient: all states for dropdown
exports.getStatesForDropdown = async () => {
  const states = await UsState.find({})
    .sort({ name: 1 })
    .lean();

  return states.map(toDropdownItem);
};

// Admin: full list with pagination/search
exports.getAllStates = async (query = {}) => {
  const { page = 1, limit = 100, search, isAvailable } = query;
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.max(parseInt(limit, 10) || 100, 1);
  const filter = {};

  if (isAvailable !== undefined) {
    if (isAvailable === true || isAvailable === 'true') {
      filter.isAvailable = true;
    } else if (isAvailable === false || isAvailable === 'false') {
      filter.isAvailable = false;
    } else {
      throw new AppError('isAvailable filter must be true or false', 400);
    }
  }

  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { code: { $regex: search, $options: 'i' } }
  ];

  const skip = (parsedPage - 1) * parsedLimit;
  const [states, total] = await Promise.all([
    UsState.find(filter).sort({ name: 1 }).skip(skip).limit(parsedLimit).lean(),
    UsState.countDocuments(filter)
  ]);

  return {
    states: states.map(toAdminItem),
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit)
    }
  };
};

exports.createState = async (data) => {
  const name = normalizeStateName(data.name ?? data.state, 'state');
  const code = normalizeStateCode(data.code);
  const normalizedAvailability = data.isAvailable !== undefined
    ? validateBoolean(data.isAvailable)
    : true;

  const existing = await UsState.findOne({ code });
  if (existing) throw new AppError('State with this code already exists', 400);

  const created = await UsState.create({
    name,
    code,
    isAvailable: normalizedAvailability
  });

  return toAdminItem(created.toObject());
};

exports.updateState = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid state ID', 400);
  const state = await UsState.findById(id);
  if (!state) throw new AppError('State not found', 404);

  if (data.name !== undefined || data.state !== undefined) {
    const stateNameValue = data.name !== undefined ? data.name : data.state;
    state.name = normalizeStateName(stateNameValue, 'state');
  }

  if (data.code !== undefined) {
    const normalizedCode = normalizeStateCode(data.code);
    const conflict = await UsState.findOne({ code: normalizedCode, _id: { $ne: id } });
    if (conflict) throw new AppError('State with this code already exists', 400);
    state.code = normalizedCode;
  }

  if (data.isAvailable !== undefined) {
    state.isAvailable = validateBoolean(data.isAvailable);
  }

  await state.save();
  return toAdminItem(state.toObject());
};

exports.toggleAvailability = async (id, isAvailable) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid state ID', 400);

  const normalizedAvailability = validateBoolean(isAvailable);

  const state = await UsState.findByIdAndUpdate(
    id,
    { $set: { isAvailable: normalizedAvailability } },
    { new: true }
  );

  if (!state) throw new AppError('State not found', 404);
  return toAdminItem(state.toObject());
};

exports.deleteState = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid state ID', 400);
  const state = await UsState.findByIdAndDelete(id);
  if (!state) throw new AppError('State not found', 404);
  return { message: 'State deleted successfully', id };
};
