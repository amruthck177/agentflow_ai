/**
 * Recovery Agent
 * Classifies failure types and decides appropriate recovery strategy (retry with backoff or escalate).
 */
class RecoveryAgent {
  /**
   * Classify an error and return a recovery action plan
   * @param {Error|object} error - The caught execution or validation error
   * @param {number} currentRetryCount - Current attempt count
   * @returns {{ failureType: string, action: 'retry_with_backoff'|'escalate', backoffMs: number, reason: string }}
   */
  recover(error, currentRetryCount = 0) {
    const message = error.message || String(error);
    const code = error.code || error.status || '';

    let failureType = 'TRANSIENT';
    let action = 'retry_with_backoff';
    let backoffMs = Math.min(1000 * Math.pow(2, currentRetryCount), 30000); // Exponential backoff up to 30s

    if (code === 'AUTH_EXPIRED' || message.includes('AUTH_EXPIRED') || message.includes('invalid_auth')) {
      failureType = 'AUTH_EXPIRED';
      action = 'escalate';
    } else if (code === 'INTEGRATION_NOT_CONNECTED' || message.includes('INTEGRATION_NOT_CONNECTED')) {
      failureType = 'INTEGRATION_NOT_CONNECTED';
      action = 'escalate';
    } else if (message.includes('missing') || message.includes('Missing') || code === 'MISSING_FIELDS') {
      failureType = 'MISSING_FIELDS';
      action = currentRetryCount >= 2 ? 'escalate' : 'retry_with_backoff';
    } else if (code === 429 || message.includes('rate limit') || message.includes('Rate limit')) {
      failureType = 'RATE_LIMIT';
      action = 'retry_with_backoff';
      backoffMs = 5000 * (currentRetryCount + 1);
    } else if (code >= 500 || message.includes('API error') || message.includes('timeout')) {
      failureType = 'API_FAILURE';
      action = currentRetryCount >= 3 ? 'escalate' : 'retry_with_backoff';
    } else {
      failureType = 'TRANSIENT';
      action = currentRetryCount >= 2 ? 'escalate' : 'retry_with_backoff';
    }

    return {
      failureType,
      action,
      backoffMs,
      retryCount: currentRetryCount + 1,
      reason: `Classified as ${failureType}. Recovery strategy: ${action}.`,
    };
  }
}

module.exports = new RecoveryAgent();
