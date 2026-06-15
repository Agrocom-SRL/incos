import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_ACADEMICOS,
  ESTADOS_REGISTRO_ESTUDIANTE,
} from '../../../domain/constants/estudiantes.constants.js';
import {
  TIPOS_INSCRIPCION,
  ESTADOS_MATERIA_INSCRITA,
} from '../../../domain/constants/inscripciones.constants.js';
import { parsePriorHistoryItem } from './priorHistoryItemValidation.js';
import { activarCursadoInscripcion } from '../../utils/activarCursadoInscripcion.js';

/**
 * Use Case: CreateEnrollmentUseCase
 * Módulo: Inscripciones
 * Crea una nueva inscripción con materias asociadas (capa INSCRIPCIÓN únicamente).
 *
 * Separación conceptual Inscripción vs Matriculación:
 * - INSCRIPCIÓN (este use case): El estudiante elige paralelo(s) y materias por periodo.
 *   Se crean inscripciones e inscripciones_materias (asignacion_docente_id). La inscripción
 *   vincula al estudiante con asignaciones docentes específicas (curso + docente + gestion_plan).
 *   NO se asignan horarios ni aulas en este proceso; eso corresponde a la MATRICULACIÓN.
 * - MATRICULACIÓN (concepto separado): Proceso posterior que trabaja con horarios concretos
 *   (cursos_horarios, horarios, aulas), cupos y habilitación de aulas. Se realiza después
 *   de la inscripción, antes del inicio de clases. No forma parte de este caso de uso.
 *
 * Estructura de datos:
 * - inscripciones: registro principal por estudiante y gestión
 * - inscripciones_materias: vincula inscripción con asignacion_docente_id
 * - asignaciones_docentes: vincula curso (paralelo + materia) con docente y gestion_plan
 * - cursos: vincula paralelo con materia
 * - paralelos: agrupa estudiantes por carrera, periodo y turno
 *
 * Responsabilidades (solo inscripción):
 * - Validar estudiante y paralelo(s) o asignaciones docentes específicas
 * - Obtener gestión actual desde configuración
 * - Crear datos académicos del estudiante si no existen
 * - Crear la inscripción principal (inscripciones)
 * - Insertar materias inscritas (inscripciones_materias) por paralelo completo o por teacherAssignmentIds
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
   * @param {Object} params.subjectEnrollmentRepository - Repositorio de materias inscritas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos
   * @param {Object} params.parallelRepository - Repositorio de paralelos
   * @param {Object} params.courseOfferRepository - Repositorio de oferta de cursos
   * @param {Object} params.parallelManagementRepository - Repositorio de paralelos en gestión
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
   * @param {Object} params.planSubjectRepository - Repositorio de asignaturas del plan (para resolver materias por periodo)
   * @param {Object} params.contributionPaymentRepository - Repositorio de pagos de aporte
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    enrollmentRepository,
    subjectEnrollmentRepository,
    studentRepository,
    studentAcademicDataRepository,
    parallelRepository,
    courseOfferRepository,
    parallelManagementRepository,
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
    planSubjectRepository,
    contributionPaymentRepository,
    priorEnrollmentHistoryRepository,
    subjectEnrollmentBimesterRepository,
    logger,
  }) {
    this.enrollmentRepository = enrollmentRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.studentRepository = studentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.parallelRepository = parallelRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.parallelManagementRepository = parallelManagementRepository;
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
    this.planSubjectRepository = planSubjectRepository;
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.priorEnrollmentHistoryRepository = priorEnrollmentHistoryRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de creación de inscripción.
   * 
   * Dos modos de operación:
   * 1. Modo paralelo completo: con parallelId inscribe al estudiante en todas las materias del paralelo
   *    (usado típicamente para estudiantes nuevos que cursan todas las materias del periodo).
   * 2. Modo materias específicas: con teacherAssignmentIds inscribe solo en las asignaciones docentes
   *    seleccionadas (usado para estudiantes antiguos que eligen materias específicas).
   *
   * @param {Object} data - Datos de la inscripción
   * @param {number} data.studentId - ID del estudiante (requerido)
   * @param {number} [data.parallelId] - ID del paralelo (requerido si no se envía teacherAssignmentIds)
   * @param {number[]} [data.teacherAssignmentIds] - IDs de asignaciones docentes (opcional; permite inscribir
   *   materias de diferentes paralelos/periodos en una sola inscripción. Todas deben pertenecer al mismo plan habilitado)
   * @param {string} [data.enrollmentType] - Tipo de inscripción (NUEVO, ANTIGUO, TRASPASO, TRANSITABILIDAD, etc.)
   * @param {string} [data.observations] - Observaciones (opcional)
   * @returns {Promise<Object>} Inscripción creada con materias asociadas
   * 
   * NOTA: enrollmentDate NO se recibe del frontend; se genera automáticamente en _createEnrollment()
   * usando la fecha actual del sistema.
   */
  async execute(data) {
    let {
      studentId,
      parallelId,
      teacherAssignmentIds,
      parallelIdsByPeriod,
      materiaIdsByPeriod,
      enrollmentType = TIPOS_INSCRIPCION.NUEVO,
      observations,
      priorHistory = null,
    } = data;

    // Determinar si el frontend envió selección por periodo (ANTIGUO) para resolver a teacherAssignmentIds
    const hasSelectionByPeriod =
      parallelIdsByPeriod &&
      typeof parallelIdsByPeriod === 'object' &&
      materiaIdsByPeriod &&
      typeof materiaIdsByPeriod === 'object' &&
      Object.keys(materiaIdsByPeriod).length > 0 &&
      Object.values(materiaIdsByPeriod).some((arr) => Array.isArray(arr) && arr.length > 0);

    // Determinar modo: materias específicas si se envía array no vacío de teacherAssignmentIds (o se resuelve desde selección)
    let useMateriasMode = Array.isArray(teacherAssignmentIds) && teacherAssignmentIds.length > 0;

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

      // Si la gestión vigente ya está "en activación" (cursado iniciado), las
      // matrículas nuevas nacen en CURSANDO con sus bimestres abiertos, no en INSCRITO.
      const gestionIniciada = this.subjectEnrollmentRepository
        ? await this.subjectEnrollmentRepository.existeCursandoEnGestion(management.id)
        : false;

      // Resolver teacherAssignmentIds u oferta de curso desde selección por periodo (ANTIGUO)
      let offerRowsFromSelection = null;
      if (hasSelectionByPeriod && (!Array.isArray(teacherAssignmentIds) || teacherAssignmentIds.length === 0)) {
        const resolved = await this._resolveTeacherAssignmentIdsFromSelection(
          parallelIdsByPeriod,
          materiaIdsByPeriod,
          student,
          management
        );
        if (resolved && resolved.length > 0) {
          teacherAssignmentIds = resolved;
          useMateriasMode = true;
          this.logger.info('[Inscripciones] teacherAssignmentIds resueltos desde selección por periodo', {
            count: teacherAssignmentIds.length,
            parallelIdsByPeriod: Object.keys(parallelIdsByPeriod).length,
          });
        } else {
          offerRowsFromSelection = await this._resolveOfferRowsFromSelection(
            parallelIdsByPeriod,
            materiaIdsByPeriod,
            student,
            management
          );
          if (offerRowsFromSelection.length > 0) {
            this.logger.info('[Inscripciones] Oferta de curso resuelta desde selección por periodo', {
              count: offerRowsFromSelection.length,
            });
          }
        }
      }

      let parallel;
      let teacherAssignments;

      if (offerRowsFromSelection?.length > 0) {
        const periodIds = Object.keys(materiaIdsByPeriod).filter(
          (k) => Array.isArray(materiaIdsByPeriod[k]) && materiaIdsByPeriod[k].length > 0
        );
        const firstPeriodId = periodIds[0];
        const firstParallelId = parallelIdsByPeriod[firstPeriodId];
        if (!firstParallelId) {
          throw new ValidationError(
            'Debe indicar el paralelo por periodo para las materias seleccionadas'
          );
        }
        parallel = await this._validateParallel(Number(firstParallelId));

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
        const enrollment = await this._createEnrollment(
          studentAcademicData,
          management,
          enrollmentType,
          observations
        );
        const subjectEnrollments = await this._createsubjectEnrollments(
          enrollment,
          offerRowsFromSelection,
          gestionIniciada
        );
        const priorEnrollmentHistories = await this._createPriorEnrollmentHistory(
          enrollment,
          priorHistory,
          managementPlan
        );
        return this._buildResponse(
          enrollment,
          subjectEnrollments,
          studentId,
          parallel.id,
          management,
          priorEnrollmentHistories
        );
      }

      if (useMateriasMode) {
        // Modo materias específicas: permite inscribir materias de diferentes paralelos/periodos
        // Se usa el primer paralelo solo para determinar la carrera y crear/obtener datos académicos
        // Las asignaciones docentes pueden ser de cualquier paralelo/periodo de la misma carrera
        const { parallel: firstParallel } = await this._getParallelFromFirstTeacherAssignment(
          teacherAssignmentIds[0]
        );
        if (!firstParallel) {
          throw new ValidationError(
            'No se pudo determinar la carrera desde las asignaciones docentes seleccionadas'
          );
        }
        parallel = firstParallel;

        // Crear o obtener datos académicos del estudiante (si no existen, se crean automáticamente)
        const studentAcademicData = await this._getOrCreateStudentAcademicData(
          student,
          parallel,
          management
        );
        const { managementPlan } = await this._getStudyPlanAndManagementPlan(
          studentAcademicData,
          management
        );

        // Validar y resolver todas las asignaciones docentes (pueden ser de diferentes paralelos/periodos)
        // Todas deben pertenecer al mismo plan habilitado (misma carrera)
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
        const offerRows = await this._offerRowsFromTeacherAssignments(teacherAssignments);
        const subjectEnrollments = await this._createsubjectEnrollments(
          enrollment,
          offerRows,
          gestionIniciada
        );
        const priorEnrollmentHistories = await this._createPriorEnrollmentHistory(
          enrollment,
          priorHistory,
          managementPlan
        );
        return this._buildResponse(
          enrollment,
          subjectEnrollments,
          studentId,
          parallel.id,
          management,
          priorEnrollmentHistories
        );
      }

      if (!parallelId) {
        if (hasSelectionByPeriod) {
          throw new ValidationError(
            'No hay oferta de curso vigente para las materias y paralelo seleccionados. Verifique la oferta académica de la gestión.'
          );
        }
        throw new ValidationError(
          'El ID del paralelo es requerido cuando no se envían materias específicas (teacherAssignmentIds)'
        );
      }
      // Modo paralelo completo: inscribe en todas las materias del paralelo
      parallel = await this._validateParallel(parallelId);

      // Crear o obtener datos académicos del estudiante (si no existen, se crean automáticamente)
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
      teacherAssignments = await this._getCourseOfferRowsFromParallel(
        parallel,
        managementPlan
      );
      const enrollment = await this._createEnrollment(
        studentAcademicData,
        management,
        enrollmentType,
        observations
      );
      const subjectEnrollments = await this._createsubjectEnrollments(
        enrollment,
        teacherAssignments,
        gestionIniciada
      );
      const priorEnrollmentHistories = await this._createPriorEnrollmentHistory(
        enrollment,
        priorHistory,
        managementPlan
      );
      return this._buildResponse(
        enrollment,
        subjectEnrollments,
        studentId,
        parallelId,
        management,
        priorEnrollmentHistories
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
    const offerCourseId = assignmentPlain.offerCourseId ?? assignmentPlain.ofertaCursoId;
    if (!offerCourseId) {
      this.logger.warn('[Inscripciones] Asignación docente sin oferta de curso', { teacherAssignmentId });
      return { parallel: null };
    }
    const offer = await this.courseOfferRepository.findById(offerCourseId);
    if (!offer) {
      throw new NotFoundError(`Oferta de curso con ID ${offerCourseId}`);
    }
    const offerPlain = offer.toPlainObject ? offer.toPlainObject() : offer;
    const parallelManagementId = offerPlain.parallelManagementId ?? offerPlain.paraleloGestionId;
    if (!parallelManagementId) {
      this.logger.warn('[Inscripciones] Oferta sin paralelo-gestión', { offerCourseId });
      return { parallel: null };
    }
    const parallelManagement = await this.parallelManagementRepository.findById(parallelManagementId);
    if (!parallelManagement) {
      throw new NotFoundError(`Paralelo-gestión con ID ${parallelManagementId}`);
    }
    const pgPlain = parallelManagement.toPlainObject
      ? parallelManagement.toPlainObject()
      : parallelManagement;
    const parallelId = pgPlain.parallelId ?? pgPlain.paraleloId;
    if (!parallelId) {
      return { parallel: null };
    }
    const parallel = await this.parallelRepository.findById(parallelId);
    return { parallel: parallel || null };
  }

  /**
   * Valida y resuelve las asignaciones docentes por ID; todas deben pertenecer al mismo plan habilitado.
   * 
   * IMPORTANTE: Este método permite inscribir materias de diferentes paralelos y periodos en una sola
   * inscripción. Cada asignación docente está vinculada a un curso específico (paralelo + materia),
   * por lo que se pueden seleccionar materias de múltiples paralelos/periodos siempre que todas
   * pertenezcan al mismo plan habilitado (misma carrera y gestión).
   * 
   * @private
   * @param {number[]} teacherAssignmentIds - IDs de asignaciones docentes (pueden ser de diferentes paralelos/periodos)
   * @param {number} managementPlanId - ID del plan habilitado (todas las asignaciones deben pertenecer a este plan)
   * @returns {Promise<Array>} Array de entidades TeacherAssignment validadas
   * @throws {NotFoundError} Si alguna asignación docente no existe
   * @throws {ValidationError} Si alguna asignación no pertenece al plan habilitado
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
   * Obtiene o crea los datos académicos del estudiante.
   * 
   * Este método es crucial para estudiantes nuevos que aún no tienen datos académicos registrados.
   * Si el estudiante no tiene datos académicos activos, se crean automáticamente con:
   * - La carrera del paralelo seleccionado
   * - La gestión de ingreso actual
   * - Estado académico: ESTADOS_ACADEMICOS.REGULAR (valor por defecto según esquema de BD)
   * - Estado de registro: ESTADOS_REGISTRO_ESTUDIANTE.ADMITIDO (al crear inscripción, el estudiante queda admitido)
   * 
   * Si el estudiante ya tiene datos académicos:
   * - Se actualiza la carrera si cambia
   * - Se actualiza el estado_registro a ESTADOS_REGISTRO_ESTUDIANTE.ADMITIDO si aún no lo está
   *   (BORRADOR o PENDIENTE) porque al crear una inscripción, el estudiante queda formalmente admitido
   * 
   * @private
   * @param {Object} student - Entidad Student
   * @param {Object} parallel - Entidad Parallel (se usa para determinar la carrera)
   * @param {Object} management - Entidad Management (gestión actual)
   * @returns {Promise<Object>} Entidad StudentAcademicData (existente o recién creada)
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
      // Si existe, actualizar la carrera y el estado de registro si es necesario
      const parallelPlain = parallel.toPlainObject ? parallel.toPlainObject() : parallel;
      const careerId = parallelPlain.careerId || parallel.careerId;
      
      // Verificar si necesita actualización (carrera o estado_registro)
      const needsCareerUpdate = existingAcademicData.careerId !== careerId;
      
      // Obtener estado_registro actual (puede venir como registrationState desde entidad o estadoRegistro desde modelo)
      const existingPlain = existingAcademicData.toPlainObject ? existingAcademicData.toPlainObject() : existingAcademicData;
      const currentRegistrationStatus = existingPlain.registrationState || existingPlain.estadoRegistro || ESTADOS_REGISTRO_ESTUDIANTE.BORRADOR;
      const needsStatusUpdate = currentRegistrationStatus !== ESTADOS_REGISTRO_ESTUDIANTE.ADMITIDO;

      if (needsCareerUpdate || needsStatusUpdate) {
        const updateData = {};
        
        if (needsCareerUpdate) {
          updateData.careerId = careerId;
          updateData.managementIngressId = management.id;
          this.logger.info('[Inscripciones] Actualizando carrera del estudiante', {
            studentId: student.id,
            oldCareerId: existingAcademicData.careerId,
            newCareerId: careerId,
          });
        }
        
        if (needsStatusUpdate) {
          // Actualizar estado_registro a ADMITIDO cuando se crea una inscripción
          // El mapper espera registrationState (dominio) y lo mapea a estadoRegistro (BD)
          updateData.registrationState = ESTADOS_REGISTRO_ESTUDIANTE.ADMITIDO;
          this.logger.info('[Inscripciones] Actualizando estado_registro a ADMITIDO', {
            studentId: student.id,
            oldStatus: currentRegistrationStatus,
            newStatus: ESTADOS_REGISTRO_ESTUDIANTE.ADMITIDO,
          });
        }

        await this.studentAcademicDataRepository.update(existingAcademicData.id, updateData);

        // Obtener los datos actualizados
        const updated = await this.studentAcademicDataRepository.findById(existingAcademicData.id);
        this.logger.info('[Inscripciones] Datos académicos del estudiante actualizados', {
          studentId: student.id,
          academicDataId: updated.id,
          careerUpdated: needsCareerUpdate,
          statusUpdated: needsStatusUpdate,
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
      academicState: ESTADOS_ACADEMICOS.REGULAR, // Estado académico por defecto según esquema
      registrationState: ESTADOS_REGISTRO_ESTUDIANTE.ADMITIDO, // Al crear inscripción, el estudiante queda ADMITIDO
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
        academicDataId: studentAcademicData.id,
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
      academicDataId: studentAcademicData.id,
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
   * Resuelve teacherAssignmentIds a partir de la selección por periodo (paralelo por periodo + materias por periodo).
   * Usado cuando el frontend envía parallel_ids_by_period y materia_ids_by_period (estudiante ANTIGUO).
   *
   * @private
   * @param {Object} parallelIdsByPeriod - { [periodId]: parallelId }
   * @param {Object} materiaIdsByPeriod - { [periodId]: [materiaId, ...] }
   * @param {Object} student - Entidad Student
   * @param {Object} management - Entidad Management
   * @returns {Promise<number[]>} Array de IDs de asignaciones docentes
   */
  async _resolveTeacherAssignmentIdsFromSelection(parallelIdsByPeriod, materiaIdsByPeriod, student, management) {
    const periodIds = Object.keys(materiaIdsByPeriod).filter(
      (k) => Array.isArray(materiaIdsByPeriod[k]) && materiaIdsByPeriod[k].length > 0
    );
    if (periodIds.length === 0) return [];

    const firstPeriodId = periodIds[0];
    const firstParallelId = parallelIdsByPeriod[firstPeriodId];
    if (!firstParallelId) return [];

    const parallel = await this.parallelRepository.findById(Number(firstParallelId));
    if (!parallel) return [];

    const studentAcademicData = await this._getOrCreateStudentAcademicData(student, parallel, management);
    const { managementPlan } = await this._getStudyPlanAndManagementPlan(studentAcademicData, management);
    const managementPlanId = managementPlan.id;

    const assignmentIds = [];
    const materiaIdSetByPeriod = {};
    for (const pid of periodIds) {
      materiaIdSetByPeriod[pid] = new Set((materiaIdsByPeriod[pid] || []).map(Number));
    }

    for (const periodId of periodIds) {
      const parallelId = parallelIdsByPeriod[periodId];
      if (!parallelId) continue;

      const parallelManagement = await this.parallelManagementRepository.findByParallelAndManagementPlan(
        Number(parallelId),
        managementPlanId
      );
      if (!parallelManagement) continue;

      const pgPlain = parallelManagement.toPlainObject
        ? parallelManagement.toPlainObject()
        : parallelManagement;
      const offers = await this.courseOfferRepository.findEnrichedByParallelManagementId(pgPlain.id);

      for (const offer of offers) {
        if (Number(offer.periodoId) !== Number(periodId)) continue;

        const allowedMaterias = materiaIdSetByPeriod[periodId];
        if (!allowedMaterias || !allowedMaterias.has(Number(offer.materiaId))) continue;

        const assignmentsResult = await this.teacherAssignmentRepository.findAll(
          {
            managementPlanId,
            offerCourseId: offer.id,
            active: true,
          },
          1,
          null
        );
        const list = assignmentsResult.teacherAssignments ?? assignmentsResult.teacherAssignment ?? [];
        if (list.length > 0) {
          const assign = list[0];
          const assignId = assign.id ?? assign.toPlainObject?.()?.id;
          if (assignId) assignmentIds.push(assignId);
        }
      }
    }

    this.logger.info('[Inscripciones] Teacher assignments resueltos desde selección', {
      periodCount: periodIds.length,
      assignmentCount: assignmentIds.length,
    });
    return assignmentIds;
  }

  /**
   * Resuelve filas de oferta (oferta_curso) desde paralelo + materias por periodo.
   * Usado cuando aún no hay asignación docente vigente pero la oferta académica existe.
   *
   * @private
   */
  async _resolveOfferRowsFromSelection(parallelIdsByPeriod, materiaIdsByPeriod, student, management) {
    const periodIds = Object.keys(materiaIdsByPeriod).filter(
      (k) => Array.isArray(materiaIdsByPeriod[k]) && materiaIdsByPeriod[k].length > 0
    );
    if (periodIds.length === 0) return [];

    const firstPeriodId = periodIds[0];
    const firstParallelId = parallelIdsByPeriod[firstPeriodId];
    if (!firstParallelId) return [];

    const parallel = await this.parallelRepository.findById(Number(firstParallelId));
    if (!parallel) return [];

    const studentAcademicData = await this._getOrCreateStudentAcademicData(student, parallel, management);
    const { managementPlan } = await this._getStudyPlanAndManagementPlan(studentAcademicData, management);
    const managementPlanId = managementPlan.id;

    const rows = [];
    const seenOfferIds = new Set();
    const materiaIdSetByPeriod = {};
    for (const pid of periodIds) {
      materiaIdSetByPeriod[pid] = new Set((materiaIdsByPeriod[pid] || []).map(Number));
    }

    for (const periodId of periodIds) {
      const parallelId = parallelIdsByPeriod[periodId];
      if (!parallelId) continue;

      const parallelManagement = await this.parallelManagementRepository.findByParallelAndManagementPlan(
        Number(parallelId),
        managementPlanId
      );
      if (!parallelManagement) continue;

      const pgPlain = parallelManagement.toPlainObject
        ? parallelManagement.toPlainObject()
        : parallelManagement;
      const offers = await this.courseOfferRepository.findEnrichedByParallelManagementId(pgPlain.id);

      for (const offer of offers) {
        if (Number(offer.periodoId) !== Number(periodId)) continue;

        const allowedMaterias = materiaIdSetByPeriod[periodId];
        if (!allowedMaterias || !allowedMaterias.has(Number(offer.materiaId))) continue;

        const offerId = Number(offer.id);
        if (!Number.isFinite(offerId) || offerId < 1 || seenOfferIds.has(offerId)) continue;
        if (offer.activo === false || offer.activo === 0) continue;

        seenOfferIds.add(offerId);
        rows.push({
          offerCourseId: offerId,
          curriculumSubjectId: offer.asignaturaPlanId ?? offer.planSubjectId ?? null,
        });
      }
    }

    return rows;
  }

  /**
   * Obtiene filas de oferta del paralelo para matricular (todas las materias ofertadas).
   * @private
   */
  async _getCourseOfferRowsFromParallel(parallel, managementPlan) {
    const parallelManagement = await this.parallelManagementRepository.findByParallelAndManagementPlan(
      parallel.id,
      managementPlan.id
    );
    if (!parallelManagement) {
      throw new ValidationError(
        `El paralelo ${parallel.name ?? parallel.id} no está instanciado en la gestión actual`
      );
    }

    const pgPlain = parallelManagement.toPlainObject
      ? parallelManagement.toPlainObject()
      : parallelManagement;
    const offers = await this.courseOfferRepository.findEnrichedByParallelManagementId(pgPlain.id);
    const activeOffers = offers.filter((o) => o.activo !== false && o.activo !== 0);

    this.logger.info('[Inscripciones] Oferta del paralelo obtenida', {
      parallelId: parallel.id,
      parallelManagementId: pgPlain.id,
      offersCount: activeOffers.length,
    });

    if (activeOffers.length === 0) {
      throw new ValidationError(
        'El paralelo no tiene materias ofertadas en la gestión actual. Configure la oferta académica primero.'
      );
    }

    return activeOffers.map((offer) => ({
      offerCourseId: offer.id,
      curriculumSubjectId: offer.asignaturaPlanId,
    }));
  }

  /**
   * Convierte asignaciones docentes validadas en filas de oferta para matricular.
   * @private
   */
  async _offerRowsFromTeacherAssignments(teacherAssignments) {
    const rows = [];
    const seenOfferIds = new Set();

    for (const assignment of teacherAssignments) {
      const plain = assignment.toPlainObject ? assignment.toPlainObject() : assignment;
      const offerCourseId = plain.offerCourseId ?? plain.ofertaCursoId;
      if (!offerCourseId) {
        throw new ValidationError(
          `La asignación docente ${plain.id} no está vinculada a una oferta de curso`
        );
      }
      if (seenOfferIds.has(offerCourseId)) continue;
      seenOfferIds.add(offerCourseId);

      const offer = await this.courseOfferRepository.findById(offerCourseId);
      if (!offer) {
        throw new NotFoundError(`Oferta de curso con ID ${offerCourseId}`);
      }
      const offerPlain = offer.toPlainObject ? offer.toPlainObject() : offer;
      rows.push({
        offerCourseId,
        curriculumSubjectId: offerPlain.planSubjectId ?? offerPlain.asignaturaPlanId,
      });
    }

    if (rows.length === 0) {
      throw new ValidationError('No se pudieron resolver materias desde las asignaciones docentes');
    }

    return rows;
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
      academicDataId: studentAcademicData.id,
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
   * Crea matrículas de materia ancladas a oferta_curso_id.
   * @private
   * @param {Object} enrollment - Entidad Enrollment
   * @param {Array<{offerCourseId: number, curriculumSubjectId: number}>} offerRows
   * @param {boolean} [gestionIniciada=false] - Si la gestión ya está en activación, las
   *   matrículas nacen en CURSANDO y se abren sus bimestres (no INSCRITO).
   * @returns {Promise<Array>}
   */
  async _createsubjectEnrollments(enrollment, offerRows, gestionIniciada = false) {
    const subjectEnrollments = [];
    const status = gestionIniciada
      ? ESTADOS_MATERIA_INSCRITA.CURSANDO
      : ESTADOS_MATERIA_INSCRITA.INSCRITO;

    for (const row of offerRows) {
      const enrollmentSubjectData = {
        enrollmentId: enrollment.id,
        offerCourseId: row.offerCourseId,
        curriculumSubjectId: row.curriculumSubjectId ?? null,
        status,
        observations: null,
      };

      const enrollmentSubject = await this.subjectEnrollmentRepository.create(
        enrollmentSubjectData
      );
      subjectEnrollments.push(enrollmentSubject);

      this.logger.info('[Inscripciones] Materia inscrita creada', {
        enrollmentId: enrollment.id,
        enrollmentSubjectId: enrollmentSubject.id,
        offerCourseId: row.offerCourseId,
      });
    }

    this.logger.info('[Inscripciones] Todas las materias inscritas creadas', {
      enrollmentId: enrollment.id,
      totalSubjects: subjectEnrollments.length,
    });

    // Gestión en activación: abrir los 4 bimestres de las matrículas recién creadas
    // (CURSANDO). Idempotente; userId no disponible en creación → auditoría con NULL.
    if (gestionIniciada && this.subjectEnrollmentBimesterRepository) {
      await activarCursadoInscripcion({
        subjectEnrollmentRepository: this.subjectEnrollmentRepository,
        subjectEnrollmentBimesterRepository: this.subjectEnrollmentBimesterRepository,
        inscripcionId: enrollment.id,
        userId: null,
      });
      this.logger.info('[Inscripciones] Bimestres abiertos por gestión en activación', {
        enrollmentId: enrollment.id,
      });
    }

    return subjectEnrollments;
  }

  /**
   * Crea registros en historial_previo (materias concluidas al inscribir).
   * @private
   * @param {Object} enrollment - Inscripción creada
   * @param {Array|null} priorHistory - [{ materiaId, periodId, finalGrade, status }]
   * @param {Object} managementPlan - Plan habilitado (para resolver plan de estudios)
   */
  async _createPriorEnrollmentHistory(enrollment, priorHistory, managementPlan) {
    if (
      !this.priorEnrollmentHistoryRepository ||
      !Array.isArray(priorHistory) ||
      priorHistory.length === 0
    ) {
      return [];
    }

    const planPlain = managementPlan?.toPlainObject ? managementPlan.toPlainObject() : managementPlan;
    const studyPlanId = planPlain?.studyPlanId ?? planPlain?.planEstudioId;
    if (!studyPlanId) {
      throw new ValidationError(
        'No se pudo resolver el plan de estudios para registrar el historial previo'
      );
    }

    const created = [];
    const enrollmentId = enrollment.id;

    for (const item of priorHistory) {
      const { materiaId, periodId, finalGrade, status } = parsePriorHistoryItem(item);

      const planSubjectsResult = await this.planSubjectRepository.findAll(
        { studyPlanId, periodId, subjectId: materiaId },
        null,
        null
      );
      const planSubjects = planSubjectsResult?.planSubjects ?? [];
      if (!planSubjects.length) {
        throw new ValidationError(
          `No se encontró asignatura de plan para materia ${materiaId} en periodo ${periodId}`
        );
      }

      const planSubject = planSubjects[0];
      const planSubjectPlain = planSubject.toPlainObject ? planSubject.toPlainObject() : planSubject;
      const curriculumSubjectId = planSubjectPlain.id;

      const record = await this.priorEnrollmentHistoryRepository.create({
        enrollmentId,
        curriculumSubjectId,
        finalGrade,
        status,
      });
      created.push(record);

      this.logger.info('[Inscripciones] Historial previo registrado', {
        enrollmentId,
        curriculumSubjectId,
        materiaId,
        periodId,
        finalGrade,
        status,
      });
    }

    return created;
  }

  /**
   * Construye la respuesta final del caso de uso
   * @private
   * @param {Object} enrollment - Entidad Enrollment
   * @param {Array} subjectEnrollments - Array de entidades EnrollmentSubject
   * @param {number} studentId - ID del estudiante
   * @param {number} parallelId - ID del paralelo
   * @param {Object} management - Entidad Management
   * @param {Array} [priorEnrollmentHistories] - Filas de historial_previo creadas
   * @returns {Object} Respuesta formateada
   */
  _buildResponse(
    enrollment,
    subjectEnrollments,
    studentId,
    parallelId,
    management,
    priorEnrollmentHistories = []
  ) {
    const result = {
      enrollment: enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment,
      subjectEnrollments: subjectEnrollments.map((es) =>
        es.toPlainObject ? es.toPlainObject() : es
      ),
      priorEnrollmentHistories: priorEnrollmentHistories.map((h) =>
        h.toPlainObject ? h.toPlainObject() : h
      ),
    };

    this.logger.info('[Inscripciones] Inscripción creada exitosamente', {
      enrollmentId: enrollment.id,
      subjectEnrollmentsCount: subjectEnrollments.length,
      studentId,
      parallelId,
      managementId: management.id,
    });

    return result;
  }
}
