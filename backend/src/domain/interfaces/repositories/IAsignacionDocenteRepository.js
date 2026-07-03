import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IAsignacionDocenteRepository
 * Define el contrato que debe cumplir el repositorio de asignaciones de docentes
 * 
 * NOTA: Solo extiende IRepository sin métodos adicionales de dominio cruzado.
 * La especialización de consulta está en TeacherAssignmentRepository (buildWhereClause,
 * findAll con includeDeleted). La sincronización con matriculas_materia se orquesta
 * en casos de uso (application), no en este repositorio.
 * 
 * Métodos heredados de IRepository:
 * - findById(id) · findBy(criteria, options) · findAll(filters, page, limit)
 * - create(data, userId) · update(id, data, userId) · delete(id, userId)
 * - search(searchTerm, options) · count(filters)
 *
 * Métodos extra de consulta/comando que los casos de uso consumen vía esta
 * interfaz (leen de vista_base_asignacion_docente_detalle).
 */
export class IAsignacionDocenteRepository extends IRepository {
  /** Asignaciones vigentes del docente en una gestión (carga horaria detalle). */
  async findCargaDetalleByDocenteAndGestion(teacherId, gestionId) {
    throw new Error('Method findCargaDetalleByDocenteAndGestion() must be implemented');
  }

  /** Resumen de carga horaria por docente en una gestión (dashboard). */
  async findCargaResumenByGestion(gestionId) {
    throw new Error('Method findCargaResumenByGestion() must be implemented');
  }

  /** Marca como no vigentes las asignaciones activas previas sobre la misma oferta. */
  async retireVigenteForOffer(offerCourseId, exceptAssignmentId = null, userId = null) {
    throw new Error('Method retireVigenteForOffer() must be implemented');
  }

  /** Listado enriquecido (oferta, materia, paralelo, docente). */
  async findEnriched(filters = {}, page = 1, limit = 50) {
    throw new Error('Method findEnriched() must be implemented');
  }

  /** Detalle enriquecido de una asignación docente. */
  async findEnrichedById(id) {
    throw new Error('Method findEnrichedById() must be implemented');
  }

  /** ¿El estudiante está matriculado en algún curso VIGENTE del docente? (guard de alcance). */
  async docenteTieneEstudianteVigente(_docenteId, _estudianteId) {
    throw new Error('Method docenteTieneEstudianteVigente() must be implemented');
  }
}
