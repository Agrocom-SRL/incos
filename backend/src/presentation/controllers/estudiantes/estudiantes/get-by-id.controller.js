/**
 * GET /api/v1/estudiantes/:id
 * Controller para obtener un estudiante por ID con todos sus datos relacionados
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP GET para obtener estudiantes por ID
 * - Validar el ID del estudiante
 * - Delegar lógica de negocio a GetStudentByIdUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * GET /api/v1/estudiantes/:id
 *
 * Path Parameters:
 * - id: ID del estudiante (número entero mayor a 0)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     student: { ... },
 *     guardians: [ ... ],
 *     disabilities: [ ... ],
 *     origins: [ ... ],
 *     documentDeliveries: [ ... ]
 *   },
 *   message: "Estudiante obtenido correctamente"
 * }
 *
 * NOTA: Los datos académicos se manejan en otro módulo
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para obtener estudiantes
 * - Dependency Inversion: Depende de GetStudentByIdUseCase (abstracción), no de implementación concreta
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases inyectados)
 */
import { BaseGetController } from '../../base/BaseGetController.js';

export class GetStudentByIdController extends BaseGetController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {GetStudentByIdUseCase} params.getStudentByIdUseCase - Caso de uso para obtener estudiante por ID
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ getStudentByIdUseCase, logger, responseFormatter }) {
    super({
      useCase: getStudentByIdUseCase,
      logger,
      responseFormatter,
      resourceName: 'estudiante',
      dataFieldName: 'data', // El use case retorna un objeto con student, guardians, disabilities, origins, documentDeliveries
    });
  }
}
