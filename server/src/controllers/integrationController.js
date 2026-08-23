const integrationService = require('../services/integrationService');

const listIntegrations = async (req, res, next) => {
  try {
    const list = await integrationService.listUserIntegrations(req.user._id);
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const list = await integrationService.listUserIntegrations(req.user._id);
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

const startOAuth = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const url = integrationService.getOAuthUrl(provider);
    res.json({ success: true, url });
  } catch (err) {
    next(err);
  }
};

const handleCallback = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/integrations?error=no_code`);
    }

    await integrationService.handleOAuthCallback(req.user._id, provider, code);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/integrations?success=${provider}`);
  } catch (err) {
    next(err);
  }
};

const saveManualCredentials = async (req, res, next) => {
  try {
    const { provider, accessToken, refreshToken, metadata } = req.body;
    const integration = await integrationService.saveIntegration(req.user._id, provider, {
      accessToken,
      refreshToken,
      metadata,
    });
    res.json({ success: true, data: integration });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listIntegrations,
  getStatus,
  startOAuth,
  handleCallback,
  saveManualCredentials,
};
