/**
 * Interfaz del Repositorio de Departamentos
 * Tabla: departamentos
 * 
 * Extiende IBaseRepository con métodos específicos de departamentos
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IDepartamentoRepository extends IBaseRepository {
  // Métodos específicos de departamentos se agregarán aquí cuando se necesiten
}

