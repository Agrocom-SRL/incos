/**
 * Interfaz del Repositorio de Tipos de Parentesco
 * Tabla: tipos_parentesco
 * 
 * Extiende IBaseRepository con métodos específicos de tipos de parentesco
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class ITipoParentescoRepository extends IBaseRepository {
  // Métodos específicos de tipos de parentesco se agregarán aquí cuando se necesiten
}

