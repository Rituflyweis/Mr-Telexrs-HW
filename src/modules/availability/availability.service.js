const StateAvailability = require('../../models/StateAvailability.model');
const AvailabilityContent = require('../../models/AvailabilityContent.model');
const {ALL_US_STATES} = require('../../constants/states');

// Get all states with availability status
const getAllStates = async () => {
    // Get all states from database with their availability
    const availableStates = await StateAvailability.find({ isActive: true });
    
    // Create a map for quick lookup
    const availabilityMap = new Map();
    availableStates.forEach(state => {
        availabilityMap.set(state.state, state.available);
    });
    
    // Merge all states with their availability status
    const statesWithAvailability = ALL_US_STATES.map(state => ({
        state: state.state,
        code: state.code,
        available: availabilityMap.get(state.state) || false
    }));
    
    return statesWithAvailability;
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
    getActiveContent,
    updateStateAvailability,
    bulkUpdateStates,
    updateContent,
  //  ALL_US_STATES
};