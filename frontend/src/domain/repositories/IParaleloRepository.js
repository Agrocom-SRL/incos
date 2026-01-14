/**
 * Interfaz del Repositorio de Paralelos
 * Tabla: paralelos
 * 
 * Extiende IBaseRepository con métodos específicos de paralelos
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 * 
 * Ubicación: domain/repositories
 * - Parte del módulo Académico
 * - Feature: Paralelos
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IParaleloRepository extends IBaseRepository {

  // Métodos específicos de paralelos se agregarán aquí cuando se necesiten
  // Ejemplo futuro:
  // async obtenerPorCarrera(carreraId) {
  //   throw new Error('Method obtenerPorCarrera() must be implemented');
  // }
}
