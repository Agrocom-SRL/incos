import { DocumentoEstudiante as DocumentoEstudianteModel } from '../database/models/documento_estudiante.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentDocumentMapper } from '../mappers/StudentDocumentMapper.js';

/**
 * Implementación del repositorio de documentos de estudiantes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentDocumentMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentDocumentMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IDocumentoEstudianteRepository
 * - Usa StudentDocumentMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IDocumentoEstudianteRepository}
 *
 * Esta clase cumple con el contrato IDocumentoEstudianteRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 */
export class StudentDocumentRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de documentos de estudiantes
   * @returns {Object} Modelo DocumentoEstudiante
   */
  getModel() {
    return DocumentoEstudianteModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudentDocumentMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {StudentDocument|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentDocumentMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad StudentDocument
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findAll({ studentId: 1 }) → Busca documentos de un estudiante
   * - findAll({ tipoDocumento: 'INSCRIPCION', state: 'APROBADO' }) → Busca documentos aprobados de inscripción
   * - findBy({ studentId: 1, documentacionId: 2 }) → Busca documento específico
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - studentId: ID del estudiante
   *   - tipoDocumento: Tipo de documento (INSCRIPCION, LICENCIA, PASANTIA, etc.)
   *   - documentacionId: ID de la documentación
   *   - fileName: Nombre del archivo (búsqueda exacta, para búsqueda de texto usar search())
   *   - filePath: Ruta del archivo (búsqueda exacta)
   *   - extension: Extensión del archivo
   *   - tipoMime: Tipo MIME del archivo
   *   - contieneMultipleDocumentos: Si contiene múltiples documentos (true/false)
   *   - verified: Si está verificado (true/false)
   *   - verifiedBy: ID del usuario que verificó
   *   - verificationDate: Fecha de verificación
   *   - verificationObservations: Observaciones de verificación (búsqueda exacta, para búsqueda de texto usar search())
   *   - state: Estado del documento (PENDIENTE, APROBADO, RECHAZADO, etc.)
   *   - rejectionReason: Motivo de rechazo (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.studentId) {
      where.estudianteId = filters.studentId;
    }
    if (filters.tipoDocumento) {
      where.tipoDocumento = filters.tipoDocumento;
    }
    if (filters.documentacionId) {
      where.documentacionId = filters.documentacionId;
    }
    if (filters.fileName !== undefined) {
      where.nombreArchivo = filters.fileName;
    }
    if (filters.filePath !== undefined) {
      where.rutaArchivo = filters.filePath;
    }
    if (filters.extension !== undefined) {
      where.extension = filters.extension;
    }
    if (filters.tipoMime !== undefined) {
      where.tipoMime = filters.tipoMime;
    }
    if (filters.contieneMultipleDocumentos !== undefined) {
      where.contieneMultipleDocumentos = filters.contieneMultipleDocumentos;
    }
    if (filters.verified !== undefined) {
      where.verificado = filters.verified;
    }
    if (filters.verifiedBy) {
      where.verificadoPor = filters.verifiedBy;
    }
    if (filters.verificationDate !== undefined) {
      where.fechaVerificacion = filters.verificationDate;
    }
    if (filters.verificationObservations !== undefined) {
      where.observacionesVerificacion = filters.verificationObservations;
    }
    if (filters.state) {
      where.estado = filters.state;
    }
    if (filters.rejectionReason !== undefined) {
      where.motivoRechazo = filters.rejectionReason;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombreArchivo', 'tipoDocumento'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentDocumentMapper
   *
   * @param {StudentDocument|Object} data - Entidad StudentDocument o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return StudentDocumentMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentDocumentMapper
   *
   * @param {StudentDocument|Object} data - Entidad StudentDocument o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return StudentDocumentMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'studentDocuments';
  }
}
