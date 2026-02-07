import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: CreateEnrollmentUseCase
 * Módulo: Inscripciones
 * Crea una nueva inscripción con materias asociadas (capa INSCRIPCIÓN únicamente).
 *
 * Separación conceptual Inscripción vs Matriculación:
 * - INSCRIPCIÓN (este use case): El estudiante elige turno y materias. Se crean
 *   inscripciones e inscripciones_materias (asignacion_docente_id). No se asignan
 *   horarios ni aulas; el horario viene definido en cursos_horarios del curso.
 * - MATRICULACIÓN (concepto separado): Proceso que trabaja con horarios concretos
 *   (cursos_horarios, horarios, aulas), cupos y habilitación de aulas. No forma
 *   parte de este caso de uso. Ver docs/inscripcion-vs-matriculacion.md.
 *
 * Responsabilidades (solo inscripción):
 * - Validar estudiante y paralelo o asignaciones docentes
 * - Obtener gestión actual desde configuración
 * - Crear datos académicos del estudiante si no existen
 * - Crear la inscripción principal (inscripciones)
 * - Insertar materias inscritas (inscripciones_materias) por paralelo o por teacherAssignmentIds
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Cada método privado tiene una sola responsabilidad
 * - Open/Closed: Abierto para extensión (métodos privados), cerrado para modificación
 * - Dependency Inversion: Depende de abstracciones (repositorios inyectados)
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

export class CreateEnrollmentUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} params.enrollmentSubjectRepository - Repositorio de materias inscritas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos
   * @param {Object} params.parallelRepository - Repositorio de paralelos
   * @param {Object} params.courseRepository - Repositorio de cursos
   * @param {Object} params.teacherAssignmentRepository - Repositorio de asignaciones docentes
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {Object} params.managementPlanRepository - Repositorio de planes habilitados
   * @param {Object} params.studyPlanRepository - Repositorio de planes de estudios
   * @param {Object} params.configuracionSistemaRepository - Repositorio de configuración del sistema
   * @param {Object} params.careerRepository - Repositorio de carreras
   * @param {Object} params.studentDocumentRepository - Repositorio de documentos de estudiantes
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {Object} params.civilStatusRepository - Repositorio de estados civiles
   * @param {Object} params.municipalityRepository - Repositorio de municipios
   * @param {Object} params.provinceRepository - Repositorio de provincias
   * @param {Object} params.departmentRepository - Repositorio de departamentos
   * @param {Object} params.languageRepository - Repositorio de idiomas
   * @param {Object} params.contributionPaymentRepository - Repositorio de pagos de aporte
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    enrollmentRepository,
    enrollmentSubjectRepository,
    studentRepository,
    studentAcademicDataRepository,
    parallelRepository,
    courseRepository,
    teacherAssignmentRepository,
    managementRepository,
    managementPlanRepository,
    studyPlanRepository,
    configuracionSistemaRepository,
    careerRepository,
    studentDocumentRepository,
    studentDocumentDeliveryRepository,
    civilStatusRepository,
    municipalityRepository,
    provinceRepository,
    departmentRepository,
    languageRepository,
    contributionPaymentRepository,
    logger,
  }) {
    this.enrollmentRepository = enrollmentRepository;
    this.enrollmentSubjectRepository = enrollmentSubjectRepository;
    this.studentRepository = studentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.parallelRepository = parallelRepository;
    this.courseRepository = courseRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.managementRepository = managementRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.configuracionSistemaRepository = configuracionSistemaRepository;
    this.careerRepository = careerRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.civilStatusRepository = civilStatusRepository;
    this.municipalityRepository = municipalityRepository;
    this.provinceRepository = provinceRepository;
    this.departmentRepository = departmentRepository;
    this.languageRepository = languageRepository;
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de creación de inscripción.
   * Dos modos: con parallelId (todas las materias del paralelo) o con teacherAssignmentIds (solo materias elegidas).
   *
   * @param {Object} data - Datos de la inscripción
   * @param {number} data.studentId - ID del estudiante
   * @param {number} [data.parallelId] - ID del paralelo (requerido si no se envía teacherAssignmentIds)
   * @param {number[]} [data.teacherAssignmentIds] - IDs de asignaciones docentes (opcional; inscribir solo esas materias)
   * @param {string} [data.enrollmentType] - Tipo de inscripción (opcional)
   * @param {string} [data.enrollmentDate] - Fecha de inscripción (opcional)
   * @param {string} [data.observations] - Observaciones (opcional)
   * @returns {Promise<Object>} Inscripción creada con materias asociadas
   */
  async execute(data) {
    const {
      studentId,
      parallelId,
      teacherAssignmentIds,
      enrollmentType = 'NUEVO',
      enrollmentDate,
      observations,
    } = data;

    const useMateriasMode = Array.isArray(teacherAssignmentIds) && teacherAssignmentIds.length > 0;

    this.logger.info('[Inscripciones] Iniciando creación de inscripción', {
      studentId,
      parallelId,
      teacherAssignmentIds: useMateriasMode ? teacherAssignmentIds : undefined,
      mode: useMateriasMode ? 'materias' : 'paralelo',
      enrollmentType,
    });

    try {
      const student = await this._validateStudent(studentId);
      const management = await this._getCurrentManagement();

      let parallel;
      let teacherAssignments;

      if (useMateriasMode) {
        const { parallel: firstParallel } = await this._getParallelFromFirstTeacherAssignment(
          teacherAssignmentIds[0]
        );
        if (!firstParallel) {
          throw new ValidationError(
            'No se pudo determinar la carrera desde las asignaciones docentes seleccionadas'
          );
        }
        parallel = firstParallel;
        const studentAcademicData = await this._getOrCreateStudentAcademicData(
          student,
          parallel,
          management
        );
        const { managementPlan } = await this._getStudyPlanAndManagementPlan(
          studentAcademicData,
          management
        );
        teacherAssignments = await this._validateAndResolveTeacherAssignments(
          teacherAssignmentIds,
          managementPlan.id
        );
        await this._validateNoExistingEnrollment(studentAcademicData, management);
        await this._validatePaymentExists(student, management);
        const enrollment = await this._createEnrollment(
          studentAcademicData,
          management,
          enrollmentType,
          observations
        );
        const enrollmentSubjects = await this._createEnrollmentSubjects(
          enrollment,
          teacherAssignments
        );
        return this._buildResponse(
          enrollment,
          enrollmentSubjects,
          studentId,
          parallel.id,
          management
        );
      }

      if (!parallelId) {
        throw new ValidationError(
          'El ID del paralelo es requerido cuando no se envían materias específicas (teacherAssignmentIds)'
        );
      }
      parallel = await this._validateParallel(parallelId);
      const studentAcademicData = await this._getOrCreateStudentAcademicData(
        student,
        parallel,
        management
      );
      const { managementPlan } = await this._getStudyPlanAndManagementPlan(
        studentAcademicData,
        management
      );
      await this._validateNoExistingEnrollment(studentAcademicData, management);
      await this._validatePaymentExists(student, management);
      teacherAssignments = await this._getTeacherAssignmentsFromParallel(
        parallel,
        managementPlan
      );
      const enrollment = await this._createEnrollment(
        studentAcademicData,
        management,
        enrollmentType,
        observations
      );
      const enrollmentSubjects = await this._createEnrollmentSubjects(
        enrollment,
        teacherAssignments
      );
      return this._buildResponse(
        enrollment,
        enrollmentSubjects,
        studentId,
        parallelId,
        management
      );
    } catch (error) {
      this.logger.error('[Inscripciones] Error al crear inscripción', {
        error: error.message,
        stack: error.stack,
        data,
      });
      throw error;
    }
  }

  /**
   * Valida que el estudiante exista
   * @private
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Object>} Entidad Student
   * @throws {ValidationError} Si el ID no es válido
   * @throws {NotFoundError} Si el estudiante no existe
   */
  async _validateStudent(studentId) {
    if (!studentId) {
      throw new ValidationError('El ID del estudiante es requerido');
    }

    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundError(`Estudiante con ID ${studentId}`);
    }

    this.logger.info('[Inscripciones] Estudiante validado', {
      studentId,
      studentCode: student.studentCode,
    });

    return student;
  }

  /**
   * Valida que el paralelo exista
   * @private
   * @param {number} parallelId - ID del paralelo
   * @returns {Promise<Object>} Entidad Parallel
   * @throws {ValidationError} Si el ID no es válido
   * @throws {NotFoundError} Si el paralelo no existe
   */
  async _validateParallel(parallelId) {
    if (!parallelId) {
      throw new ValidationError('El ID del paralelo es requerido');
    }

    const parallel = await this.parallelRepository.findById(parallelId);
    if (!parallel) {
      throw new NotFoundError(`Paralelo con ID ${parallelId}`);
    }

    this.logger.info('[Inscripciones] Paralelo validado', {
      parallelId,
      parallelName: parallel.name,
    });

    return parallel;
  }

  /**
   * Obtiene el paralelo (y carrera) a partir de la primera asignación docente.
   * Usado en modo materias para determinar carrera y datos académicos sin enviar parallelId.
   * @private
   * @param {number} teacherAssignmentId - ID de la asignación docente
   * @returns {Promise<{parallel: Object|null}>}
   */
  async _getParallelFromFirstTeacherAssignment(teacherAssignmentId) {
    const assignment = await this.teacherAssignmentRepository.findById(teacherAssignmentId);
    if (!assignment) {
      throw new NotFoundError(`Asignación docente con ID ${teacherAssignmentId}`);
    }
    const assignmentPlain = assignment.toPlainObject ? assignment.toPlainObject() : assignment;
    const courseId = assignmentPlain.courseId ?? assignmentPlain.cursoId;
    if (!courseId) {
      this.logger.warn('[Inscripciones] Asignación docente sin curso', { teacherAssignmentId });
      return { parallel: null };
    }
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError(`Curso con ID ${courseId}`);
    }
    const coursePlain = course.toPlainObject ? course.toPlainObject() : course;
    const parallelId = coursePlain.paraleloId ?? coursePlain.parallelId;
    if (!parallelId) {
      this.logger.warn('[Inscripciones] Curso sin paralelo', { courseId });
      return { parallel: null };
    }
    const parallel = await this.parallelRepository.findById(parallelId);
    return { parallel: parallel || null };
  }

  /**
   * Valida y resuelve las asignaciones docentes por ID; todas deben pertenecer al mismo plan habilitado.
   * @private
   * @param {number[]} teacherAssignmentIds - IDs de asignaciones docentes
   * @param {number} managementPlanId - ID del plan habilitado
   * @returns {Promise<Array>} Array de entidades TeacherAssignment
   */
  async _validateAndResolveTeacherAssignments(teacherAssignmentIds, managementPlanId) {
    const assignments = [];
    for (const id of teacherAssignmentIds) {
      const assignment = await this.teacherAssignmentRepository.findById(id);
      if (!assignment) {
        throw new NotFoundError(`Asignación docente con ID ${id}`);
      }
      const plain = assignment.toPlainObject ? assignment.toPlainObject() : assignment;
      const planId = plain.managementPlanId ?? plain.gestionPlanId;
      if (planId !== managementPlanId) {
        throw new ValidationError(
          `La asignación docente ${id} no pertenece al plan habilitado de la gestión actual`
        );
      }
      assignments.push(assignment);
    }
    this.logger.info('[Inscripciones] Asignaciones docentes validadas (modo materias)', {
      count: assignments.length,
      managementPlanId,
    });
    return assignments;
  }

  /**
   * Obtiene la gestión actual desde la configuración del sistema
   * @private
   * @returns {Promise<Object>} Entidad Management
   * @throws {ValidationError} Si no se encuentra la gestión actual
   */
  async _getCurrentManagement() {
    // Obtener año de la gestión actual desde configuración
    const config = await this.configuracionSistemaRepository.findBy(
      { key: 'gestion_actual' }
    );
    
    if (!config || !config.value) {
      throw new ValidationError(
        'No se encontró la configuración de gestión actual. Por favor, configure el sistema.'
      );
    }

    const gestionYear = parseInt(config.value, 10);
    if (isNaN(gestionYear)) {
      throw new ValidationError(
        `El valor de gestión actual (${config.value}) no es un año válido`
      );
    }

    // Buscar la gestión por año y vigente usando findBy con filtros
    const management = await this.managementRepository.findBy({
      year: gestionYear,
      vigente: true,
    });
    
    if (!management) {
      throw new ValidationError(
        `No se encontró una gestión vigente para el año ${gestionYear}. Por favor, configure el sistema.`
      );
    }

    this.logger.info('[Inscripciones] Gestión actual obtenida', {
      managementId: management.id,
      year: management.year,
    });

    return management;
  }

  /**
   * Obtiene o crea los datos académicos del estudiante
   * @private
   * @param {Object} student - Entidad Student
   * @param {Object} parallel - Entidad Parallel
   * @param {Object} management - Entidad Management
   * @returns {Promise<Object>} Entidad StudentAcademicData
   */
  async _getOrCreateStudentAcademicData(student, parallel, management) {
    // Buscar datos académicos existentes del estudiante
    const result = await this.studentAcademicDataRepository.findAll(
      { studentId: student.id },
      null,
      null
    );
    const existingAcademicData = result.studentAcademicData?.find((data) => data.active);

    if (existingAcademicData) {
      // Si existe, actualizar la carrera si es necesario
      const parallelPlain = parallel.toPlainObject ? parallel.toPlainObject() : parallel;
      const careerId = parallelPlain.careerId || parallel.careerId;

      if (existingAcademicData.careerId !== careerId) {
        this.logger.info('[Inscripciones] Actualizando carrera del estudiante', {
          studentId: student.id,
          oldCareerId: existingAcademicData.careerId,
          newCareerId: careerId,
        });

        await this.studentAcademicDataRepository.update(existingAcademicData.id, {
          careerId,
          managementIngressId: management.id,
        });

        // Obtener los datos actualizados
        const updated = await this.studentAcademicDataRepository.findById(existingAcademicData.id);
        this.logger.info('[Inscripciones] Carrera del estudiante actualizada', {
          studentId: student.id,
          academicDataId: updated.id,
        });

        return updated;
      }

      return existingAcademicData;
    }

    // Si no existe, crear nuevos datos académicos
    const parallelPlain = parallel.toPlainObject ? parallel.toPlainObject() : parallel;
    const careerId = parallelPlain.careerId || parallel.careerId;

    const academicData = {
      studentId: student.id,
      careerId,
      managementIngressId: management.id,
      academicStatus: 'EN_CURSO',
      registrationStatus: 'ADMITIDO',
    };

    const created = await this.studentAcademicDataRepository.create(academicData);
    this.logger.info('[Inscripciones] Datos académicos del estudiante creados', {
      studentId: student.id,
      academicDataId: created.id,
    });

    return created;
  }

  /**
   * Obtiene el plan de estudios y el plan habilitado para la gestión
   * @private
   * @param {Object} studentAcademicData - Entidad StudentAcademicData
   * @param {Object} management - Entidad Management
   * @returns {Promise<{studyPlan: Object, managementPlan: Object}>}
   * @throws {NotFoundError} Si no se encuentra el plan de estudios o el plan habilitado
   */
  async _getStudyPlanAndManagementPlan(studentAcademicData, management) {
    // Obtener plan de estudios vigente de la carrera
    const studyPlansResult = await this.studyPlanRepository.findAll(
      { careerId: studentAcademicData.careerId, active: true },
      null,
      { orderBy: 'vigente', orderDirection: 'DESC' }
    );
    const studyPlan = studyPlansResult.studyPlans?.[0];

    if (!studyPlan) {
      throw new NotFoundError(
        `Plan de estudios vigente para la carrera con ID ${studentAcademicData.careerId}`
      );
    }

    this.logger.info('[Inscripciones] Plan de estudios encontrado', {
      studyPlanId: studyPlan.id,
      careerId: studentAcademicData.careerId,
    });

    // Obtener plan habilitado para la gestión
    const managementPlanResult = await this.managementPlanRepository.findAll(
      {
        managementId: management.id,
        studyPlanId: studyPlan.id,
        active: true,
      },
      null,
      null
    );
    const managementPlan = managementPlanResult.managementPlans?.[0];

    if (!managementPlan) {
      throw new NotFoundError(
        `Plan habilitado para la gestión ${management.year} y plan de estudios ${studyPlan.id}`
      );
    }

    this.logger.info('[Inscripciones] Plan habilitado encontrado', {
      managementPlanId: managementPlan.id,
      managementId: management.id,
      studyPlanId: studyPlan.id,
    });

    return { studyPlan, managementPlan };
  }

  /**
   * Valida que no exista una inscripción previa para el mismo estudiante en la misma gestión
   * @private
   * @param {Object} studentAcademicData - Entidad StudentAcademicData
   * @param {Object} management - Entidad Management
   * @throws {ValidationError} Si ya existe una inscripción
   */
  async _validateNoExistingEnrollment(studentAcademicData, management) {
    const result = await this.enrollmentRepository.findAll(
      {
        studentAcademicDataId: studentAcademicData.id,
        managementId: management.id,
        active: true,
      },
      1,
      null
    );

    if (result.enrollments && result.enrollments.length > 0) {
      throw new ValidationError(
        `Ya existe una inscripción para este estudiante en la gestión ${management.year}`
      );
    }

    this.logger.info('[Inscripciones] Validación de inscripción previa exitosa', {
      studentAcademicDataId: studentAcademicData.id,
      managementId: management.id,
    });
  }

  /**
   * Valida que el estudiante tenga un pago de aporte válido (PARCIAL o CANCELADO) para la gestión vigente.
   * No se permite inscribir si el pago está pendiente, eliminado o no existe.
   * @private
   * @param {Object} student - Entidad Student
   * @param {Object} management - Entidad Management
   * @throws {ValidationError} Si no existe pago, está eliminado o el estado no es PARCIAL/CANCELADO
   */
  async _validatePaymentExists(student, management) {
    const result = await this.contributionPaymentRepository.findAll(
      {
        studentId: student.id,
        managementId: management.id,
      },
      1,
      null
    );

    if (!result.contributionPayments || result.contributionPayments.length === 0) {
      throw new ValidationError(
        `El estudiante no ha realizado el pago del aporte académico para la gestión ${management.year}. ` +
        `Debe realizar el pago antes de inscribirse.`
      );
    }

    const payment = result.contributionPayments[0];
    const estado = String(payment.state ?? payment.estado ?? '').toUpperCase();
    const estadosPermitidos = ['PARCIAL', 'CANCELADO'];

    if (!estadosPermitidos.includes(estado)) {
      throw new ValidationError(
        `El aporte para la gestión ${management.year} está pendiente de pago. ` +
        `Solo puede inscribirse cuando el aporte tenga al menos un pago registrado.`
      );
    }

    this.logger.info('[Inscripciones] Validación de pago de aporte exitosa', {
      studentId: student.id,
      managementId: management.id,
      paymentId: payment.id,
      estado,
      amountPaid: payment.amountPaid,
      scholarshipDiscount: payment.scholarshipDiscount,
    });
  }

  /**
   * Obtiene todas las asignaciones docentes del paralelo para el plan habilitado
   * @private
   * @param {Object} parallel - Entidad Parallel
   * @param {Object} managementPlan - Entidad ManagementPlan
   * @returns {Promise<Array>} Array de entidades TeacherAssignment
   */
  async _getTeacherAssignmentsFromParallel(parallel, managementPlan) {
    // Obtener todos los cursos del paralelo
    const coursesResult = await this.courseRepository.findAll(
      { parallelId: parallel.id },
      null,
      null
    );
    const courses = coursesResult.courses || [];

    this.logger.info('[Inscripciones] Cursos del paralelo obtenidos', {
      parallelId: parallel.id,
      coursesCount: courses.length,
    });

    // Obtener todas las asignaciones docentes para estos cursos y el plan habilitado
    const allAssignments = [];
    for (const course of courses) {
      const coursePlain = course.toPlainObject ? course.toPlainObject() : course;
      const assignmentsResult = await this.teacherAssignmentRepository.findAll(
        {
          managementPlanId: managementPlan.id,
          courseId: coursePlain.id,
          active: true,
          vigente: true,
        },
        null,
        null
      );

      if (assignmentsResult.teacherAssignments && assignmentsResult.teacherAssignments.length > 0) {
        allAssignments.push(...assignmentsResult.teacherAssignments);
        this.logger.info('[Inscripciones] Asignaciones docentes encontradas para curso', {
          courseId: coursePlain.id,
          assignmentsCount: assignmentsResult.teacherAssignments.length,
        });
      }
    }

    this.logger.info('[Inscripciones] Asignaciones docentes obtenidas', {
      parallelId: parallel.id,
      totalAssignments: allAssignments.length,
    });

    return allAssignments;
  }

  /**
   * Crea la inscripción principal
   * @private
   * @param {Object} studentAcademicData - Entidad StudentAcademicData
   * @param {Object} management - Entidad Management
   * @param {string} enrollmentType - Tipo de inscripción
   * @param {string} observations - Observaciones
   * @returns {Promise<Object>} Entidad Enrollment
   */
  async _createEnrollment(studentAcademicData, management, enrollmentType, observations) {
    const enrollmentData = {
      studentAcademicDataId: studentAcademicData.id,
      managementId: management.id,
      enrollmentType,
      enrollmentDate: new Date().toISOString().split('T')[0], // Fecha actual
      observations: observations || null,
    };

    const enrollment = await this.enrollmentRepository.create(enrollmentData);
    this.logger.info('[Inscripciones] Inscripción creada', {
      enrollmentId: enrollment.id,
      enrollmentType: enrollment.enrollmentType,
    });

    return enrollment;
  }

  /**
   * Crea las inscripciones de materias para todas las asignaciones docentes
   * @private
   * @param {Object} enrollment - Entidad Enrollment
   * @param {Array} teacherAssignments - Array de entidades TeacherAssignment
   * @returns {Promise<Array>} Array de entidades EnrollmentSubject
   */
  async _createEnrollmentSubjects(enrollment, teacherAssignments) {
    const enrollmentSubjects = [];
    
    for (const assignment of teacherAssignments) {
      const enrollmentSubjectData = {
        enrollmentId: enrollment.id,
        teacherAssignmentId: assignment.id,
        status: 'INSCRITO',
        observations: null,
        teacherObservations: null,
      };

      const enrollmentSubject = await this.enrollmentSubjectRepository.create(
        enrollmentSubjectData
      );
      enrollmentSubjects.push(enrollmentSubject);

      this.logger.info('[Inscripciones] Materia inscrita creada', {
        enrollmentId: enrollment.id,
        enrollmentSubjectId: enrollmentSubject.id,
        teacherAssignmentId: assignment.id,
      });
    }

    this.logger.info('[Inscripciones] Todas las materias inscritas creadas', {
      enrollmentId: enrollment.id,
      totalSubjects: enrollmentSubjects.length,
    });

    return enrollmentSubjects;
  }

  /**
   * Construye la respuesta final del caso de uso
   * @private
   * @param {Object} enrollment - Entidad Enrollment
   * @param {Array} enrollmentSubjects - Array de entidades EnrollmentSubject
   * @param {number} studentId - ID del estudiante
   * @param {number} parallelId - ID del paralelo
   * @param {Object} management - Entidad Management
   * @returns {Object} Respuesta formateada
   */
  _buildResponse(enrollment, enrollmentSubjects, studentId, parallelId, management) {
    const result = {
      enrollment: enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment,
      enrollmentSubjects: enrollmentSubjects.map((es) =>
        es.toPlainObject ? es.toPlainObject() : es
      ),
    };

    this.logger.info('[Inscripciones] Inscripción creada exitosamente', {
      enrollmentId: enrollment.id,
      enrollmentSubjectsCount: enrollmentSubjects.length,
      studentId,
      parallelId,
      managementId: management.id,
    });

    return result;
  }
}
