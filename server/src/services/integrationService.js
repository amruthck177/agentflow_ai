const crypto = require('crypto');
const env = require('../config/env');
const Integration = require('../models/Integration');
const gmailIntegration = require('../integrations/gmailIntegration');
const slackIntegration = require('../integrations/slackIntegration');
const discordIntegration = require('../integrations/discordIntegration');
const googleSheetsIntegration = require('../integrations/googleSheetsIntegration');

const INTEGRATION_MAP = {
  gmail: gmailIntegration,
  slack: slackIntegration,
  discord: discordIntegration,
  'google-sheets': googleSheetsIntegration,
};

/**
 * Encrypt a string at rest with AES-256-CBC
 */
const encrypt = (text) => {
  if (!text) return null;
  const key = Buffer.from(
    env.CREDENTIAL_ENCRYPTION_KEY || '01234567890123456789012345678901',
    'utf-8'
  ).slice(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt an AES-256-CBC string
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  const [ivHex, encrypted] = encryptedText.split(':');
  if (!ivHex || !encrypted) return null;

  const key = Buffer.from(
    env.CREDENTIAL_ENCRYPTION_KEY || '01234567890123456789012345678901',
    'utf-8'
  ).slice(0, 32);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Save or update integration credentials for a user
 */
const saveIntegration = async (userId, provider, { accessToken, refreshToken, expiresAt, scopes, metadata }) => {
  const encryptedAccess = accessToken ? encrypt(accessToken) : undefined;
  const encryptedRefresh = refreshToken ? encrypt(refreshToken) : undefined;

  const doc = await Integration.findOneAndUpdate(
    { owner: userId, provider },
    {
      owner: userId,
      provider,
      isConnected: true,
      scopes: scopes || [],
      ...(encryptedAccess && { encryptedAccessToken: encryptedAccess }),
      ...(encryptedRefresh && { encryptedRefreshToken: encryptedRefresh }),
      ...(expiresAt && { expiresAt }),
      ...(metadata && { metadata }),
    },
    { upsert: true, new: true }
  );

  return doc;
};

/**
 * Get decrypted credentials for an integration
 */
const getCredentials = async (userId, provider) => {
  const integration = await Integration.findOne({ owner: userId, provider });
  if (!integration || !integration.isConnected) {
    return null;
  }

  return {
    accessToken: decrypt(integration.encryptedAccessToken),
    refreshToken: decrypt(integration.encryptedRefreshToken),
    expiresAt: integration.expiresAt,
    metadata: integration.metadata,
  };
};

/**
 * List all integrations for a user with connection status
 */
const listUserIntegrations = async (userId) => {
  const providers = ['gmail', 'slack', 'discord', 'google-sheets'];
  const userIntegrations = await Integration.find({ owner: userId });

  const integrationMap = userIntegrations.reduce((acc, curr) => {
    acc[curr.provider] = curr;
    return acc;
  }, {});

  return providers.map((provider) => {
    const item = integrationMap[provider];
    return {
      provider,
      isConnected: Boolean(item && item.isConnected),
      scopes: item?.scopes || [],
      expiresAt: item?.expiresAt || null,
      updatedAt: item?.updatedAt || null,
    };
  });
};

/**
 * Get the authorization URL for initiating OAuth
 */
const getOAuthUrl = (provider, redirectUri) => {
  const handler = INTEGRATION_MAP[provider];
  if (!handler) {
    const err = new Error(`Unsupported integration provider: ${provider}`);
    err.statusCode = 400;
    throw err;
  }
  return handler.getAuthUrl(redirectUri);
};

/**
 * Handle OAuth code exchange and save credentials
 */
const handleOAuthCallback = async (userId, provider, code, redirectUri) => {
  const handler = INTEGRATION_MAP[provider];
  if (!handler) {
    const err = new Error(`Unsupported integration provider: ${provider}`);
    err.statusCode = 400;
    throw err;
  }

  const result = await handler.exchangeCode(code, redirectUri);
  const integration = await saveIntegration(userId, provider, result);
  return integration;
};

/**
 * Execute an action against a specific provider on behalf of a user
 */
const executeIntegrationAction = async (userId, provider, action, params) => {
  const handler = INTEGRATION_MAP[provider];
  if (!handler) {
    const err = new Error(`Unsupported integration provider: ${provider}`);
    err.code = 'INTEGRATION_NOT_SUPPORTED';
    throw err;
  }

  const credentials = await getCredentials(userId, provider);
  return handler.execute(action, params, credentials);
};

module.exports = {
  saveIntegration,
  getCredentials,
  listUserIntegrations,
  getOAuthUrl,
  handleOAuthCallback,
  executeIntegrationAction,
};
