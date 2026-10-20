/** Patrones del backend cuando falta el pago del aporte académico. */
export const PAYMENT_REQUIRED_ERROR_PATTERNS = [
  'pago del aporte académico',
  'pendiente de pago',
];

export const isPaymentRequiredError = (result) => {
  if (result?.success) return false;
  const msg = typeof result?.error === 'object' ? result?.error?.message : result?.error;
  const str = (msg ?? '').toString().toLowerCase();
  return PAYMENT_REQUIRED_ERROR_PATTERNS.some((pattern) => str.includes(pattern.toLowerCase()));
};
