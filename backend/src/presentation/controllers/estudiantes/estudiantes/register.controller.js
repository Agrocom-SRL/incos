/**
 * POST /api/v1/estudiantes
 * Controller para registrar un nuevo estudiante con todos sus datos relacionados
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP POST para registrar estudiantes
 * - Transformar datos del frontend usando RegisterStudentRequestDTO
 * - Delegar lógica de negocio a RegisterStudentUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * POST /api/v1/estudiantes
 *
 * Body Parameters (estructura plana del frontend):
 * - ci, expedicionId, nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento,
 *   generoId, estadoCivilId, tipoSangre, tieneDiscapacidad, emailPersonal, celular,
 *   telefonoFijo, direccion, municipioResidenciaId, zona, observaciones,
 *   contactosEmergencia: [ ... ],
 *   documentacion: { doc_1: { ... }, doc_2: { ... } }
 *
 * NOTA: Los datos académicos (careerId, managementId, etc.) se manejan en otro módulo
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para registrar estudiantes
 * - Dependency Inversion: Depende de RegisterStudentUseCase (abstracción), no de implementación concreta
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Usa DTOs de Application Layer para transformar datos
 * - Depende de Application Layer (Use Cases inyectados, DTOs importados directamente)
 *
 * NOTA sobre DTOs:
 * - Los DTOs se importan directamente (no se inyectan) porque son objetos estáticos sin dependencias
 * - Esto es válido en Clean Architecture: las capas externas pueden depender de las internas
 * - Los DTOs representan el contrato de la capa de Application
 */
import { BaseCreateController } from '../../base/BaseCreateController.js';
import { RegisterStudentRequestDTO } from '../../../../application/dtos/estudiantes/request/index.js';

export class RegisterStudentController extends BaseCreateController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {RegisterStudentUseCase} params.registerStudentUseCase - Caso de uso para registrar estudiantes
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ registerStudentUseCase, logger, responseFormatter }) {
    super({
      useCase: registerStudentUseCase,
      logger,
      responseFormatter,
      resourceName: 'estudiante',
      dataFieldName: 'student',
    });
  }

  /**
   * Prepara los datos del body antes de enviarlos al use case
   * Usa RegisterStudentRequestDTO para transformar la estructura plana del frontend
   * a la estructura anidada que espera el use case
   *
   * @param {Object} body - Body de la petición HTTP (estructura plana del frontend)
   * @returns {Object} Datos estructurados para el use case
   */
  prepareData(body) {
    return RegisterStudentRequestDTO.fromRequest(body);
  }

  /**
   * Sanitiza datos sensibles para el logging.
   * Oculta información como CI, emails, teléfonos y direcciones.
   *
   * @param {Object} body - Body de la petición
   * @returns {Object} Body sanitizado para logging
   */
  sanitizeBodyForLogging(body) {
    const sanitized = { ...body };

    // Sanitizar datos personales del estudiante
    if (sanitized.ci) sanitized.ci = '***';
    if (sanitized.emailPersonal) sanitized.emailPersonal = '***';
    if (sanitized.celular) sanitized.celular = '***';
    if (sanitized.telefonoFijo) sanitized.telefonoFijo = '***';
    if (sanitized.direccion) sanitized.direccion = '***';

    // Sanitizar contactos de emergencia
    if (sanitized.contactosEmergencia && Array.isArray(sanitized.contactosEmergencia)) {
      sanitized.contactosEmergencia = sanitized.contactosEmergencia.map((contact) => {
        const sanitizedContact = { ...contact };
        if (sanitizedContact.celular1) sanitizedContact.celular1 = '***';
        if (sanitizedContact.celular2) sanitizedContact.celular2 = '***';
        return sanitizedContact;
      });
    }

    // No es necesario sanitizar documentación ya que no contiene PII sensible
    return sanitized;
  }
}
