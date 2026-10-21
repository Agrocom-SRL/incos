/**
 * Use Case: GetStudentScholarshipsByStudentIdUseCase
 * Módulo: Estudiantes
 * Obtiene las becas de un estudiante con datos enriquecidos
 *
 * Responsabilidades:
 * - Validar que el estudiante exista
 * - Obtener todas las becas asignadas al estudiante
 * - Enriquecer las becas con información de tipo de beca y gestión
 * - Retornar las becas enriquecidas para uso en el módulo de pagos
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la obtención de becas de un estudiante
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

import { NotFoundError } from '../../../../domain/errors/AppError.js';

export class GetStudentScholarshipsByStudentIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentScholarshipRepository - Repositorio de asignaciones de becas
   * @param {Object} params.scholarshipRepository - Repositorio de becas/descuentos
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    studentRepository,
    studentScholarshipRepository,
    scholarshipRepository,
    managementRepository,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.scholarshipRepository = scholarshipRepository;
    this.managementRepository = managementRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de obtención de becas por ID de estudiante
   *
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Object>} Becas del estudiante con datos enriquecidos
   */
  async execute(studentId) {
    this.logger.info('[Estudiantes] Iniciando obtención de becas por ID de estudiante', {
      studentId,
    });

    try {
      // 1. Validar que el estudiante exista
      const student = await this.studentRepository.findById(studentId);

      if (!student) {
        throw new NotFoundError(`No se encontró un estudiante con ID ${studentId}`);
      }

      this.logger.info('[Estudiantes] Estudiante encontrado', {
        studentId: student.id,
        studentCode: student.studentCode,
      });

      // 2. Obtener todas las becas asignadas al estudiante
      const scholarshipsResult = await this.studentScholarshipRepository.findAll(
        { studentId: student.id },
        null,
        null
      );
      const scholarships = scholarshipsResult.studentScholarships || [];

      this.logger.info('[Estudiantes] Becas encontradas', {
        studentId: student.id,
        count: scholarships.length,
      });

      // 3. Obtener IDs únicos de becas y gestiones para enriquecer
      const scholarshipIds = new Set();
      const managementIds = new Set();

      scholarships.forEach((scholarship) => {
        const scholarshipPlain = scholarship.toPlainObject ? scholarship.toPlainObject() : scholarship;
        if (scholarshipPlain.scholarshipId) scholarshipIds.add(scholarshipPlain.scholarshipId);
        if (scholarshipPlain.managementId) managementIds.add(scholarshipPlain.managementId);
      });

      // 4. Obtener tipos de beca
      const scholarshipsCatalog = {};
      for (const scholarshipId of scholarshipIds) {
        try {
          const scholarship = await this.scholarshipRepository.findById(scholarshipId);
          if (scholarship) {
            scholarshipsCatalog[scholarshipId] = scholarship.toPlainObject ? scholarship.toPlainObject() : scholarship;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener tipo de beca', {
            studentId: student.id,
            scholarshipId,
            error: err.message,
          });
        }
      }

      // 5. Obtener gestiones
      const managements = {};
      for (const managementId of managementIds) {
        try {
          const management = await this.managementRepository.findById(managementId);
          if (management) {
            managements[managementId] = management.toPlainObject ? management.toPlainObject() : management;
          }
        } catch (err) {
          this.logger.warn('[Estudiantes] Error al obtener gestión de beca', {
            studentId: student.id,
            managementId,
            error: err.message,
          });
        }
      }

      // 6. Enriquecer becas con información de catálogos
      const enrichedScholarships = scholarships.map((scholarship) => {
        const scholarshipPlain = scholarship.toPlainObject ? scholarship.toPlainObject() : scholarship;
        const scholarshipType = scholarshipPlain.scholarshipId
          ? scholarshipsCatalog[scholarshipPlain.scholarshipId]
          : null;
        const management = scholarshipPlain.managementId
          ? managements[scholarshipPlain.managementId]
          : null;

        return {
          ...scholarshipPlain,
          scholarshipName: scholarshipType?.name || null,
          scholarshipCode: scholarshipType?.code || null,
          scholarshipPercentage: scholarshipType?.percentage ?? null,
          managementCode: management?.code || null,
          managementName: management?.name || null,
          managementYear: management?.year ?? null,
        };
      });

      // 7. Retornar las becas enriquecidas
      const result = {
        scholarships: enrichedScholarships,
        catalogs: {
          scholarships: scholarshipsCatalog,
          managements,
        },
      };

      this.logger.info('[Estudiantes] Becas obtenidas exitosamente', {
        studentId: student.id,
        scholarshipsCount: enrichedScholarships.length,
      });

      return result;
    } catch (error) {
      this.logger.error('[Estudiantes] Error al obtener becas por ID de estudiante', {
        error: error.message,
        stack: error.stack,
        studentId,
      });
      throw error;
    }
  }
}
