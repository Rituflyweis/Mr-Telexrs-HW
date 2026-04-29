const router = require('express').Router();
const availabilityController = require('./availability.controller');

// Patient/Public: read-only route
router.get('/states', availabilityController.getStatesAvailability);

module.exports = router;
