const router = require('express').Router();
const controller = require('./prescription.controller');
const auth = require('../../middlewares/auth.middleware');

// Patient prescription routes
router.get('/prescriptions', controller.getPrescriptions);
router.get('/prescriptions/:id', controller.getPrescriptionById);
router.get('/prescriptions/:id/pdf', controller.getPrescriptionPDF);
router.post('/prescriptions/:id/reorder', auth, controller.reorderPrescription);
router.post('/prescriptions/create', auth, controller.createPrescription);

module.exports = router;

