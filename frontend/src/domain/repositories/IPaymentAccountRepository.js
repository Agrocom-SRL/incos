/**
 * Interfaz del Repositorio de Cuentas de Pago
 * Tabla: payment_accounts
 * 
 * Extiende IBaseRepository con métodos específicos de cuentas de pago
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IPaymentAccountRepository extends IBaseRepository {
  // Métodos específicos de cuentas de pago se agregarán aquí cuando se necesiten
}
