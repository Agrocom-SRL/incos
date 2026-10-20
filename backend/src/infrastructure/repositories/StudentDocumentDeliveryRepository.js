import { BaseRepository } from './BaseRepository.js';
import { EstudianteDocumentoEntrega } from '../database/models/estudiante_documento_entrega.js';
import { StudentDocumentDeliveryMapper } from '../mappers/StudentDocumentDeliveryMapper.js';
import { sequelize } from '../database/sequelize.js';

/**
 * Implementación del repositorio de entregas de documentos de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentDocumentDeliveryMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentDocumentDeliveryMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEstudianteDocumentoEntregaRepository
 * - Usa StudentDocumentDeliveryMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IEstudianteDocumentoEntregaRepository}
 *
 * Esta clase cumple con el contrato IEstudianteDocumentoEntregaRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 */
export class StudentDocumentDeliveryRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de entregas de documentos de estudiantes
   * @returns {Object} Modelo EstudianteDocumentoEntrega
   */
  getModel() {
    return EstudianteDocumentoEntrega;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudentDocumentDeliveryMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {StudentDocumentDelivery|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentDocumentDeliveryMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad StudentDocumentDelivery
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findAll({ studentId: 1 }) → Busca entregas de documentos de un estudiante
   * - findAll({ documentacionId: 2, entregado: true }) → Busca documentos entregados
   * - findBy({ studentId: 1, documentacionId: 2 }) → Busca entrega específica
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - studentId: ID del estudiante
   *   - documentacionId: ID de la documentación
   *   - entregado: Si fue entregado (true/false)
   *   - enTramite: Si está en trámite (true/false)
   *   - fechaEntrega: Fecha de entrega
   *   - observaciones: Observaciones (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (nombres en español según la entidad) → BD (snake_case español)
    // NOTA: La entidad StudentDocumentDelivery usa nombres en español (entregado, enTramite, etc.)
    if (filters.studentId !== undefined) {
      where.estudianteId = filters.studentId;
    }
    if (filters.documentacionId !== undefined) {
      where.documentacionId = filters.documentacionId;
    }
    if (filters.entregado !== undefined) {
      where.entregado = filters.entregado;
    }
    if (filters.enTramite !== undefined) {
      where.enTramite = filters.enTramite;
    }
    if (filters.fechaEntrega !== undefined) {
      where.fechaEntrega = filters.fechaEntrega;
    }
    if (filters.observaciones !== undefined) {
      where.observaciones = filters.observaciones;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['observaciones'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentDocumentDeliveryMapper
   *
   * @param {StudentDocumentDelivery|Object} data - Entidad StudentDocumentDelivery o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return StudentDocumentDeliveryMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentDocumentDeliveryMapper
   *
   * @param {StudentDocumentDelivery|Object} data - Entidad StudentDocumentDelivery o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return StudentDocumentDeliveryMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'studentDocumentDeliveries';
  }

  /**
   * Obtiene entregas de documentos con detalles del documento
   * Retorna datos que incluyen tanto la información de la entrega como los detalles del documento
   *
   * IMPORTANTE:
   * - Retorna objetos planos (no entidades) porque viene de consulta SQL directa
   * - Solo incluye registros activos (soft delete validado)
   *
   * @param {Object} filters - Filtros opcionales
   *   - estudiante_id: ID del estudiante
   *   - documentacion_id: ID de la documentación
   *   - tipo_documento: Tipo de documento ('INSCRIPCION', 'LICENCIA', 'PASANTIA', etc.)
   *   - entregado: Si fue entregado (true/false)
   *   - documento_padre_id: ID del documento padre (null para documentos sin padre, número para padre específico)
   * @returns {Promise<Array>} Array de objetos planos con datos enriquecidos
   *   Campos retornados (según vista_base_estudiante_documentos_entrega):
   *   - entrega_id: ID del registro de entrega
   *   - estudiante_id: ID del estudiante
   *   - documentacion_id: ID de la documentación
   *   - entregado: Si fue entregado
   *   - en_tramite: Si está en trámite
   *   - fecha_entrega: Fecha de entrega
   *   - observaciones_entrega: Observaciones
   *   - nombre_documento: Nombre del documento
   *   - tipo_documento: Tipo de documento
   *   - documento_padre_id: ID del documento padre
   *   - es_documento_sistema: Si es documento del sistema
   */
  async obtenerEntregasConDetalle(filters = {}) {
    // Construir condiciones WHERE dinámicamente
    const whereConditions = [];
    const replacements = [];

    if (filters.estudiante_id !== undefined) {
      whereConditions.push('estudiante_id = ?');
      replacements.push(filters.estudiante_id);
    }

    if (filters.documentacion_id !== undefined) {
      whereConditions.push('documentacion_id = ?');
      replacements.push(filters.documentacion_id);
    }

    if (filters.tipo_documento !== undefined) {
      whereConditions.push('tipo_documento = ?');
      replacements.push(filters.tipo_documento);
    }

    if (filters.entregado !== undefined) {
      whereConditions.push('entregado = ?');
      replacements.push(filters.entregado);
    }

    if (filters.documento_padre_id !== undefined) {
      if (filters.documento_padre_id === null) {
        // Filtrar documentos sin padre (documentos raíz)
        whereConditions.push('documento_padre_id IS NULL');
      } else {
        // Filtrar documentos con un padre específico
        whereConditions.push('documento_padre_id = ?');
        replacements.push(filters.documento_padre_id);
      }
    }

    // Construir la consulta SQL
    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT *
      FROM vista_base_estudiante_documentos_entrega
      ${whereClause}
      ORDER BY nombre_documento ASC
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    // Retornar datos planos (no entidades, porque viene de consulta SQL directa)
    return results;
  }
}
