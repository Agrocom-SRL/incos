import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IInstitucionRepository
 * Define el contrato que debe cumplir el repositorio de instituciones.
 *
 * NOTA: Solo extiende IRepository sin métodos adicionales.
 * La especialización está en la implementación (buildWhereClause), no en la interfaz.
 */
export class IInstitucionRepository extends IRepository {
  // Solo hereda métodos de IRepository
}

