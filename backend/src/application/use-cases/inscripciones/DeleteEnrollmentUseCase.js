/**
 * Use Case: DeleteEnrollmentUseCase
 * Módulo: Inscripciones
 * Elimina una inscripción y sus boletas asociadas
 *
 * Responsabilidades:
 * - Validar que la inscripción exista
 * - Buscar y eliminar boletas de inscripción asociadas (DOCX y PDF)
 * - Eliminar archivos físicos del sistema de archivos
 * - Eliminar registros de documentos en BD (soft delete)
 * - Eliminar la inscripción (soft delete)
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo elimina inscripciones y boletas asociadas
 * - Dependency Inversion: Depende de abstracciones (repositorios inyectados)
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_REGISTRO_ESTUDIANTE } from '../../../domain/constants/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { serverConfig } from '../../../infrastructure/config/server.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DeleteEnrollmentUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} params.subjectEnrollmentRepository - Repositorio de materias inscritas
   * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos
   * @param {Object} params.studentDocumentRepository - Repositorio de documentos de estudiantes
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    enrollmentRepository,
    subjectEnrollmentRepository,
    studentAcademicDataRepository,
    studentDocumentRepository,
    logger,
  }) {
    this.enrollmentRepository = enrollmentRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {number} enrollmentId - ID de la inscripción a eliminar
   * @returns {Promise<void>}
   */
  async execute(enrollmentId) {
    this.logger.info('[Inscripciones] Iniciando eliminación de inscripción', {
      enrollmentId,
    });

    try {
      // 1. Validar y obtener inscripción
      const enrollment = await this.enrollmentRepository.findById(enrollmentId);

      if (!enrollment) {
        throw new NotFoundError(`Inscripción con ID ${enrollmentId} no encontrada`);
      }

      // 2. Obtener datos académicos del estudiante desde la inscripción
      const enrollmentPlain = enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment;
      const academicDataId = enrollmentPlain.academicDataId || enrollmentPlain.datosAcademicosId;

      if (!academicDataId) {
        throw new ValidationError('La inscripción no tiene datos académicos asociados');
      }

      // 3. Obtener el estudiante desde los datos académicos
      // Necesitamos el studentId para buscar documentos
      const studentAcademicData = await this.studentAcademicDataRepository.findById(academicDataId);
      if (!studentAcademicData) {
        // Si no podemos obtener los datos académicos, continuamos sin eliminar documentos físicos
        this.logger.warn('[Inscripciones] No se pudieron obtener datos académicos, continuando sin eliminar documentos físicos', {
          enrollmentId,
          academicDataId,
        });
      }

      const studentAcademicDataPlain = studentAcademicData?.toPlainObject ? studentAcademicData.toPlainObject()
        : studentAcademicData;
      const studentId = studentAcademicDataPlain?.studentId || studentAcademicDataPlain?.estudianteId;

      // 4. Buscar y eliminar inscripciones de materias relacionadas
      // Esto eliminará también las calificaciones relacionadas (si existen) debido a las foreign keys
      await this._deletesubjectEnrollments(enrollmentId);

      // 5. Buscar y eliminar boletas de inscripción asociadas
      if (studentId) {
        await this._deleteBoletasInscripcion(studentId);
      }

      // 6. Actualizar estado de registro de datos académicos si no hay otras inscripciones activas
      // Si se elimina la inscripción y no hay otras inscripciones activas, el estado vuelve a PENDIENTE
      await this._updateRegistrationStatusIfNeeded(academicDataId, enrollmentId, enrollmentPlain.managementId);

      // 7. Eliminar la inscripción principal (soft delete)
      const deleted = await this.enrollmentRepository.delete(enrollmentId);

      if (!deleted) {
        throw new NotFoundError(`No se pudo eliminar la inscripción con ID ${enrollmentId}`);
      }

      this.logger.info('[Inscripciones] Inscripción eliminada exitosamente', {
        enrollmentId,
        studentId,
      });
    } catch (error) {
      this.logger.error('[Inscripciones] Error al eliminar inscripción', {
        enrollmentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Elimina las inscripciones de materias relacionadas con la inscripción
   * Esto elimina los registros en inscripciones_materias
   * Las calificaciones relacionadas se eliminan automáticamente por foreign key constraints
   * @private
   * @param {number} enrollmentId - ID de la inscripción
   */
  async _deletesubjectEnrollments(enrollmentId) {
    try {
      // Buscar todas las materias inscritas de esta inscripción
      const subjectEnrollmentsResult = await this.subjectEnrollmentRepository.findAll(
        {
          enrollmentId,
          active: true,
        },
        null,
        null
      );

      const subjectEnrollments = subjectEnrollmentsResult.subjectEnrollments
        || subjectEnrollmentsResult.enrollmentMaterias || [];

      if (subjectEnrollments.length === 0) {
        this.logger.info('[Inscripciones] No se encontraron materias inscritas para eliminar', {
          enrollmentId,
        });
        return;
      }

      // Eliminar cada inscripción de materia (soft delete)
      for (const enrollmentSubject of subjectEnrollments) {
        const subjectPlain = enrollmentSubject.toPlainObject ? enrollmentSubject.toPlainObject() : enrollmentSubject;
        const subjectId = subjectPlain.id;

        if (subjectId) {
          await this.subjectEnrollmentRepository.delete(subjectId);
          this.logger.info('[Inscripciones] Materia inscrita eliminada', {
            enrollmentId,
            enrollmentSubjectId: subjectId,
          });
        }
      }

      this.logger.info('[Inscripciones] Materias inscritas eliminadas', {
        enrollmentId,
        materiasEliminadas: subjectEnrollments.length,
      });
    } catch (error) {
      this.logger.error('[Inscripciones] Error al eliminar materias inscritas', {
        enrollmentId,
        error: error.message,
        stack: error.stack,
      });
      // Se aborta: eliminar la inscripción con materias inscritas pendientes dejaría
      // registros huérfanos en matriculas_materia.
      throw error;
    }
  }

  /**
   * Elimina las boletas de inscripción asociadas al estudiante
   * @private
   * @param {number} studentId - ID del estudiante
   */
  async _deleteBoletasInscripcion(studentId) {
    try {
      // Buscar documentos de tipo INSCRIPCION del estudiante
      const documentosResult = await this.studentDocumentRepository.findAll(
        {
          studentId,
          tipoDocumento: 'INSCRIPCION',
        },
        null,
        null
      );

      const documentos = documentosResult.studentDocuments || documentosResult.documentos || [];

      if (documentos.length === 0) {
        this.logger.info('[Inscripciones] No se encontraron boletas de inscripción para eliminar', {
          studentId,
        });
        return;
      }

      // Eliminar cada documento (tanto de BD como archivo físico)
      for (const documento of documentos) {
        const docPlain = documento.toPlainObject ? documento.toPlainObject() : documento;
        const filePath = docPlain.filePath || docPlain.rutaArchivo;
        const docId = docPlain.id;

        // Eliminar archivo físico si existe
        if (filePath) {
          await this._deletePhysicalFile(filePath);
        }

        // Eliminar registro de BD (soft delete)
        if (docId) {
          await this.studentDocumentRepository.delete(docId);
          this.logger.info('[Inscripciones] Documento de boleta eliminado de BD', {
            studentId,
            documentId: docId,
            filePath,
          });
        }
      }

      this.logger.info('[Inscripciones] Boletas de inscripción eliminadas', {
        studentId,
        documentosEliminados: documentos.length,
      });
    } catch (error) {
      this.logger.error('[Inscripciones] Error al eliminar boletas de inscripción', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      // No lanzar error para no interrumpir la eliminación de la inscripción
      // Solo loguear el error
    }
  }

  /**
   * Actualiza el estado de registro de los datos académicos si no hay otras inscripciones activas
   * Si se elimina la inscripción y el estudiante no tiene otras inscripciones activas en la misma gestión,
   * el estado de registro vuelve a PENDIENTE (ya no está ADMITIDO)
   *
   * @private
   * @param {number} academicDataId - ID de los datos académicos
   * @param {number} enrollmentId - ID de la inscripción que se está eliminando
   * @param {number} managementId - ID de la gestión
   */
  async _updateRegistrationStatusIfNeeded(academicDataId, enrollmentId, managementId) {
    try {
      // Verificar si hay otras inscripciones activas para estos datos académicos en la misma gestión
      const otherEnrollmentsResult = await this.enrollmentRepository.findAll(
        {
          academicDataId,
          managementId,
          active: true,
        },
        null,
        null
      );

      const otherEnrollments = otherEnrollmentsResult.enrollments || [];

      // Filtrar la inscripción actual que se está eliminando
      const activeEnrollments = otherEnrollments.filter(
        (enrollment) => {
          const enrollmentPlain = enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment;
          return enrollmentPlain.id !== enrollmentId;
        }
      );

      // Si no hay otras inscripciones activas, actualizar el estado de registro a PENDIENTE
      if (activeEnrollments.length === 0) {
        await this.studentAcademicDataRepository.update(academicDataId, {
          registrationState: ESTADOS_REGISTRO_ESTUDIANTE.PENDIENTE,
        });

        this.logger.info('[Inscripciones] Estado de registro actualizado a PENDIENTE', {
          academicDataId,
          enrollmentId,
          managementId,
          reason: 'No hay otras inscripciones activas',
        });
      } else {
        this.logger.info('[Inscripciones] Estado de registro mantenido (hay otras inscripciones activas)', {
          academicDataId,
          enrollmentId,
          managementId,
          activeEnrollmentsCount: activeEnrollments.length,
        });
      }
    } catch (error) {
      this.logger.error('[Inscripciones] Error al actualizar estado de registro', {
        academicDataId,
        enrollmentId,
        error: error.message,
        stack: error.stack,
      });
      // No lanzar error para no interrumpir la eliminación de la inscripción
      // Solo loguear el error
    }
  }

  /**
   * Elimina un archivo físico del sistema de archivos
   * @private
   * @param {string} filePath - Ruta relativa del archivo (ej: /uploads/documentos/estudiantes/1/archivo.pdf)
   */
  async _deletePhysicalFile(filePath) {
    try {
      // Construir ruta absoluta
      const uploadDir = serverConfig.uploadsPath || 'uploads';
      let absolutePath;

      if (path.isAbsolute(uploadDir)) {
        // Si uploadDir es absoluto, usar directamente
        absolutePath = path.join(uploadDir, filePath.replace(/^\//, ''));
      } else {
        // Si es relativo, construir desde el directorio del proyecto
        absolutePath = path.resolve(__dirname, '../../../..', uploadDir, filePath.replace(/^\//, ''));
      }

      // Verificar que el archivo existe antes de intentar eliminarlo
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        this.logger.info('[Inscripciones] Archivo físico eliminado', {
          filePath,
          absolutePath,
        });
      } else {
        this.logger.warn('[Inscripciones] Archivo físico no encontrado (puede haber sido eliminado previamente)', {
          filePath,
          absolutePath,
        });
      }
    } catch (error) {
      this.logger.error('[Inscripciones] Error al eliminar archivo físico', {
        filePath,
        error: error.message,
        stack: error.stack,
      });
      // No lanzar error para no interrumpir la eliminación
      // Solo loguear el error
    }
  }
}
