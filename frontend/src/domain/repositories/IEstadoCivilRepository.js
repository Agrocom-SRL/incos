/**
 * Interfaz del Repositorio de Estados Civiles
 * Tabla: estados_civiles
 * 
 * Extiende IBaseRepository con métodos específicos de estados civiles
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IEstadoCivilRepository extends IBaseRepository {
  // Métodos específicos de estados civiles se agregarán aquí cuando se necesiten
}

