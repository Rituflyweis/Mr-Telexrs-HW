const router = require('express').Router();
const controller = require('./intake-form.controller');
const intakeFormNotes = require('./intakeFormNotes.controller');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { basicInformationValidation, emergencyContactValidation, medicalQuestionsValidation, submitConsultationValidation } = require('./intake-form.validation');
// Get complete intake form
router.get('/intake-form', controller.getIntakeForm);
router.get('/getIntakeFormByPatientId/:id', auth, controller.getIntakeFormByPatientId);

// Section-wise save endpoints
router.post('/intake-form/basic-information', auth, basicInformationValidation, validate, controller.saveBasicInformation);
router.post('/intake-form/emergency-contact', auth, emergencyContactValidation, validate, controller.saveEmergencyContact);
router.post('/intake-form/medical-questions', auth, medicalQuestionsValidation, validate, controller.saveMedicalQuestions);

// Submit consultation (book consultation)
router.post('/intake-form/submit', auth, submitConsultationValidation, validate, controller.submitConsultation);

// Legacy endpoints (for backward compatibility)
router.post('/intake-form', auth, controller.createIntakeForm);
router.put('/intake-form', auth, controller.updateIntakeForm);
// router.post(
//   '/submit-full-intake',
//   auth,
//   intakeController.submitFullIntakeForm
// );

router.post('/intakeFormNotes/create', intakeFormNotes.createNote);
router.get('/intakeFormNotes/:id', intakeFormNotes.getSingleNote);
router.delete('/intakeFormNotes/:id', intakeFormNotes.deleteNote);
router.put('/intakeFormNotes/:id', intakeFormNotes.updateNote);
router.get('/intakeForm/Notes/All', intakeFormNotes.getNotes);

module.exports = router;
