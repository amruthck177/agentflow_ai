const express = require('express');
const integrationController = require('../controllers/integrationController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public OAuth callback or redirect handler
router.get('/oauth/:provider/callback', auth, integrationController.handleCallback);

// Protected routes
router.use(auth);

router.get('/', integrationController.listIntegrations);
router.get('/status', integrationController.getStatus);
router.get('/oauth/:provider/start', integrationController.startOAuth);
router.post('/', integrationController.saveManualCredentials);

module.exports = router;
