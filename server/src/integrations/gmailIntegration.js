const BaseIntegration = require('./baseIntegration');
const { google } = require('googleapis');
const env = require('../config/env');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  getOAuthClient(redirectUri) {
    return new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      redirectUri || env.GOOGLE_REDIRECT_URI
    );
  }

  getAuthUrl(redirectUri) {
    const oauth2Client = this.getOAuthClient(redirectUri);
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
    });
  }

  async exchangeCode(code, redirectUri) {
    const oauth2Client = this.getOAuthClient(redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    };
  }

  async getStatus(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { isConnected: false, reason: 'Missing access token' };
    }
    return { isConnected: true, provider: 'gmail' };
  }

  async execute(action, params, credentials) {
    if (!credentials || !credentials.accessToken) {
      const err = new Error('Gmail integration is not connected.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const oauth2Client = this.getOAuthClient();
    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    if (action === 'sendMail') {
      const { to, subject, body } = params;
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject || 'Agentflow Notification').toString('base64')}?=`;
      const messageParts = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body || 'Automated message from Agentflow_AI',
      ];
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });

      return { success: true, messageId: res.data.id, provider: 'gmail' };
    }

    if (action === 'readMail') {
      const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: params.maxResults || 5,
        q: params.query || '',
      });
      return { success: true, messages: res.data.messages || [], provider: 'gmail' };
    }

    throw new Error(`Unsupported Gmail action: ${action}`);
  }
}

module.exports = new GmailIntegration();
