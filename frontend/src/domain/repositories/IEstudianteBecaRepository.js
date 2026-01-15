/**
 * Interfaz del Repositorio de Becas de Estudiantes
 * Tabla: estudiantes_becas
 * 
 * Extiende IBaseRepository con métodos específicos de becas de estudiantes
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 * 
 * Ubicación: domain/repositories
 * - Parte del módulo de Estudiantes
 * - Feature: Asignación de Becas
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IEstudianteBecaRepository extends IBaseRepository {

  // Métodos específicos de becas de estudiantes se agregarán aquí cuando se necesiten
  // Ejemplo futuro:
  // async obtenerPorEstudianteId(estudianteId) {
  //   throw new Error('Method obtenerPorEstudianteId() must be implemented');
  // }
}
