/**
 * Interfaz del Repositorio de Inscripciones
 * Tabla: inscripciones
 * 
 * Extiende IBaseRepository con métodos específicos de inscripciones
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 * 
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IInscripcionRepository extends IBaseRepository {

  // Métodos específicos de inscripciones se agregarán aquí cuando se necesiten
}
