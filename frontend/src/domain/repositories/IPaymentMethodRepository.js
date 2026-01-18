/**
 * Interfaz del Repositorio de Métodos de Pago
 * Tabla: payment_methods
 * 
 * Extiende IBaseRepository con métodos específicos de métodos de pago
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IPaymentMethodRepository extends IBaseRepository {
  // Métodos específicos de métodos de pago se agregarán aquí cuando se necesiten
}
