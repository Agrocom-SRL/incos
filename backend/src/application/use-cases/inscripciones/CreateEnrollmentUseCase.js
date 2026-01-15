import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: CreateEnrollmentUseCase
 * Módulo: Inscripciones
 * Crea una nueva inscripción con materias asociadas
 * 
 * Responsabilidades:
 * - Validar estudiante y paralelo
 * - Obtener gestión actual desde configuración
 * - Crear datos académicos del estudiante si no existen
 * - Crear la inscripción principal
 * - Insertar todas las materias del paralelo en inscripciones_materias
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
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de creación de inscripción
   * 
   * Flujo completo:
   * 1. Valida estudiante y paralelo
   * 2. Obtiene gestión actual desde configuración
   * 3. Crea datos académicos del estudiante si no existen
   * 4. Obtiene plan de estudios y plan habilitado
   * 5. Valida que no exista inscripción previa
   * 6. Obtiene todas las materias del paralelo
   * 7. Crea la inscripción principal
   * 8. Inserta todas las materias del paralelo en inscripciones_materias
   * 
   * @param {Object} data - Datos de la inscripción a crear (snake_case desde el frontend)
   * @param {number} data.student_id - ID del estudiante (requerido)
   * @param {number} data.parallel_id - ID del paralelo (requerido)
   * @param {string} [data.enrollment_type] - Tipo de inscripción (NUEVO, CONTINUIDAD, REINGRESO, etc.) - opcional
   * @param {string} [data.observations] - Observaciones (opcional)
   * @returns {Promise<Object>} Inscripción creada con todas sus materias
   */
  async execute(data) {
    // Normalizar nombres de campos de snake_case a camelCase para uso interno
    const studentId = data.student_id || data.studentId;
    const parallelId = data.parallel_id || data.parallelId;
    const enrollmentType = data.enrollment_type || data.enrollmentType;
    const observations = data.observations;

    this.logger.info('[Inscripciones] Iniciando creación de inscripción', {
      studentId,
      parallelId,
      enrollmentType,
    });

    try {
      // 1. Validar estudiante y paralelo
      const student = await this._validateStudent(studentId);
      const parallel = await this._validateParallel(parallelId);

      // 2. Obtener gestión actual desde configuración
      const management = await this._getCurrentManagement();

      // 3. Obtener o crear datos académicos del estudiante
      const studentAcademicData = await this._getOrCreateStudentAcademicData(
        studentId,
        parallel,
        management
      );

      // 4. Obtener plan de estudios y plan habilitado
      const { studyPlan, managementPlan } = await this._getStudyPlanAndManagementPlan(
        studentAcademicData,
        management
      );

      // 5. Validar que no exista inscripción previa
      await this._validateNoExistingEnrollment(studentAcademicData, management);

      // 6. Obtener todas las asignaciones docentes del paralelo
      const teacherAssignments = await this._getTeacherAssignmentsFromParallel(
        parallel,
        managementPlan
      );

      // 7. Crear la inscripción principal
      const enrollment = await this._createEnrollment(
        studentAcademicData,
        management,
        enrollmentType,
        observations
      );

      // 8. Crear las inscripciones de materias para todas las asignaciones docentes
      const enrollmentSubjects = await this._createEnrollmentSubjects(
        enrollment,
        teacherAssignments
      );

      // 9. Construir y retornar respuesta
      return this._buildResponse(enrollment, enrollmentSubjects, studentId, parallelId, management);

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
      parallelId: parallel.id,
      parallelName: parallel.name,
      careerId: parallel.careerId,
    });

    return parallel;
  }

  /**
   * Obtiene la gestión actual desde la configuración del sistema
   * La configuración almacena el año académico, no el ID de la gestión
   * @private
   * @returns {Promise<Object>} Entidad Management
   * @throws {NotFoundError} Si no se encuentra la configuración o la gestión
   * @throws {ValidationError} Si la gestión no está vigente
   */
  async _getCurrentManagement() {
    const gestionActualConfig = await this.configuracionSistemaRepository.findByClave(
      'gestion_actual'
    );

    if (!gestionActualConfig) {
      throw new NotFoundError('Configuración de gestión actual');
    }

    // La configuración almacena el año académico, no el ID
    const gestionAnio = parseInt(gestionActualConfig.value, 10);
    if (isNaN(gestionAnio)) {
      throw new ValidationError('La gestión actual configurada no es un año válido');
    }

    // Buscar gestiones por año (puede haber múltiples gestiones en el mismo año)
    const managements = await this.managementRepository.findByAnio(gestionAnio);
    if (!managements || managements.length === 0) {
      throw new NotFoundError(`Gestión para el año ${gestionAnio}`);
    }

    // Obtener la gestión activa o la más reciente (ordenada por código DESC)
    // findByAnio ya ordena por codigo DESC, así que el primero es el más reciente
    const management = managements.find((m) => m.isActive) || managements[0];

    // Validar que la gestión esté vigente
    if (!management.isActive) {
      throw new ValidationError(`La gestión ${management.code} no está vigente`);
    }

    this.logger.info('[Inscripciones] Gestión actual obtenida', {
      managementId: management.id,
      code: management.code,
      year: management.year,
      isActive: management.isActive,
    });

    return management;
  }

  /**
   * Obtiene o crea los datos académicos del estudiante
   * @private
   * @param {number} studentId - ID del estudiante
   * @param {Object} parallel - Entidad Parallel
   * @param {Object} management - Entidad Management
   * @returns {Promise<Object>} Entidad StudentAcademicData
   * @throws {ValidationError} Si el paralelo no pertenece a la carrera del estudiante
   */
  async _getOrCreateStudentAcademicData(studentId, parallel, management) {
    const studentAcademicDataResult = await this.studentAcademicDataRepository.findAll(
      { studentId },
      null,
      null
    );

    let studentAcademicData = null;

    if (!studentAcademicDataResult.studentAcademicData || studentAcademicDataResult.studentAcademicData.length === 0) {
      // No existen datos académicos, crearlos
      this.logger.info('[Inscripciones] Creando datos académicos del estudiante', {
        studentId,
        careerId: parallel.careerId,
        managementId: management.id,
      });

      const newAcademicData = {
        studentId,
        careerId: parallel.careerId,
        managementId: management.id, // Gestión de ingreso = gestión actual
        academicState: 'REGULAR',
        registrationState: 'ADMITIDO', // Ya está inscrito, así que está admitido
      };

      studentAcademicData = await this.studentAcademicDataRepository.create(newAcademicData);
      this.logger.info('[Inscripciones] Datos académicos creados', {
        studentAcademicDataId: studentAcademicData.id,
        careerId: studentAcademicData.careerId,
        managementId: studentAcademicData.managementId,
      });
    } else {
      // Ya existen datos académicos
      studentAcademicData = studentAcademicDataResult.studentAcademicData[0];
      
      // Validar que el paralelo pertenezca a la misma carrera del estudiante
      if (parallel.careerId !== studentAcademicData.careerId) {
        throw new ValidationError(
          `El paralelo no pertenece a la carrera del estudiante. Paralelo: carrera ${parallel.careerId}, Estudiante: carrera ${studentAcademicData.careerId}`
        );
      }

      this.logger.info('[Inscripciones] Datos académicos obtenidos', {
        studentAcademicDataId: studentAcademicData.id,
        careerId: studentAcademicData.careerId,
        studentId: studentAcademicData.studentId,
      });
    }

    return studentAcademicData;
  }

  /**
   * Obtiene el plan de estudios y el plan habilitado para la gestión
   * @private
   * @param {Object} studentAcademicData - Entidad StudentAcademicData
   * @param {Object} management - Entidad Management
   * @returns {Promise<Object>} { studyPlan, managementPlan }
   * @throws {NotFoundError} Si no se encuentra el plan de estudios o el plan habilitado
   */
  async _getStudyPlanAndManagementPlan(studentAcademicData, management) {
    // Buscar planes de estudios por carrera, ordenados por vigente DESC para que los activos aparezcan primero
    const result = await this.studyPlanRepository.findAll(
      { 
        careerId: studentAcademicData.careerId,
        sort: 'vigente:DESC'
      },
      null,
      null
    );
    const studyPlans = result.studyPlans || [];

    if (!studyPlans || studyPlans.length === 0) {
      throw new NotFoundError(`Plan de estudios para la carrera del estudiante`);
    }

    // Obtener el plan activo o el primero disponible
    // Como ya están ordenados por vigente DESC, el primero debería ser el activo
    const studyPlan = studyPlans.find((sp) => sp.isActive) || studyPlans[0];
    this.logger.info('[Inscripciones] Plan de estudios encontrado', {
      studyPlanId: studyPlan.id,
      careerId: studyPlan.careerId,
    });

    // Obtener plan habilitado para la gestión y plan de estudios
    const managementPlans = await this.managementPlanRepository.findAll(
      {
        managementId: management.id,
        studyPlanId: studyPlan.id,
      },
      null,
      null
    );

    if (!managementPlans.managementPlans || managementPlans.managementPlans.length === 0) {
      throw new NotFoundError(
        `Plan habilitado para la gestión ${management.code} y el plan de estudios de la carrera del estudiante`
      );
    }

    // Obtener el plan vigente o el primero disponible
    const managementPlan = managementPlans.managementPlans.find((mp) => mp.isActive()) || managementPlans.managementPlans[0];
    this.logger.info('[Inscripciones] Plan habilitado encontrado', {
      managementPlanId: managementPlan.id,
      studyPlanId: managementPlan.studyPlanId,
      state: managementPlan.state,
    });

    return { studyPlan, managementPlan };
  }

  /**
   * Valida que no exista una inscripción previa para el estudiante en la gestión
   * @private
   * @param {Object} studentAcademicData - Entidad StudentAcademicData
   * @param {Object} management - Entidad Management
   * @returns {Promise<void>}
   * @throws {ValidationError} Si ya existe una inscripción
   */
  async _validateNoExistingEnrollment(studentAcademicData, management) {
    const existingEnrollment = await this.enrollmentRepository.findBy({
      studentAcademicDataId: studentAcademicData.id,
      managementId: management.id,
    });

    if (existingEnrollment) {
      throw new ValidationError(
        `Ya existe una inscripción para este estudiante en la gestión ${management.code}`
      );
    }

    this.logger.info('[Inscripciones] Validación de inscripción previa exitosa', {
      studentAcademicDataId: studentAcademicData.id,
      managementId: management.id,
    });
  }

  /**
   * Obtiene todas las asignaciones docentes de los cursos del paralelo
   * @private
   * @param {Object} parallel - Entidad Parallel
   * @param {Object} managementPlan - Entidad ManagementPlan
   * @returns {Promise<Array>} Array de entidades TeacherAssignment
   * @throws {NotFoundError} Si no se encuentran cursos o asignaciones docentes
   */
  async _getTeacherAssignmentsFromParallel(parallel, managementPlan) {
    const coursesResult = await this.courseRepository.findAll(
      { parallelId: parallel.id },
      null,
      null
    );

    const courses = coursesResult.courses || [];
    if (courses.length === 0) {
      throw new NotFoundError(`Cursos para el paralelo ${parallel.name}`);
    }

    this.logger.info('[Inscripciones] Cursos del paralelo obtenidos', {
      parallelId: parallel.id,
      coursesCount: courses.length,
    });

    // Obtener asignaciones docentes de todos los cursos del paralelo para la gestión
    const teacherAssignments = [];
    for (const course of courses) {
      const assignmentsResult = await this.teacherAssignmentRepository.findAll(
        {
          courseId: course.id,
          managementPlanId: managementPlan.id,
          active: true, // Solo asignaciones vigentes
        },
        null,
        null
      );

      const courseAssignments = assignmentsResult.teacherAssignments || [];
      if (courseAssignments.length > 0) {
        teacherAssignments.push(...courseAssignments);
        this.logger.info('[Inscripciones] Asignaciones docentes encontradas para curso', {
          courseId: course.id,
          courseCode: course.code,
          assignmentsCount: courseAssignments.length,
        });
      } else {
        this.logger.warn('[Inscripciones] Curso sin asignaciones docentes vigentes', {
          courseId: course.id,
          courseCode: course.code,
        });
      }
    }

    if (teacherAssignments.length === 0) {
      throw new NotFoundError(
        `Asignaciones docentes vigentes para los cursos del paralelo ${parallel.name} en la gestión`
      );
    }

    this.logger.info('[Inscripciones] Asignaciones docentes obtenidas', {
      totalAssignments: teacherAssignments.length,
    });

    return teacherAssignments;
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
      enrollmentType: enrollmentType || 'CONTINUIDAD',
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
