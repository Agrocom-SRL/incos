import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IRectorRepository
 *
 * Convención de capas: IRectorRepository → models/rector.js (`rectores`)
 * → Rector / RectorMapper / RectorRepository
 * DDL: database/01-schemas/22-personal-usuarios.sql (tabla rectores)
 *
 * Métodos heredados de IRepository: findById, findBy, findAll, create, update, delete, search, count
 */
export class IRectorRepository extends IRepository {
  // Especialización en RectorRepository (buildWhereClause)
}
