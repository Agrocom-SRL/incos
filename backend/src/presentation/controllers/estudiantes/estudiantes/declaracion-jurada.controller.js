/**
 * POST /api/v1/estudiantes/:id/documentos/declaracion-jurada
 * Controller para generar la Declaración Jurada del formulario de inscripción.
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP POST para generar declaraciones juradas
 * - Delegar lógica común a BaseDocumentController
 * - Configurar nombre del recurso y campo de respuesta
 *
 * Endpoint:
 * POST /api/v1/estudiantes/:id/documentos/declaracion-jurada
 *
 * Path Parameters:
 * - id: ID del estudiante (número entero mayor a 0)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     filePath,
 *     fileName,
 *     absolutePath
 *   },
 *   message: "Declaración jurada generada correctamente"
 * }
 */

import { BaseDocumentController } from '../../base/BaseDocumentController.js';

export class DeclaracionJuradaController extends BaseDocumentController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {GenerateDeclaracionJuradaUseCase} params.generateDeclaracionJuradaUseCase - Caso de uso
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas
   */
  constructor({ generateDeclaracionJuradaUseCase, logger, responseFormatter }) {
    super({
      useCase: generateDeclaracionJuradaUseCase,
      logger,
      responseFormatter,
      resourceName: 'declaración jurada',
    });
  }

  /**
   * Maneja la petición HTTP POST para generar la Declaración Jurada.
   *
   * A diferencia del controlador base, aquí sí se aprovecha el body para
   * recibir opciones adicionales (ej: tipoAdmision) y pasarlas al caso de uso.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { tipoAdmision } = req.body || {};

      this.logger.info('Request de generación de declaración jurada', {
        id,
        tipoAdmision: tipoAdmision ?? null,
        method: req.method,
        path: req.path,
      });

      const result = await this.useCase.execute(id, { tipoAdmision });

      return this.responseFormatter.generated(res, result, this.resourceName, id, req);
    } catch (error) {
      this.logger.error('Error al generar declaración jurada', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}

