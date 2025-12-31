/**
 * Interfaz del Repositorio de Carreras
 * Tabla: carreras
 * 
 * Extiende IBaseRepository con métodos específicos de carreras
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 * 
 * Ubicación: domain/repositories
 * - Parte del módulo de Configuración
 * - Submódulo: Académico
 * - Feature: Carreras
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class ICarreraRepository extends IBaseRepository {

  // Métodos específicos de carreras se agregarán aquí cuando se necesiten
  // Ejemplo futuro:
  // async obtenerPorCodigo(codigo) {
  //   throw new Error('Method obtenerPorCodigo() must be implemented');
  // }
}

