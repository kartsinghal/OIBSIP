/**
 * Server-side price calculation for custom pizza orders.
 * The client NEVER sets the price — this module owns all pricing logic.
 */

// ── Price deltas ──────────────────────────────────────────────────────────────

export const SIZE_PRICES = {
  small:  -30,   // discount from medium base
  medium:   0,   // base price
  large:   60,   // premium over medium
};

export const CRUST_PRICES = {
  thin:     0,
  classic:  0,
  thick:   30,
};

export const EXTRA_CHEESE_PRICE = 40;

export const TOPPING_PRICE = 30; // per topping

// ── Allowed values (single source of truth) ───────────────────────────────────

export const VALID_SIZES   = Object.keys(SIZE_PRICES);
export const VALID_CRUSTS  = Object.keys(CRUST_PRICES);

/**
 * Compute the server-authoritative unit price for one pizza item.
 *
 * @param {number}   basePrice   - Pizza.basePrice from DB
 * @param {string}   size        - 'small' | 'medium' | 'large'
 * @param {string}   crust       - 'thin' | 'classic' | 'thick'
 * @param {boolean}  extraCheese
 * @param {string[]} toppings    - array of topping names
 * @returns {number} unit price (rounded to 2 dp)
 */
export function computeUnitPrice(basePrice, size, crust, extraCheese, toppings = []) {
  const price =
    basePrice +
    (SIZE_PRICES[size]  ?? 0) +
    (CRUST_PRICES[crust] ?? 0) +
    (extraCheese ? EXTRA_CHEESE_PRICE : 0) +
    toppings.length * TOPPING_PRICE;

  return Math.round(price * 100) / 100;
}

/**
 * Validate the builder options for a single order item.
 * Returns an array of error strings (empty = valid).
 *
 * @param {object} item - raw order item from request body
 * @returns {string[]}
 */
export function validateBuilderOptions(item) {
  const errors = [];

  if (!VALID_SIZES.includes(item.size)) {
    errors.push(`size must be one of: ${VALID_SIZES.join(', ')}`);
  }

  if (item.crust && !VALID_CRUSTS.includes(item.crust)) {
    errors.push(`crust must be one of: ${VALID_CRUSTS.join(', ')}`);
  }

  if (item.extraCheese !== undefined && typeof item.extraCheese !== 'boolean') {
    errors.push('extraCheese must be a boolean');
  }

  for (const field of ['base', 'sauce', 'cheese']) {
    if (item[field] !== undefined && item[field] !== '' && typeof item[field] !== 'string') {
      errors.push(`${field} must be a string`);
    }
  }

  for (const field of ['veggies', 'meat']) {
    if (item[field] !== undefined) {
      if (!Array.isArray(item[field])) {
        errors.push(`${field} must be an array of strings`);
      } else if (item[field].some((value) => typeof value !== 'string' || !value.trim())) {
        errors.push(`each ${field} value must be a non-empty string`);
      }
    }
  }

  if (item.toppings !== undefined) {
    if (!Array.isArray(item.toppings)) {
      errors.push('toppings must be an array of strings');
    } else if (item.toppings.some((t) => typeof t !== 'string' || !t.trim())) {
      errors.push('each topping must be a non-empty string');
    } else if (item.toppings.length > 8) {
      errors.push('maximum 8 toppings allowed');
    }
  }

  return errors;
}
