/**
 * Interfaz del Repositorio de Idiomas
 * Tabla: idiomas
 * 
 * Extiende IBaseRepository con métodos específicos de idiomas
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IIdiomaRepository extends IBaseRepository {
  // Métodos específicos de idiomas se agregarán aquí cuando se necesiten
}

