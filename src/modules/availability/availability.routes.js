const router = require('express').Router();
const availabilityController = require('./availability.controller');
// const { protect } = require('../../middlewares/auth.middleware');
// const { adminMiddleware } = require('../../middlewares/admin.middleware');

// Public routes (no authentication required)
router.get('/states', availabilityController.getStatesAvailability);
// router.get('/states/available', availabilityController.getAvailableStates);
// router.get('/states/check/:stateName', availabilityController.checkStateAvailability);

// Admin only routes
router.post('/states', availabilityController.updateStateAvailability);
// router.post('/states/bulk', availabilityController.bulkUpdateStates);

module.exports = router;