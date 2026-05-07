const router = require('express').Router();
const auth = require('../../middlewares/auth.middleware');
const controller = require('./healthwarehouse.controller');

const requireAdminOrSubAdmin = (req, res, next) => {
  if (!['admin', 'sub-admin'].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden - Admin access required'
    });
  }

  next();
};

router.post('/orders/:orderId/simulate-status', auth, requireAdminOrSubAdmin, controller.simulateOrderStatus);
router.post('/test-orders/:orderId/journey', auth, requireAdminOrSubAdmin, controller.updateTestOrderJourney);

module.exports = router;
