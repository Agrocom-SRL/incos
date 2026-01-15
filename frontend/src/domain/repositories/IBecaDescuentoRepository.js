/**
 * Interfaz del Repositorio de Becas y Descuentos
 * Tabla: becas_descuentos
 * 
 * Extiende IBaseRepository con métodos específicos de becas y descuentos
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 * 
 * Ubicación: domain/repositories
 * - Parte del módulo de Estudiantes
 * - Feature: Becas y Descuentos
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IBecaDescuentoRepository extends IBaseRepository {

  // Métodos específicos de becas y descuentos se agregarán aquí cuando se necesiten
  // Ejemplo futuro:
  // async obtenerPorCodigo(codigo) {
  //   throw new Error('Method obtenerPorCodigo() must be implemented');
  // }
}
