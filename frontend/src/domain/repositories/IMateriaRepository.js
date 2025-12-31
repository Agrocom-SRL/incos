/**
 * Interfaz del Repositorio de Materias
 * Tabla: materias
 * 
 * Extiende IBaseRepository con métodos específicos de materias
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 * 
 * Ubicación: domain/repositories
 * - Parte del módulo de Configuración
 * - Submódulo: Académico
 * - Feature: Materias
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IMateriaRepository extends IBaseRepository {

  // Métodos específicos de materias se agregarán aquí cuando se necesiten
  // Ejemplo futuro:
  // async obtenerPorCarreraId(carreraId) {
  //   throw new Error('Method obtenerPorCarreraId() must be implemented');
  // }
}

