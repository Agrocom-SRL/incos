import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio CRUD: IParticipanteRepository
 *
 * Participantes de cursos de capacitación (tabla `participantes`, módulo CAP).
 * Persona externa a la matrícula formal (sin FK a estudiantes/usuarios, sin
 * acceso al sistema).
 *
 * Arquetipo A (CRUD): EXTIENDE IRepository (findById/findAll/create/update/delete/...).
 * La unicidad real de un participante es CI + expedición y se resuelve en
 * lógica de negocio (sin UNIQUE en BD, mismo criterio que `estudiantes`).
 */
export class IParticipanteRepository extends IRepository {
  /**
   * Busca un participante activo por CI + expedición (identidad de negocio).
   * Usado para validar unicidad al crear/editar y para reusar participantes
   * existentes al inscribir.
   *
   * @param {string} ci - Cédula de identidad
   * @param {string|null} expedicion - Expedición del CI (SC, LP, CB, ...) o null
   * @param {Object} options - Opciones opcionales
   *   - excludeId: ID a excluir (para validar unicidad en edición)
   * @returns {Promise<Object|null>} Participante (objeto de dominio) o null
   */
  async findByCiExpedicion(_ci, _expedicion, _options = {}) {
    throw new Error('Method findByCiExpedicion() must be implemented');
  }
}
