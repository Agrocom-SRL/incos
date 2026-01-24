/**
 * POST /api/v1/estudiantes/:id/documentos/acta-compromiso
 * Controller para generar el Acta de Compromiso de un estudiante
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP POST para generar actas de compromiso
 * - Delegar lógica común a BaseGenerateDocumentController
 * - Configurar nombre del recurso y campo de respuesta
 * 
 * Endpoint:
 * POST /api/v1/estudiantes/:id/documentos/acta-compromiso
 * 
 * Path Parameters:
 * - id: ID del estudiante (número entero mayor a 0)
 * 
 * NOTA: Opciones como plazoMaximo vienen de configuración del sistema,
 * no del body de la petición. El administrador configura estos valores.
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     filePath: "/uploads/documentos/estudiantes/123/ACTA_COMPROMISO_xxx.pdf",
 *     fileName: "ACTA_COMPROMISO_xxx.pdf",
 *     absolutePath: "/path/to/file.pdf"
 *   },
 *   message: "Acta de compromiso generada correctamente"
 * }
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la configuración específica del acta
 * - Dependency Inversion: Depende de GenerateActaCompromisoUseCase (abstracción)
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases inyectados)
 */
import { BaseDocumentController } from '../../base/BaseDocumentController.js';

export class ActaCompromisoController extends BaseDocumentController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {GenerateActaCompromisoUseCase} params.generateActaCompromisoUseCase - Caso de uso para generar acta
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas
   */
  constructor({ generateActaCompromisoUseCase, logger, responseFormatter }) {
    super({
      useCase: generateActaCompromisoUseCase,
      logger,
      responseFormatter,
      resourceName: 'acta de compromiso',
    });
  }

  // No es necesario sobrescribir handle()
  // El base controller maneja toda la lógica común
}

