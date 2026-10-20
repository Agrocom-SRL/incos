/**
 * POST /api/v1/estudiantes/:id/becas
 * Controller para asignar una beca a un estudiante
 *
 * Responsabilidades:
 * - Recibir peticiones HTTP POST para asignar becas
 * - Transformar datos del frontend al formato que espera el use case
 * - Delegar lógica de negocio a CreateStudentScholarshipUseCase
 * - Formatear respuesta JSON estandarizada
 *
 * Endpoint:
 * POST /api/v1/estudiantes/:id/becas
 *
 * Path Parameters:
 * - id: ID del estudiante
 *
 * Body Parameters:
 * - student_id: ID del estudiante (debe coincidir con :id)
 * - scholarship_id: ID de la beca/descuento (requerido)
 * - management_id: ID de la gestión (opcional)
 * - observations: Observaciones (opcional)
 * - fecha_solicitud: Fecha de solicitud (opcional, formato YYYY-MM-DD)
 * - estado: Estado de la beca (opcional, PENDIENTE, ACTIVA, FINALIZADA, RECHAZADA)
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para asignar becas
 * - Dependency Inversion: Depende de CreateStudentScholarshipUseCase (abstracción), no de implementación concreta
 *
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases inyectados)
 */
import { BaseCreateController } from '../../base/BaseCreateController.js';

export class AsignarBecaController extends BaseCreateController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {CreateStudentScholarshipUseCase} params.createStudentScholarshipUseCase - Caso de uso para crear asignación de beca
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ createStudentScholarshipUseCase, logger, responseFormatter }) {
    super({
      useCase: createStudentScholarshipUseCase,
      logger,
      responseFormatter,
      resourceName: 'asignación de beca',
      dataFieldName: 'studentScholarship',
    });
  }

  /**
   * Prepara los datos del body y path params antes de enviarlos al use case
   * Transforma los nombres de campos del frontend a los que espera el use case
   *
   * @param {Object} body - Body de la petición HTTP
   * @param {Object} params - Parámetros de la ruta (req.params)
   * @returns {Object} Datos estructurados para el use case
   */
  prepareData(body, params = {}) {
    // El validador ya valida el :id del path
    // Usamos el :id del path como fuente de verdad
    // Solo pasamos los datos que el use case necesita: studentId, scholarshipId, observations (opcional)
    return {
      studentId: parseInt(params.id, 10),
      scholarshipId: body.beca_descuento_id,
      observations: body.observaciones || null,
    };
  }

  /**
   * Maneja la petición HTTP POST para asignar una beca
   * Sobrescribe el método handle de BaseCreateController para pasar params
   *
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware de Express
   */
  async handle(req, res, next) {
    try {
      // 1. Extraer datos del body y params
      const body = req.body || {};
      const params = req.params || {};

      // 2. Logging de la petición
      this.logger.info(`Request de creación de ${this.resourceName}`, {
        body: this.sanitizeBodyForLogging(body),
        params,
      });

      // 3. Preparar datos (transforma formato frontend → formato use case)
      const preparedData = this.prepareData(body, params);

      // 4. Ejecutar el caso de uso
      const result = await this.useCase.execute(preparedData);

      // 5. Extraer datos para la respuesta (incluye pagoAporteId y esBeca100 para redirección en frontend)
      const studentScholarship = result[this.dataFieldName] || result.studentScholarship;
      const responseData = {
        studentScholarship,
        pagoAporteId: result.pagoAporteId ?? null,
        esBeca100: result.esBeca100 === true,
      };
      const resourceId = studentScholarship?.id || studentScholarship?.resourceId || 'nuevo';

      // 6. Formatear y enviar respuesta JSON estandarizada usando el servicio inyectado
      return this.responseFormatter.created(
        res,
        responseData,
        this.resourceName,
        resourceId,
        req
      );
    } catch (error) {
      // 7. Manejo de errores consistente
      this.logger.error(`Error al crear ${this.resourceName}`, {
        error: error.message,
        stack: error.stack,
      });

      // Los errores se manejan en el middleware de errores
      // NotFoundError, ValidationError, etc. serán formateados correctamente
      return next(error);
    }
  }

  /**
   * Sanitiza datos sensibles para el logging.
   *
   * @param {Object} body - Body de la petición
   * @returns {Object} Body sanitizado para logging
   */
  sanitizeBodyForLogging(body) {
    const sanitized = { ...body };

    // No hay datos particularmente sensibles en asignaciones de becas
    // pero podemos sanitizar observaciones si son muy largas
    if (sanitized.observations && sanitized.observations.length > 100) {
      sanitized.observations = sanitized.observations.substring(0, 100) + '...';
    }

    return sanitized;
  }
}
