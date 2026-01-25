/**
 * POST /api/v1/inscripciones/:id/generar-formulario
 * Controller para generar el Formulario de Inscripción (PDF) de un estudiante
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP POST para generar formularios de inscripción
 * - Delegar lógica común a BaseDocumentController
 * - Configurar nombre del recurso y campo de respuesta
 *
 * Endpoint:
 * POST /api/v1/inscripciones/:id/generar-formulario
 *
 * Path Parameters:
 * - id: ID del estudiante (número entero mayor a 0)
 *
 * Response:
 * {
 *   success: true,
 *   data: { filePath, fileName, absolutePath },
 *   message: "Formulario de inscripción generado correctamente"
 * }
 *
 * @module GenerateFormularioInscripcionController
 */

import { BaseDocumentController } from '../base/BaseDocumentController.js';

export class GenerateFormularioInscripcionController extends BaseDocumentController {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {GenerateFormularioInscripcionUseCase} params.generateFormularioInscripcionUseCase - Caso de uso
     * @param {ILogger} params.logger - Logger
     * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas
     */
    constructor({ generateFormularioInscripcionUseCase, logger, responseFormatter }) {
        super({
            useCase: generateFormularioInscripcionUseCase,
            logger,
            responseFormatter,
            resourceName: 'formulario de inscripción',
        });
    }
}
