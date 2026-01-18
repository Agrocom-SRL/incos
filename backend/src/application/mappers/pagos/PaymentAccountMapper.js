/**
 * Mapper de aplicación: PaymentAccount
 * Convierte entidades de dominio (PaymentAccount) a formato de presentación (API/Spanish)
 */

export function entityToPresentation(paymentAccount) {
  if (!paymentAccount) return null;

  return {
    id: paymentAccount.id,
    metodoPagoId: paymentAccount.paymentMethodId,
    bancoId: paymentAccount.bankId,
    nombreTitular: paymentAccount.accountHolderName,
    numeroCuenta: paymentAccount.accountNumber,
    numeroCelular: paymentAccount.phoneNumber,
    qrImagenUrl: paymentAccount.qrImageUrl,
    activo: paymentAccount.active,
    createdAt: paymentAccount.createdAt,
  };
}

export function entitiesToPresentation(paymentAccounts) {
  if (!Array.isArray(paymentAccounts)) return [];
  return paymentAccounts.map(entityToPresentation);
}

export class PaymentAccountMapper {
  static entityToPresentation(paymentAccount) {
    return entityToPresentation(paymentAccount);
  }

  static entitiesToPresentation(paymentAccounts) {
    return entitiesToPresentation(paymentAccounts);
  }
}
