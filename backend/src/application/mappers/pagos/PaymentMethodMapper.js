/**
 * Mapper de aplicación: PaymentMethod
 * Convierte entidades de dominio (PaymentMethod) a formato de presentación (API/Spanish)
 */

export function entityToPresentation(paymentMethod) {
  if (!paymentMethod) return null;

  return {
    id: paymentMethod.id,
    codigo: paymentMethod.code,
    nombre: paymentMethod.name,
    activo: paymentMethod.active,
    createdAt: paymentMethod.createdAt,
  };
}

export function entitiesToPresentation(paymentMethods) {
  if (!Array.isArray(paymentMethods)) return [];
  return paymentMethods.map(entityToPresentation);
}

export class PaymentMethodMapper {
  static entityToPresentation(paymentMethod) {
    return entityToPresentation(paymentMethod);
  }

  static entitiesToPresentation(paymentMethods) {
    return entitiesToPresentation(paymentMethods);
  }
}
