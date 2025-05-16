/**
 * Test card numbers for Stripe
 * These can be used with live keys in development to avoid real charges
 */
export const TEST_CARDS = {
  // Always succeeds
  success: '4242 4242 4242 4242',
  
  // Always requires authentication
  authRequired: '4000 0027 6000 3184',
  
  // Always fails
  decline: '4000 0000 0000 0002',
  
  // Insufficient funds
  insufficientFunds: '4000 0000 0000 9995',
};

/**
 * Determines if a card number is a test card
 */
export function isTestCard(cardNumber: string): boolean {
  const normalized = cardNumber.replace(/\s+/g, '');
  return Object.values(TEST_CARDS)
    .map(card => card.replace(/\s+/g, ''))
    .includes(normalized);
}

/**
 * Returns a warning message for development mode
 */
export function getTestModeWarning(): string {
  return `
    ⚠️ IMPORTANT: You are using LIVE Stripe keys in development mode.
    To avoid real charges, use test card numbers:
    
    Success: ${TEST_CARDS.success}
    Auth Required: ${TEST_CARDS.authRequired}
    Decline: ${TEST_CARDS.decline}
    
    Use any future expiration date and any 3-digit CVC.
  `;
}