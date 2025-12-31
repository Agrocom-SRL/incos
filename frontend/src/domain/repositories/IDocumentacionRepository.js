/**
 * Interfaz del Repositorio de Documentación
 * Tabla: documentacion
 * 
 * Extiende IBaseRepository con métodos específicos de documentación
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IDocumentacionRepository extends IBaseRepository {
  // Métodos específicos de documentación se agregarán aquí cuando se necesiten
}

