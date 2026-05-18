import { ILicenciaSolicitudRepository } from '../../domain/interfaces/repositories/ILicenciaSolicitudRepository.js';
import { Licencia as LicenciaModel } from '../database/models/licencia.js';
import { BaseRepository } from './BaseRepository.js';
import { LicenseMapper } from '../mappers/LicenseMapper.js';

/**
 * Implementación del repositorio de solicitudes de licencias usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a LicenseRequestMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa LicenseRequestMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ILicenciaSolicitudRepository
 * - Usa LicenseRequestMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {ILicenciaSolicitudRepository}
 * 
 * Esta clase cumple con el contrato ILicenciaSolicitudRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 * 
 * IMPORTANTE: Se eliminaron findByEstudianteId() y findByGestionId() porque son redundantes.
 * Usar en su lugar:
 * - findAll({ studentId: X }) → Reemplaza findByEstudianteId()
 * - findAll({ managementId: X }) → Reemplaza findByGestionId()
 */
export class LicenseRequestRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de solicitudes de licencias
   * @returns {Object} Modelo Licencia
   */
  getModel() {
    return LicenciaModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a LicenseRequestMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {LicenseRequest|null} Entidad de dominio
   */
  toEntity(model) {
    return LicenseMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad LicenseRequest
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ studentId: 1 }) → Busca solicitudes de un estudiante
   * - findAll({ state: 'APROBADA', managementId: 2 }) → Busca solicitudes aprobadas de una gestión
   * - findBy({ studentId: 1, requestDate: '2025-01-15' }) → Busca solicitud específica
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - enrollmentId: ID de la inscripción (inscripcion_id)
   *   - requestDate: Fecha de solicitud
   *   - startDate: Fecha de inicio de la licencia
   *   - endDate: Fecha de fin de la licencia
   *   - totalDays: Total de días
   *   - reason: Motivo (ENFERMEDAD, TRABAJO, FAMILIAR, etc.)
   *   - reasonDetail: Detalle del motivo (búsqueda exacta, para búsqueda de texto usar search())
   *   - state: Estado (PENDIENTE, APROBADA, RECHAZADA, etc.)
   *   - rejectionReason: Motivo de rechazo (búsqueda exacta, para búsqueda de texto usar search())
   *   - decisionObservations: Observaciones de decisión (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.enrollmentId) {
      where.inscripcionId = filters.enrollmentId;
    }
    if (filters.requestDate !== undefined) {
      where.fechaSolicitud = filters.requestDate;
    }
    if (filters.startDate !== undefined) {
      where.fechaInicio = filters.startDate;
    }
    if (filters.endDate !== undefined) {
      where.fechaFin = filters.endDate;
    }
    if (filters.totalDays !== undefined) {
      where.totalDias = filters.totalDays;
    }
    if (filters.reason) {
      where.motivo = filters.reason;
    }
    if (filters.reasonDetail !== undefined) {
      where.detalleMotivo = filters.reasonDetail;
    }
    if (filters.state) {
      where.estado = filters.state;
    }
    if (filters.rejectionReason !== undefined) {
      where.motivoRechazo = filters.rejectionReason;
    }
    if (filters.decisionObservations !== undefined) {
      where.observacionesDecision = filters.decisionObservations;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['detalleMotivo', 'observacionesDecision', 'motivoRechazo'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a LicenseRequestMapper
   * 
   * @param {LicenseRequest|Object} data - Entidad LicenseRequest o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return LicenseMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a LicenseRequestMapper
   * 
   * @param {LicenseRequest|Object} data - Entidad LicenseRequest o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return LicenseMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'licenses';
  }
}
