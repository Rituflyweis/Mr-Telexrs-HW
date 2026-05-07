const router = require('express').Router();
const controller = require('./healthwarehouse.controller');

router.post('/order', controller.handleOrderWebhook);
router.post('/shipment', controller.handleShipmentWebhook);

module.exports = router;
