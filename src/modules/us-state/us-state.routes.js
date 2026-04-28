const express = require('express');
const router = express.Router();
const controller = require('./us-state.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { isAdminOrSubAdmin } = require('../../middlewares/admin.middleware');

// Public / Patient dropdown/list endpoints
router.get('/patient/us-states', controller.getStatesForDropdown);
router.get('/patient/us-states/dropdown', controller.getStatesForDropdown);

// Admin — auth required
router.use('/admin/us-states', authMiddleware, isAdminOrSubAdmin);

router.get('/admin/us-states', controller.getAllStates);
router.post('/admin/us-states', controller.createState);
router.put('/admin/us-states/:id/availability', controller.toggleAvailability);
router.patch('/admin/us-states/:id/availability', controller.toggleAvailability);
router.put('/admin/us-states/:id', controller.updateState);
router.delete('/admin/us-states/:id', controller.deleteState);

module.exports = router;
