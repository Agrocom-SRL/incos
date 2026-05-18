import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ISecretariaRepository
 *
 * Convención de capas: ISecretariaRepository → models/secretaria.js (`secretarias`)
 * → Secretary / SecretaryMapper / SecretaryRepository
 * DDL: database/01-schemas/23-personal-usuarios.sql (tabla secretarias)
 *
 * Métodos heredados de IRepository: findById, findBy, findAll, create, update, delete, search, count
 */
export class ISecretariaRepository extends IRepository {
  // Especialización en SecretaryRepository (buildWhereClause)
}
