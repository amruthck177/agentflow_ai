const BaseIntegration = require('./baseIntegration');
const axios = require('axios');
const env = require('../config/env');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  getAuthUrl(redirectUri) {
    const scope = 'chat:write,channels:read,incoming-webhook';
    const redirect = encodeURIComponent(redirectUri || env.SLACK_REDIRECT_URI);
    return `https://slack.com/oauth/v2/authorize?client_id=${env.SLACK_CLIENT_ID}&scope=${scope}&redirect_uri=${redirect}`;
  }

  async exchangeCode(code, redirectUri) {
    const response = await axios.post(
      'https://slack.com/api/oauth.v2.access',
      new URLSearchParams({
        client_id: env.SLACK_CLIENT_ID,
        client_secret: env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri || env.SLACK_REDIRECT_URI,
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    if (!response.data.ok) {
      throw new Error(`Slack OAuth failed: ${response.data.error}`);
    }

    return {
      accessToken: response.data.access_token,
      scopes: response.data.scope ? response.data.scope.split(',') : [],
      details: {
        team: response.data.team,
        authed_user: response.data.authed_user,
        incoming_webhook: response.data.incoming_webhook,
      },
    };
  }

  async getStatus(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { isConnected: false, reason: 'Missing access token' };
    }
    return { isConnected: true, provider: 'slack' };
  }

  async execute(action, params, credentials) {
    if (!credentials || !credentials.accessToken) {
      const err = new Error('Slack integration is not connected.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    if (action === 'postMessage') {
      const { channel, text, blocks } = params;
      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: channel || '#general',
          text: text || 'Automated message from Agentflow_AI',
          blocks,
        },
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.ok) {
        if (response.data.error === 'invalid_auth' || response.data.error === 'token_expired') {
          const err = new Error('Slack authentication expired.');
          err.code = 'AUTH_EXPIRED';
          throw err;
        }
        throw new Error(`Slack API error: ${response.data.error}`);
      }

      return { success: true, ts: response.data.ts, channel: response.data.channel, provider: 'slack' };
    }

    throw new Error(`Unsupported Slack action: ${action}`);
  }
}

module.exports = new SlackIntegration();
