const availabilityService = require('./availability.service');

// GET: Get all states with availability status
const getStatesAvailability = async (req, res, next) => {
    try {
        const states = await availabilityService.getAllStates();
        const content = await availabilityService.getActiveContent();
        
        res.status(200).json({
            success: true,
            data: {
                states: states,
                content: content
            }
        });
    } catch (error) {
        next(error);
    }
};

// POST: Update state availability (admin only)
const updateStateAvailability = async (req, res, next) => {
    try {
        const { states, content } = req.body;
        
        if (!states || !Array.isArray(states)) {
            return res.status(400).json({
                success: false,
                error: 'States array is required'
            });
        }
        
        // Update states
        const updateResults = await availabilityService.updateStateAvailability(states);
        
        // Update content if provided
        let contentResult = null;
        if (content && content.title && content.description && content.points) {
            contentResult = await availabilityService.updateContent(content);
        }
        
        // Get updated data to return
        const updatedStates = await availabilityService.getAllStates();
        const activeContent = contentResult || await availabilityService.getActiveContent();
        
        res.status(200).json({
            success: true,
            message: 'State availability updated successfully',
            data: {
                states: updatedStates,
                content: activeContent
            },
            meta: {
                updated_count: updateResults.filter(r => r.success).length,
                failed_count: updateResults.filter(r => !r.success).length,
                details: updateResults
            }
        });
    } catch (error) {
        next(error);
    }
};

// POST: Bulk update all states (admin only)
const bulkUpdateStates = async (req, res, next) => {
    try {
        const { states } = req.body;
        
        if (!states || !Array.isArray(states)) {
            return res.status(400).json({
                success: false,
                error: 'States array is required'
            });
        }
        
        const updated = await availabilityService.bulkUpdateStates(states);
        
        res.status(200).json({
            success: true,
            message: 'All states updated successfully',
            data: {
                updated_count: updated.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET: Get only available states (for checkout page)
const getAvailableStates = async (req, res, next) => {
    try {
        const allStates = await availabilityService.getAllStates();
        const availableStates = allStates.filter(state => state.available === true);
        
        res.status(200).json({
            success: true,
            data: {
                states: availableStates,
                count: availableStates.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET: Check if a specific state is available
const checkStateAvailability = async (req, res, next) => {
    try {
        const { stateName } = req.params;
        
        const allStates = await availabilityService.getAllStates();
        const state = allStates.find(s => 
            s.state.toLowerCase() === stateName.toLowerCase()
        );
        
        if (!state) {
            return res.status(404).json({
                success: false,
                error: `State "${stateName}" not found. Please provide full state name (e.g., "California", not "CA" or "california")`
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                state: state.state,
                code: state.code,
                available: state.available,
                message: state.available 
                    ? `TeleRxs is available in ${state.state}!` 
                    : `TeleRxs is not yet available in ${state.state}. We're working on expanding to your state soon!`
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStatesAvailability,
    updateStateAvailability,
    bulkUpdateStates,
    getAvailableStates,
    checkStateAvailability
};