/**
 * POST /api/v1/inscripciones/:id/generar-boleta
 * Controller para generar la Boleta de Inscripción de una inscripción
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP POST para generar boletas de inscripción
 * - Delegar lógica común a BaseDocumentController
 * - Configurar nombre del recurso y campo de respuesta
 * 
 * Endpoint:
 * POST /api/v1/inscripciones/:id/generar-boleta
 * 
 * Path Parameters:
 * - id: ID de la inscripción (número entero mayor a 0)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     boleta: {
 *       filePath: "/uploads/documentos/estudiantes/123/BOLETA_INSCRIPCION_123_xxx.pdf",
 *       fileName: "BOLETA_INSCRIPCION_123_xxx.pdf",
 *       absolutePath: "/path/to/file.pdf"
 *     }
 *   },
 *   message: "Boleta de inscripción generada correctamente"
 * }
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la configuración específica de la boleta
 * - Dependency Inversion: Depende de GenerateBoletaInscripcionUseCase (abstracción)
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases inyectados)
 */
import { BaseDocumentController } from '../base/BaseDocumentController.js';

export class GenerateBoletaInscripcionController extends BaseDocumentController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {GenerateBoletaInscripcionUseCase} params.generateBoletaInscripcionUseCase - Caso de uso para generar boleta
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas
   */
  constructor({ generateBoletaInscripcionUseCase, logger, responseFormatter }) {
    super({
      useCase: generateBoletaInscripcionUseCase,
      logger,
      responseFormatter,
      resourceName: 'boleta de inscripción',
      dataFieldName: 'boleta',
    });
  }

  // No es necesario sobrescribir handle() ni buildOptions()
  // El base controller maneja toda la lógica común
}
