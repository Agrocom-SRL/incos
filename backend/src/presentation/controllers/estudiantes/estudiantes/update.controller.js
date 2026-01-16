/**
 * PUT /api/v1/estudiantes/:id
 * Controller para actualizar los datos básicos de un estudiante existente
 * 
 * Responsabilidades:
 * - Recibir peticiones HTTP PUT para actualizar estudiantes
 * - Validar el ID del estudiante
 * - Preparar datos del body para el use case
 * - Delegar lógica de negocio a UpdateStudentUseCase
 * - Formatear respuesta JSON estandarizada
 * 
 * Endpoint:
 * PUT /api/v1/estudiantes/:id
 * 
 * Path Parameters:
 * - id: ID del estudiante (número entero mayor a 0)
 * 
 * Body Parameters (todos opcionales - actualización parcial):
 * - Campos básicos del estudiante: ci, expedicionId, nombres, apellidoPaterno, apellidoMaterno,
 *   fechaNacimiento, generoId, estadoCivilId, tipoSangre, tieneDiscapacidad, emailPersonal,
 *   celular, telefonoFijo, direccion, municipioResidenciaId, zona, observaciones
 * - guardians: Array de apoderados (reemplazo completo)
 * - disabilities: Array de discapacidades (reemplazo completo)
 * - origins: Array de orígenes (reemplazo completo)
 * - documentation: Objeto con entregas de documentos (reemplazo completo)
 * 
 * NOTA: Similar a RegisterStudentUseCase, actualiza estudiante y todas sus relaciones.
 * - Datos básicos: actualización parcial (solo campos proporcionados)
 * - Relaciones: reemplazo completo (si se proporcionan, elimina todas las existentes y crea las nuevas)
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
 *   message: "Estudiante (ID: 123) actualizado correctamente"
 * }
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la comunicación HTTP para actualizar estudiantes
 * - Dependency Inversion: Depende de UpdateStudentUseCase (abstracción), no de implementación concreta
 * 
 * Clean Architecture:
 * - Presentation Layer: Maneja HTTP request/response
 * - Depende de Application Layer (Use Cases inyectados)
 */
export class UpdateStudentController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {UpdateStudentUseCase} params.updateStudentUseCase - Caso de uso para actualizar estudiantes
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ updateStudentUseCase, logger, responseFormatter }) {
    if (!updateStudentUseCase) {
      throw new Error('updateStudentUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    if (!responseFormatter) {
      throw new Error('responseFormatter es requerido');
    }

    this.updateStudentUseCase = updateStudentUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  /**
   * Prepara los datos del body antes de enviarlos al use case
   * Transforma campos del frontend al dominio y estructura los datos
   * similar a RegisterStudentController (con separación de student y relaciones)
   * 
   * @param {Object} body - Body de la petición HTTP
   * @returns {Object} Datos preparados para el use case
   *   - student: Datos básicos del estudiante (formato dominio)
   *   - guardians: Array de apoderados (opcional)
   *   - disabilities: Array de discapacidades (opcional)
   *   - origins: Array de orígenes (opcional)
   *   - documentation: Objeto con entregas de documentos (opcional)
   */
  prepareData(body) {
    const result = {};

    // Extraer datos básicos del estudiante (campos de la tabla estudiantes)
    const studentFields = [
      'ci', 'expedicionId', 'expedicion', 'nombres', 'apellidoPaterno', 'apellidoMaterno',
      'fechaNacimiento', 'generoId', 'estadoCivilId', 'tipoSangre', 'tieneDiscapacidad',
      'emailPersonal', 'celular', 'telefonoFijo', 'direccion', 'municipioResidenciaId',
      'zona', 'observaciones'
    ];

    const studentData = {};
    for (const field of studentFields) {
      if (body[field] !== undefined) {
        studentData[field] = body[field];
      }
    }

    // Transformar campos del estudiante al formato dominio (solo si hay datos)
    if (Object.keys(studentData).length > 0) {
      const preparedStudent = { ...studentData };
      
      // Transformar expedicionId a expedition
      if (preparedStudent.expedicionId !== undefined) {
        preparedStudent.expedition = preparedStudent.expedicionId;
        delete preparedStudent.expedicionId;
      }
      
      // Transformar generoId a gender
      if (preparedStudent.generoId !== undefined) {
        preparedStudent.gender = preparedStudent.generoId;
        delete preparedStudent.generoId;
      }
      
      // Transformar nombres a firstName
      if (preparedStudent.nombres !== undefined) {
        preparedStudent.firstName = preparedStudent.nombres;
        delete preparedStudent.nombres;
      }
      
      // Transformar apellidoPaterno a lastName
      if (preparedStudent.apellidoPaterno !== undefined) {
        preparedStudent.lastName = preparedStudent.apellidoPaterno;
        delete preparedStudent.apellidoPaterno;
      }
      
      // Transformar apellidoMaterno a motherLastName
      if (preparedStudent.apellidoMaterno !== undefined) {
        preparedStudent.motherLastName = preparedStudent.apellidoMaterno;
        delete preparedStudent.apellidoMaterno;
      }
      
      // Transformar fechaNacimiento a birthDate
      if (preparedStudent.fechaNacimiento !== undefined) {
        preparedStudent.birthDate = preparedStudent.fechaNacimiento;
        delete preparedStudent.fechaNacimiento;
      }
      
      // Transformar estadoCivilId a civilStatusId
      if (preparedStudent.estadoCivilId !== undefined) {
        preparedStudent.civilStatusId = preparedStudent.estadoCivilId;
        delete preparedStudent.estadoCivilId;
      }
      
      // Transformar tipoSangre a bloodType
      if (preparedStudent.tipoSangre !== undefined) {
        preparedStudent.bloodType = preparedStudent.tipoSangre;
        delete preparedStudent.tipoSangre;
      }
      
      // Transformar tieneDiscapacidad a hasDisability
      if (preparedStudent.tieneDiscapacidad !== undefined) {
        preparedStudent.hasDisability = preparedStudent.tieneDiscapacidad;
        delete preparedStudent.tieneDiscapacidad;
      }
      
      // Transformar emailPersonal a personalEmail
      if (preparedStudent.emailPersonal !== undefined) {
        preparedStudent.personalEmail = preparedStudent.emailPersonal;
        delete preparedStudent.emailPersonal;
      }
      
      // Transformar celular a mobilePhone
      if (preparedStudent.celular !== undefined) {
        preparedStudent.mobilePhone = preparedStudent.celular;
        delete preparedStudent.celular;
      }
      
      // Transformar telefonoFijo a landlinePhone
      if (preparedStudent.telefonoFijo !== undefined) {
        preparedStudent.landlinePhone = preparedStudent.telefonoFijo;
        delete preparedStudent.telefonoFijo;
      }
      
      // Transformar direccion a address
      if (preparedStudent.direccion !== undefined) {
        preparedStudent.address = preparedStudent.direccion;
        delete preparedStudent.direccion;
      }
      
      // Transformar municipioResidenciaId a residenceMunicipalityId
      if (preparedStudent.municipioResidenciaId !== undefined) {
        preparedStudent.residenceMunicipalityId = preparedStudent.municipioResidenciaId;
        delete preparedStudent.municipioResidenciaId;
      }
      
      // Transformar zona a zone
      if (preparedStudent.zona !== undefined) {
        preparedStudent.zone = preparedStudent.zona;
        delete preparedStudent.zona;
      }
      
      // Observaciones ya está en el formato correcto (observations)

      result.student = preparedStudent;
    }

    // Extraer relaciones (si se proporcionan)
    if (body.guardians !== undefined) {
      result.guardians = body.guardians;
    }
    if (body.disabilities !== undefined) {
      result.disabilities = body.disabilities;
    }
    if (body.origins !== undefined) {
      result.origins = body.origins;
    }
    if (body.documentation !== undefined) {
      result.documentation = body.documentation;
    }

    return result;
  }

  /**
   * Maneja la petición HTTP PUT para actualizar un estudiante
   * 
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware de Express
   */
  async handle(req, res, next) {
    try {
      // 1. Extraer ID del path (ya validado por idValidator en la ruta)
      const studentId = parseInt(req.params.id, 10);

      // 2. Extraer datos del body
      const body = req.body || {};

      // 3. Logging de la petición
      this.logger.info('[Estudiantes] Request de actualización de estudiante', {
        studentId,
        body: this.sanitizeBodyForLogging(body),
      });

      // 4. Preparar datos (transformar campos y estructurar como RegisterStudentController)
      const preparedData = this.prepareData(body);

      // 5. Validar que se haya proporcionado al menos un campo para actualizar
      const hasStudentData = preparedData.student && Object.keys(preparedData.student).length > 0;
      const hasRelations = preparedData.guardians !== undefined ||
                          preparedData.disabilities !== undefined ||
                          preparedData.origins !== undefined ||
                          preparedData.documentation !== undefined;

      if (!hasStudentData && !hasRelations) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Debe proporcionar al menos un campo para actualizar (student, guardians, disabilities, origins, o documentation)',
          },
        });
      }

      // 6. Ejecutar el caso de uso
      const result = await this.updateStudentUseCase.execute(studentId, preparedData);

      // 7. Extraer datos y ID para la respuesta
      const resourceId = result.student?.id || studentId;

      // 8. Formatear y enviar respuesta JSON estandarizada (similar a RegisterStudentController)
      return this.responseFormatter.updated(
        res,
        result, // Retornar el objeto completo con student, guardians, disabilities, origins, documentDeliveries
        'estudiante',
        resourceId,
        req
      );
    } catch (error) {
      // 9. Manejo de errores consistente
      this.logger.error('[Estudiantes] Error al actualizar estudiante', {
        error: error.message,
        stack: error.stack,
        studentId: req.params?.id,
      });

      // Los errores se manejan en el middleware de errores
      // NotFoundError, ValidationError, etc. serán formateados correctamente
      return next(error);
    }
  }

  /**
   * Sanitiza el body para logging (elimina datos sensibles)
   * Oculta información como CI, emails, teléfonos y direcciones.
   * 
   * @param {Object} body - Body de la petición
   * @returns {Object} Body sanitizado para logging
   */
  sanitizeBodyForLogging(body) {
    const sanitized = { ...body };
    
    // Sanitizar datos personales sensibles
    if (sanitized.ci) sanitized.ci = '***';
    if (sanitized.emailPersonal) sanitized.emailPersonal = '***';
    if (sanitized.celular) sanitized.celular = '***';
    if (sanitized.telefonoFijo) sanitized.telefonoFijo = '***';
    if (sanitized.direccion) sanitized.direccion = '***';

    return sanitized;
  }
}
