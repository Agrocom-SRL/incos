/**
 * Interfaz del Repositorio de Países
 * Tabla: paises
 * 
 * Extiende IBaseRepository con métodos específicos de países
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IPaisRepository extends IBaseRepository {
  // Métodos específicos de países se agregarán aquí cuando se necesiten
}

