/**
 * Interfaz del Repositorio de Gestiones
 * Tabla: gestiones
 * 
 * Extiende IBaseRepository con métodos específicos de gestiones
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 * 
 * Ubicación: domain/repositories
 * - Parte del módulo Académico
 * - Feature: Gestiones
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IGestionRepository extends IBaseRepository {

  // Métodos específicos de gestiones se agregarán aquí cuando se necesiten
  // Ejemplo futuro:
  // async obtenerPorCodigo(codigo) {
  //   throw new Error('Method obtenerPorCodigo() must be implemented');
  // }
}
