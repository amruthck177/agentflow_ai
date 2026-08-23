/**
 * Validation Agent
 * Verifies required output fields and ensures data integrity after each node execution step.
 */
class ValidationAgent {
  /**
   * Validate the execution output of a node
   * @param {object} node - The node definition
   * @param {object} output - The output returned by ExecutionAgent
   * @returns {{ isValid: boolean, missingFields: string[], errors: string[] }}
   */
  validate(node, output) {
    if (!output || typeof output !== 'object') {
      return {
        isValid: false,
        missingFields: ['output'],
        errors: ['Execution agent returned empty or invalid output.'],
      };
    }

    const missingFields = [];
    const errors = [];

    // Type-specific field checks
    if (node.type === 'trigger' && !output.triggered) {
      missingFields.push('triggered');
      errors.push('Trigger node did not produce an active trigger state.');
    }

    if (node.type === 'condition' && output.conditionMet === undefined) {
      missingFields.push('conditionMet');
      errors.push('Condition node did not evaluate to a boolean outcome.');
    }

    if (node.type === 'integration' && !output.success && !output.messageId && !output.status) {
      missingFields.push('success');
      errors.push('Integration action did not confirm successful execution.');
    }

    const isValid = missingFields.length === 0 && errors.length === 0;

    return {
      isValid,
      missingFields,
      errors,
      validatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new ValidationAgent();
