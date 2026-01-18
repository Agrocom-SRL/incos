/**
 * Mapper de aplicación: AuthorizedBank
 * Convierte entidades de dominio (AuthorizedBank) a formato de presentación (API/Spanish)
 */

export function entityToPresentation(authorizedBank) {
  if (!authorizedBank) return null;

  return {
    id: authorizedBank.id,
    metodoPagoId: authorizedBank.paymentMethodId,
    codigo: authorizedBank.code,
    nombre: authorizedBank.name,
    activo: authorizedBank.active,
    createdAt: authorizedBank.createdAt,
  };
}

export function entitiesToPresentation(authorizedBanks) {
  if (!Array.isArray(authorizedBanks)) return [];
  return authorizedBanks.map(entityToPresentation);
}

export class AuthorizedBankMapper {
  static entityToPresentation(authorizedBank) {
    return entityToPresentation(authorizedBank);
  }

  static entitiesToPresentation(authorizedBanks) {
    return entitiesToPresentation(authorizedBanks);
  }
}
