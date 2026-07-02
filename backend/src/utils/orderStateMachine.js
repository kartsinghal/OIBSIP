/**
 * Strict Order State Machine Transitions
 * Defines the ONLY allowed next states for any given current state.
 */
const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['baking', 'cancelled'],
  baking: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [], // terminal state
  cancelled: [], // terminal state
};

/**
 * Validates if an order can transition from its current status to a new status.
 * Throws a formatted HTTP Error if the transition is invalid.
 * 
 * @param {string} currentStatus - The current order status
 * @param {string} newStatus - The requested new order status
 * @returns {boolean} true if valid
 */
export const validateStatusTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) {
    return true; // No-op is always valid
  }

  const allowedNextStates = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowedNextStates) {
    const err = new Error(`Unknown current status: ${currentStatus}`);
    err.statusCode = 400;
    throw err;
  }

  if (!allowedNextStates.includes(newStatus)) {
    const err = new Error(
      `Invalid state transition. Cannot move from '${currentStatus}' to '${newStatus}'. ` +
      `Allowed next states from '${currentStatus}' are: [${allowedNextStates.join(', ') || 'none (terminal state)'}].`
    );
    err.statusCode = 409; // Conflict
    throw err;
  }

  return true;
};
