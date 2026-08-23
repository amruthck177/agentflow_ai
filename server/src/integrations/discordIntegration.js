const BaseIntegration = require('./baseIntegration');
const axios = require('axios');
const env = require('../config/env');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  getAuthUrl(redirectUri) {
    const scope = 'bot applications.commands';
    const redirect = encodeURIComponent(redirectUri || env.DISCORD_REDIRECT_URI);
    return `https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_CLIENT_ID}&permissions=2048&scope=${scope}&redirect_uri=${redirect}&response_type=code`;
  }

  async exchangeCode(code, redirectUri) {
    const response = await axios.post(
      'https://discord.com/api/v10/oauth2/token',
      new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri || env.DISCORD_REDIRECT_URI,
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
      details: { guild: response.data.guild },
    };
  }

  async getStatus(credentials) {
    const token = credentials?.accessToken || env.DISCORD_BOT_TOKEN;
    if (!token) {
      return { isConnected: false, reason: 'Missing bot token' };
    }
    return { isConnected: true, provider: 'discord' };
  }

  async execute(action, params, credentials) {
    const token = credentials?.accessToken || env.DISCORD_BOT_TOKEN;
    if (!token) {
      const err = new Error('Discord integration is not configured with a bot token.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    if (action === 'postBotMessage') {
      const { channelId, webhookUrl, content, embeds } = params;

      if (webhookUrl) {
        const res = await axios.post(webhookUrl, { content, embeds });
        return { success: true, status: res.status, provider: 'discord' };
      }

      if (!channelId) {
        throw new Error('Discord action requires either channelId or webhookUrl');
      }

      const res = await axios.post(
        `https://discord.com/api/v10/channels/${channelId}/messages`,
        { content: content || 'Automated message from Agentflow_AI', embeds },
        {
          headers: {
            Authorization: `Bot ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { success: true, messageId: res.data.id, provider: 'discord' };
    }

    throw new Error(`Unsupported Discord action: ${action}`);
  }
}

module.exports = new DiscordIntegration();
