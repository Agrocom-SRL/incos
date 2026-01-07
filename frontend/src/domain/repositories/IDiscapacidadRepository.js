/**
 * Interfaz de Repositorio: IDiscapacidadRepository
 * 
 * Single Responsibility: Define el contrato para operaciones de tipos de discapacidad
 * 
 * Clean Architecture:
 * - Domain Layer: Abstracción que define qué operaciones se pueden realizar
 * - La implementación concreta está en Infrastructure Layer
 * 
 * Ubicación: domain/repositories
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IDiscapacidadRepository extends IBaseRepository {
  // Los métodos base (findById, findAll, create, update, delete, search)
  // están definidos en IBaseRepository
  // Si se necesitan métodos específicos, se agregan aquí
}

