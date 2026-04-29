const router = require('express').Router();
const availabilityController = require('./availability.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const ensureAdminAccess = (req, res, next) => {
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'sub-admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden - Admin or Sub-Admin access required'
    });
  }
  next();
};

router.use(authMiddleware);
router.use(ensureAdminAccess);

// Admin state management
router.get('/states', availabilityController.getAdminStates);
router.post('/states', availabilityController.createState);
router.put('/states/:id', availabilityController.updateState);
router.patch('/states/:id/availability', availabilityController.updateState);
router.delete('/states/:id', availabilityController.deleteState);

module.exports = router;
