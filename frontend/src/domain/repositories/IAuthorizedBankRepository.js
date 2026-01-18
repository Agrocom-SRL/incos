/**
 * Interfaz del Repositorio de Bancos Autorizados
 * Tabla: authorized_banks
 * 
 * Extiende IBaseRepository con métodos específicos de bancos autorizados
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IAuthorizedBankRepository extends IBaseRepository {
  // Métodos específicos de bancos autorizados se agregarán aquí cuando se necesiten
}
