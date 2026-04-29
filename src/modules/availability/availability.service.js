const StateAvailability = require('../../models/StateAvailability.model');
const AvailabilityContent = require('../../models/AvailabilityContent.model');
const {ALL_US_STATES} = require('../../constants/states');
const AppError = require('../../utils/AppError');
const mongoose = require('mongoose');

// Seed DB with all US states (available: true) if empty
const seedStatesIfEmpty = async () => {
    const count = await StateAvailability.countDocuments();
    if (count === 0) {
        await StateAvailability.insertMany(
            ALL_US_STATES.map(s => ({ state: s.state, code: s.code, available: true, isActive: true }))
        );
    }
};

// Get all states — DB is single source of truth
const getAllStates = async () => {
    await seedStatesIfEmpty();
    const states = await StateAvailability.find({ isActive: true }).sort({ state: 1 }).lean();
    return states.map(s => ({ state: s.state, code: s.code, available: s.available }));
};

const getAllStatesForAdmin = async () => {
    await seedStatesIfEmpty();
    return StateAvailability.find({ isActive: true }).sort({ state: 1 }).lean();
};

const validateStatePayload = ({ state, code, available }, isCreate = false) => {
    if (isCreate && (!state || !code)) {
        throw new AppError('state and code are required', 400);
    }

    if (state !== undefined && (typeof state !== 'string' || !state.trim())) {
        throw new AppError('state must be a non-empty string', 400);
    }

    if (code !== undefined) {
        if (typeof code !== 'string' || !code.trim()) {
            throw new AppError('code must be a non-empty string', 400);
        }
        if (code.trim().toUpperCase().length !== 2) {
            throw new AppError('code must be a 2-letter state code', 400);
        }
    }

    if (available !== undefined && typeof available !== 'boolean') {
        throw new AppError('available must be true or false', 400);
    }
};

const createState = async (data) => {
    validateStatePayload(data, true);

    const state = data.state.trim();
    const code = data.code.trim().toUpperCase();
    const available = data.available !== undefined ? data.available : true;

    const existing = await StateAvailability.findOne({
        isActive: true,
        $or: [{ state }, { code }]
    });

    if (existing) {
        throw new AppError('State or code already exists', 409);
    }

    const created = await StateAvailability.create({
        state,
        code,
        available,
        isActive: true
    });

    return created.toObject();
};

const updateStateById = async (id, data) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid state ID', 400);
    }

    validateStatePayload(data, false);

    const stateDoc = await StateAvailability.findOne({ _id: id, isActive: true });
    if (!stateDoc) {
        throw new AppError('State not found', 404);
    }

    const nextState = data.state !== undefined ? data.state.trim() : stateDoc.state;
    const nextCode = data.code !== undefined ? data.code.trim().toUpperCase() : stateDoc.code;

    if (data.state !== undefined || data.code !== undefined) {
        const conflict = await StateAvailability.findOne({
            _id: { $ne: id },
            isActive: true,
            $or: [{ state: nextState }, { code: nextCode }]
        });

        if (conflict) {
            throw new AppError('State or code already exists', 409);
        }
    }

    if (data.state !== undefined) stateDoc.state = nextState;
    if (data.code !== undefined) stateDoc.code = nextCode;
    if (data.available !== undefined) stateDoc.available = data.available;

    await stateDoc.save();
    return stateDoc.toObject();
};

const deleteStateById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid state ID', 400);
    }

    const stateDoc = await StateAvailability.findOneAndUpdate(
        { _id: id, isActive: true },
        { $set: { isActive: false } },
        { new: true }
    );

    if (!stateDoc) {
        throw new AppError('State not found', 404);
    }

    return stateDoc.toObject();
};

// Get active content
const getActiveContent = async () => {
    const content = await AvailabilityContent.findOne({ isActive: true })
        .sort({ createdAt: -1 });
    
    if (!content) {
        // Return default content if none exists
        return {
            title: "TeleRxs is currently available in select states, with more coming soon",
            description: "If your state is highlighted, then we are available at your service.",
            points: [
                "100% online consultations with licensed healthcare providers",
                "Order prescribed medicines directly through the website with ease",
                "Secure, private, and reliable end-to-end digital healthcare experience"
            ]
        };
    }
    
    return content;
};

// Update state availability (admin only)
const updateStateAvailability = async (statesData) => {
    const results = [];
    
    for (const item of statesData) {
        const { state, code, available } = item;
        
        // Validate state name format (must be exact match with proper capitalization)
        const validState = ALL_US_STATES.find(s => s.state === state);
        if (!validState) {
            results.push({
                state,
                success: false,
                error: `Invalid state name: "${state}". State name must be properly capitalized (e.g., "New York", not "new york" or "NY")`
            });
            continue;
        }
        
        // Update or create state availability
        const updated = await StateAvailability.findOneAndUpdate(
            { state: validState.state },
            { 
                state: validState.state,
                code: validState.code,
                available: available,
                isActive: true
            },
            { upsert: true, new: true }
        );
        
        results.push({
            state: validState.state,
            code: validState.code,
            available: updated.available,
            success: true
        });
    }
    
    return results;
};

// Bulk update all states (admin only)
const bulkUpdateStates = async (statesData) => {
    // Clear existing data
    await StateAvailability.deleteMany({});
    
    // Insert new data
    const statesToInsert = statesData.map(item => ({
        state: item.state,
        code: item.code,
        available: item.available,
        isActive: true
    }));
    
    const inserted = await StateAvailability.insertMany(statesToInsert);
    
    return inserted;
};

// Update content (admin only)
const updateContent = async (contentData) => {
    // Deactivate old content
    await AvailabilityContent.updateMany({}, { $set: { isActive: false } });
    
    // Create new content
    const newContent = await AvailabilityContent.create({
        title: contentData.title,
        description: contentData.description,
        points: contentData.points,
        isActive: true
    });
    
    return newContent;
};

module.exports = {
    getAllStates,
    getAllStatesForAdmin,
    getActiveContent,
    seedStatesIfEmpty,
    createState,
    updateStateById,
    deleteStateById,
    updateStateAvailability,
    bulkUpdateStates,
    updateContent,
  //  ALL_US_STATES
};
