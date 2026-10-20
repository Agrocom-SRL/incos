/**
 * GET /api/v1/estudiantes/:id/scholarships
 * Controller para obtener las becas de un estudiante
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para obtener becas de un estudiante
 * - Extraer el ID del estudiante de los parámetros de ruta
 * - Delegar lógica de negocio a GetStudentScholarshipsByStudentIdUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * GET /api/v1/estudiantes/:id/scholarships
 *
 * Path Parameters:
 * - id: ID del estudiante
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para obtener becas
 * - Dependency Inversion: Depende de GetStudentScholarshipsByStudentIdUseCase (abstracción)
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases inyectados)
 */

import { BaseGetController } from '../../base/BaseGetController.js';
import { NotFoundError } from '../../../../domain/errors/AppError.js';

export class GetStudentScholarshipsController extends BaseGetController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {GetStudentScholarshipsByStudentIdUseCase} params.getStudentScholarshipsByStudentIdUseCase - Caso de uso para obtener becas
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ getStudentScholarshipsByStudentIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getStudentScholarshipsByStudentIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'becas del estudiante',
      dataFieldName: 'scholarships',
    });
  }

  /**
   * Maneja la petición HTTP GET para obtener las becas de un estudiante
   * Sobrescribe el método handle de BaseGetController para pasar el ID del path
   *
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware de Express
   */
  async handle(req, res, next) {
    try {
      // 1. Extraer ID del estudiante de los parámetros de ruta
      const studentId = parseInt(req.params.id, 10);

      // 2. Validar que el ID sea válido
      if (!studentId || Number.isNaN(Number(studentId))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID de estudiante inválido',
          },
        });
      }

      // 3. Logging de la petición
      this.logger.info(`Request de obtención de ${this.resourceName}`, {
        studentId,
        params: req.params,
      });

      // 4. Ejecutar el caso de uso
      const result = await this.useCase.execute(studentId);

      // 5. Si no se encontró el recurso, lanzar NotFoundError
      if (!result) {
        throw new NotFoundError(this.resourceName);
      }

      // 6. Extraer datos para la respuesta
      // El resultado ya tiene la estructura: { scholarships: [...], catalogs: {...} }
      // No necesitamos envolverlo porque ya es un objeto complejo
      const responseData = {
        scholarships: result[this.dataFieldName] || [],
        catalogs: result.catalogs || {},
      };

      // 7. Formatear y enviar respuesta JSON estandarizada usando retrieved
      return this.responseFormatter.retrieved(
        res,
        responseData,
        this.resourceName,
        studentId,
        req
      );
    } catch (error) {
      // 7. Manejo de errores consistente
      this.logger.error(`Error al obtener ${this.resourceName}`, {
        error: error.message,
        stack: error.stack,
      });

      // Los errores se manejan en el middleware de errores
      return next(error);
    }
  }
}
