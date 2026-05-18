import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IDirectorRepository
 *
 * Convención de capas: IDirectorRepository → models/director.js (`directores`)
 * → Director / DirectorMapper / DirectorRepository
 * DDL: database/01-schemas/23-personal-usuarios.sql (tabla directores)
 *
 * Métodos heredados de IRepository: findById, findBy, findAll, create, update, delete, search, count
 */
export class IDirectorRepository extends IRepository {
  // Especialización en DirectorRepository (buildWhereClause)
}
