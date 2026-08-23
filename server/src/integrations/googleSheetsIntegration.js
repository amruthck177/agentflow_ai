const BaseIntegration = require('./baseIntegration');
const { google } = require('googleapis');
const env = require('../config/env');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
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
      scope: ['https://www.googleapis.com/auth/spreadsheets'],
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
    return { isConnected: true, provider: 'google-sheets' };
  }

  async execute(action, params, credentials) {
    if (!credentials || !credentials.accessToken) {
      const err = new Error('Google Sheets integration is not connected.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const oauth2Client = this.getOAuthClient();
    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    if (action === 'appendRow') {
      const { spreadsheetId, range, values } = params;
      const res = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: range || 'Sheet1!A:E',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: Array.isArray(values[0]) ? values : [values],
        },
      });

      return {
        success: true,
        updatedRows: res.data.updates?.updatedRows,
        updatedRange: res.data.updates?.updatedRange,
        provider: 'google-sheets',
      };
    }

    if (action === 'readRange') {
      const { spreadsheetId, range } = params;
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: range || 'Sheet1!A1:Z100',
      });

      return {
        success: true,
        rows: res.data.values || [],
        provider: 'google-sheets',
      };
    }

    throw new Error(`Unsupported Google Sheets action: ${action}`);
  }
}

module.exports = new GoogleSheetsIntegration();
