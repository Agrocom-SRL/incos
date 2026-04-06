import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ISecretaryRepository
 *
 * Convención de capas: ISecretaryRepository → models/secretaria.js (`secretarias`)
 * → Secretary / SecretaryMapper / SecretaryRepository
 * DDL: database/01-schemas/22-personal-usuarios.sql (tabla secretarias)
 *
 * Métodos heredados de IRepository: findById, findBy, findAll, create, update, delete, search, count
 */
export class ISecretaryRepository extends IRepository {
  // Especialización en SecretaryRepository (buildWhereClause)
}
