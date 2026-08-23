/**
 * Base Integration Class
 * Every integration provider inherits from this class to enforce a consistent contract.
 */
class BaseIntegration {
  constructor(providerName) {
    if (this.constructor === BaseIntegration) {
      throw new Error('BaseIntegration is abstract and cannot be instantiated directly.');
    }
    this.provider = providerName;
  }

  /**
   * Check connection / auth status for this integration
   * @param {object} credentials - Decrypted integration credentials
   * @returns {Promise<{ isConnected: boolean, details?: object }>}
   */
  async getStatus(credentials) {
    throw new Error('getStatus() must be implemented by subclass');
  }

  /**
   * Execute an action on the third party provider
   * @param {string} action - Action name (e.g. 'sendMail', 'postMessage')
   * @param {object} params - Input parameters for the action
   * @param {object} credentials - Decrypted credentials
   * @returns {Promise<object>}
   */
  async execute(action, params, credentials) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Generate the OAuth authorization URL
   * @param {string} redirectUri
   * @returns {string}
   */
  getAuthUrl(redirectUri) {
    throw new Error('getAuthUrl() must be implemented by subclass');
  }

  /**
   * Exchange authorization code for tokens
   * @param {string} code
   * @param {string} redirectUri
   * @returns {Promise<{ accessToken: string, refreshToken?: string, expiresAt?: Date }>}
   */
  async exchangeCode(code, redirectUri) {
    throw new Error('exchangeCode() must be implemented by subclass');
  }
}

module.exports = BaseIntegration;
