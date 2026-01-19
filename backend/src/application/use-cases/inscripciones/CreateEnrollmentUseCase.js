import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { PDFGenerator } from '../../../infrastructure/external/pdf/PDFGenerator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { serverConfig } from '../../../infrastructure/config/server.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
   * @param {Object} params.careerRepository - Repositorio de carreras
   * @param {Object} params.studentDocumentRepository - Repositorio de documentos de estudiantes
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {Object} params.civilStatusRepository - Repositorio de estados civiles
   * @param {Object} params.municipalityRepository - Repositorio de municipios
   * @param {Object} params.provinceRepository - Repositorio de provincias
   * @param {Object} params.departmentRepository - Repositorio de departamentos
   * @param {Object} params.languageRepository - Repositorio de idiomas
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

      // 9. Generar formulario de inscripción (PDF)
      let formularioDocument = null;
      try {
        formularioDocument = await this._generateFormularioInscripcion(
          student,
          studentAcademicData,
          parallel,
          management,
          studyPlan
        );
      } catch (error) {
        // No fallar la inscripción si falla la generación del formulario
        this.logger.error('[Inscripciones] Error al generar formulario de inscripción', {
          error: error.message,
          stack: error.stack,
          studentId,
          enrollmentId: enrollment.id,
        });
      }

      // 10. Construir y retornar respuesta
      return this._buildResponse(enrollment, enrollmentSubjects, studentId, parallelId, management, formularioDocument);

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
    const gestionActualConfig = await this.configuracionSistemaRepository.findBy(
      { key: 'gestion_actual' }
    );

    if (!gestionActualConfig) {
      throw new NotFoundError('Configuración de gestión actual');
    }

    // La configuración almacena el año académico, no el ID
    const gestionAnio = parseInt(gestionActualConfig.value, 10);
    if (isNaN(gestionAnio)) {
      throw new ValidationError('La gestión actual configurada no es un año válido');
    }

    // Buscar la gestión vigente por año usando findBy
    // Filtrar directamente por año y vigente: true en la consulta
    const management = await this.managementRepository.findBy(
      { year: gestionAnio, vigente: true }
    );

    // Validar que se encontró la gestión vigente
    if (!management) {
      throw new NotFoundError(`No se encontró una gestión vigente para el año ${gestionAnio}`);
    }

    this.logger.info('[Inscripciones] Gestión actual obtenida', {
      managementId: management.id,
      code: management.code,
      year: management.year,
      vigente: management.vigente,
    });

    return management;
  }

  /**
   * Obtiene o crea los datos académicos del estudiante
   * Si el estudiante ya tiene datos académicos pero la carrera no coincide con el paralelo,
   * verifica si tiene inscripciones previas. Si no tiene inscripciones, actualiza la carrera.
   * @private
   * @param {number} studentId - ID del estudiante
   * @param {Object} parallel - Entidad Parallel
   * @param {Object} management - Entidad Management
   * @returns {Promise<Object>} Entidad StudentAcademicData
   * @throws {ValidationError} Si el paralelo no pertenece a la carrera del estudiante y tiene inscripciones previas
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
      
      // Si la carrera no coincide con el paralelo, verificar si tiene inscripciones previas
      if (parallel.careerId !== studentAcademicData.careerId) {
        // Verificar si tiene inscripciones previas en esta gestión
        const existingEnrollmentsResult = await this.enrollmentRepository.findAll(
          { studentAcademicDataId: studentAcademicData.id },
          null,
          null
        );
        
        const existingEnrollments = existingEnrollmentsResult.enrollments || [];
        const hasEnrollmentsInCurrentManagement = existingEnrollments.some(enrollment => {
          const enrollmentPlain = enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment;
          return enrollmentPlain.managementId === management.id;
        });

        if (hasEnrollmentsInCurrentManagement) {
          // Tiene inscripciones previas, no se puede cambiar la carrera
          throw new ValidationError(
            `El paralelo no pertenece a la carrera del estudiante. Paralelo: carrera ${parallel.careerId}, Estudiante: carrera ${studentAcademicData.careerId}. El estudiante ya tiene inscripciones en esta gestión.`
          );
        } else {
          // No tiene inscripciones previas en esta gestión, actualizar la carrera
          this.logger.info('[Inscripciones] Actualizando carrera del estudiante', {
            studentId,
            oldCareerId: studentAcademicData.careerId,
            newCareerId: parallel.careerId,
            managementId: management.id,
          });

          const updatedData = {
            careerId: parallel.careerId,
            managementId: management.id, // Actualizar gestión de ingreso si es necesario
          };

          studentAcademicData = await this.studentAcademicDataRepository.update(
            studentAcademicData.id,
            updatedData
          );

          this.logger.info('[Inscripciones] Carrera del estudiante actualizada', {
            studentAcademicDataId: studentAcademicData.id,
            newCareerId: studentAcademicData.careerId,
          });
        }
      } else {
        this.logger.info('[Inscripciones] Datos académicos obtenidos', {
          studentAcademicDataId: studentAcademicData.id,
          careerId: studentAcademicData.careerId,
          studentId: studentAcademicData.studentId,
        });
      }
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
   * Genera el formulario de inscripción en PDF
   * @private
   * @param {Object} student - Entidad Student
   * @param {Object} studentAcademicData - Entidad StudentAcademicData
   * @param {Object} parallel - Entidad Parallel
   * @param {Object} management - Entidad Management
   * @param {Object} studyPlan - Entidad StudyPlan
   * @returns {Promise<Object|null>} Documento guardado o null si falla
   */
  async _generateFormularioInscripcion(student, studentAcademicData, parallel, management, studyPlan) {
    try {
      // 1. Obtener carrera
      const career = await this.careerRepository.findById(studentAcademicData.careerId);
      if (!career) {
        throw new NotFoundError(`Carrera con ID ${studentAcademicData.careerId}`);
      }

      // 2. Obtener estudiante completo con todos los campos necesarios
      const studentComplete = await this.studentRepository.findById(student.id);
      const studentPlain = studentComplete.toPlainObject ? studentComplete.toPlainObject() : studentComplete;
      const careerPlain = career.toPlainObject ? career.toPlainObject() : career;
      const managementPlain = management.toPlainObject ? management.toPlainObject() : management;

      // 3. Obtener datos de catálogos para nombres descriptivos
      // 3.1. Estado civil
      let estadoCivilNombre = '';
      if (studentPlain.estadoCivilId) {
        try {
          const estadoCivil = await this.civilStatusRepository.findById(studentPlain.estadoCivilId);
          estadoCivilNombre = estadoCivil?.toPlainObject ? estadoCivil.toPlainObject().nombre : (estadoCivil?.nombre || '');
        } catch (err) {
          this.logger.warn('[Inscripciones] Error al obtener estado civil', {
            studentId: student.id,
            estadoCivilId: studentPlain.estadoCivilId,
            error: err.message,
          });
        }
      }

      // 3.2. Municipio de residencia (y su provincia y departamento)
      let municipioNombre = '';
      let provinciaNombre = '';
      let departamentoNombre = '';
      if (studentPlain.municipioResidenciaId) {
        try {
          const municipio = await this.municipalityRepository.findById(studentPlain.municipioResidenciaId);
          if (municipio) {
            const municipioPlain = municipio.toPlainObject ? municipio.toPlainObject() : municipio;
            municipioNombre = municipioPlain.nombre || '';
            
            if (municipioPlain.provinciaId) {
              const provincia = await this.provinceRepository.findById(municipioPlain.provinciaId);
              if (provincia) {
                const provinciaPlain = provincia.toPlainObject ? provincia.toPlainObject() : provincia;
                provinciaNombre = provinciaPlain.nombre || '';
                
                if (provinciaPlain.departamentoId) {
                  const departamento = await this.departmentRepository.findById(provinciaPlain.departamentoId);
                  if (departamento) {
                    const departamentoPlain = departamento.toPlainObject ? departamento.toPlainObject() : departamento;
                    departamentoNombre = departamentoPlain.nombre || '';
                  }
                }
              }
            }
          }
        } catch (err) {
          this.logger.warn('[Inscripciones] Error al obtener datos geográficos de residencia', {
            studentId: student.id,
            municipioResidenciaId: studentPlain.municipioResidenciaId,
            error: err.message,
          });
        }
      }

      // 3.3. Idioma materno
      // NOTA: El idioma materno no está directamente en la tabla estudiantes,
      // está en estudiantes_origenes. Por ahora, dejamos vacío o intentamos obtenerlo de otra forma
      // TODO: Si se necesita el idioma materno, se debe obtener de estudiantes_origenes
      let idiomaMaternoNombre = '';
      // Por ahora, si hay un campo directo, lo usamos
      const idiomaMaterno = studentPlain.nativeLanguageId || studentPlain.idiomaMaterno;
      if (idiomaMaterno) {
        // Si es un número, es un ID de idioma
        const idiomaId = parseInt(idiomaMaterno, 10);
        if (!isNaN(idiomaId)) {
          try {
            const idioma = await this.languageRepository.findById(idiomaId);
            if (idioma) {
              const idiomaPlain = idioma.toPlainObject ? idioma.toPlainObject() : idioma;
              idiomaMaternoNombre = idiomaPlain.nombre || '';
            }
          } catch (err) {
            this.logger.warn('[Inscripciones] Error al obtener idioma materno', {
              studentId: student.id,
              idiomaMaterno,
              error: err.message,
            });
          }
        } else {
          // Si no es un número, es un string directo
          idiomaMaternoNombre = idiomaMaterno;
        }
      }

      // 4. Obtener documentos entregados del estudiante
      const documentDeliveriesResult = await this.studentDocumentDeliveryRepository.findAll(
        { studentId: student.id },
        null,
        null
      );
      const documentDeliveries = documentDeliveriesResult.studentDocumentDeliveries || [];

      // 4.1. Verificar aporte voluntario desde documentos_estudiante
      // El aporte voluntario se registra como un documento con tipoDocumento: 'PAGO'
      const studentDocumentsResult = await this.studentDocumentRepository.findAll(
        { 
          studentId: student.id,
          tipoDocumento: 'PAGO' // Solo documentos de pago
        },
        null,
        null
      );
      const paymentDocuments = studentDocumentsResult.studentDocuments || [];
      const tieneAporteVoluntario = paymentDocuments.length > 0;

      // Mapear documentos entregados por documentacionId
      // Los IDs comunes son: 1=Diploma Bachiller, 2=Cert.Nacimiento, 3=CI, 4=Foto 3x3, 5=Folder nepaco
      const documentosEntregados = {
        ci: false,
        certificadoNacimiento: false,
        diplomaBachiller: false,
        aporteVoluntario: tieneAporteVoluntario, // Verificado desde documentos_estudiante
      };

      documentDeliveries.forEach((delivery) => {
        const deliveryPlain = delivery.toPlainObject ? delivery.toPlainObject() : delivery;
        if (deliveryPlain.entregado) {
          const docId = deliveryPlain.documentacionId;
          // Mapear según los IDs conocidos
          if (docId === 3) documentosEntregados.ci = true;
          if (docId === 2) documentosEntregados.certificadoNacimiento = true;
          if (docId === 1) documentosEntregados.diplomaBachiller = true;
        }
      });

      // 5. Calcular edad
      let edad = '';
      const fechaNacimiento = studentPlain.birthDate || studentPlain.fechaNacimiento;
      if (fechaNacimiento) {
        const fechaNac = new Date(fechaNacimiento);
        const hoy = new Date();
        edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
          edad--;
        }
      }

      // 6. Formatear fecha de nacimiento
      let fechaNacFormateada = '';
      if (fechaNacimiento) {
        const fechaNac = new Date(fechaNacimiento);
        const dia = String(fechaNac.getDate()).padStart(2, '0');
        const mes = String(fechaNac.getMonth() + 1).padStart(2, '0');
        const anio = fechaNac.getFullYear();
        fechaNacFormateada = `${dia}/${mes}/${anio}`;
      }

      // 7. Formatear género
      let generoTexto = '';
      const genero = studentPlain.gender || studentPlain.genero;
      if (genero === 'M' || genero === 'MASCULINO') generoTexto = 'Masculino';
      else if (genero === 'F' || genero === 'FEMENINO') generoTexto = 'Femenino';

      // 8. Preparar datos para PDF
      // NOTA: El mapper convierte los nombres de BD (snake_case español) a dominio (camelCase inglés)
      // Por lo tanto, usamos los nombres del dominio (firstName, lastName, etc.)
      const pdfData = {
        gestionYear: managementPlain.year || managementPlain.anio,
        apellidoPaterno: studentPlain.lastName || studentPlain.apellidoPaterno || '',
        apellidoMaterno: studentPlain.motherLastName || studentPlain.apellidoMaterno || '',
        nombres: studentPlain.firstName || studentPlain.nombres || '',
        ci: studentPlain.ci || '',
        expedicion: studentPlain.expedition || studentPlain.expedicion || 'S.C.',
        genero: generoTexto,
        tipoSangre: studentPlain.bloodType || studentPlain.tipoSangre || '',
        emailPersonal: studentPlain.personalEmail || studentPlain.emailPersonal || '',
        estadoCivil: estadoCivilNombre,
        tieneDiscapacidad: studentPlain.hasDisability !== undefined ? studentPlain.hasDisability : (studentPlain.tieneDiscapacidad || false),
        ciudadNacimiento: municipioNombre, // Usar el nombre del municipio de residencia como ciudad de nacimiento
        provincia: provinciaNombre,
        departamento: departamentoNombre,
        fechaNacimiento: fechaNacFormateada,
        nacionalidad: 'Boliviana',
        edad: String(edad),
        direccion: studentPlain.address || studentPlain.direccion || '',
        idiomaMaterno: idiomaMaternoNombre,
        celular: studentPlain.mobilePhone || studentPlain.celular || '',
        carrera: careerPlain.name || careerPlain.nombre || '',
        anio: parallel.name || '', // Nombre del paralelo (ej: "Primer Año")
        documentos: documentosEntregados,
      };

      // 4. Construir rutas del archivo
      const uploadDir = serverConfig.uploadsPath || 'uploads';
      const relativePath = path.join('documentos', 'estudiantes', String(student.id));
      const fileName = `FORMULARIO_INSCRIPCION_${student.id}_${Date.now()}.pdf`;
      
      // Ruta absoluta (para guardar en disco)
      const absoluteUploadPath = path.isAbsolute(uploadDir)
        ? path.join(uploadDir, relativePath, fileName)
        : path.resolve(__dirname, '../../../..', uploadDir, relativePath, fileName);

      // 5. Generar PDF
      this.logger.info('[Inscripciones] Generando PDF del formulario de inscripción', {
        studentId: student.id,
        absolutePath: absoluteUploadPath,
      });

      await PDFGenerator.generateFormularioInscripcion(pdfData, absoluteUploadPath);

      this.logger.info('[Inscripciones] PDF del formulario generado exitosamente', {
        studentId: student.id,
        fileName,
        absolutePath: absoluteUploadPath,
      });

      // 6. Guardar el PDF como documento en documentos_estudiante
      const relativeFilePath = path.join(relativePath, fileName).replace(/\\/g, '/');
      const ext = path.extname(fileName).replace('.', '');
      
      const documentData = {
        studentId: student.id,
        tipoDocumento: 'INSCRIPCION',
        documentacionId: null,
        fileName: fileName,
        filePath: relativeFilePath,
        extension: ext,
        tipoMime: 'application/pdf',
        contieneMultipleDocumentos: false,
        verified: false,
        state: 'PENDIENTE',
      };

      const savedDocument = await this.studentDocumentRepository.create(documentData);
      this.logger.info('[Inscripciones] Documento de formulario guardado', {
        studentId: student.id,
        documentId: savedDocument.id,
        fileName,
      });

      // 7. Crear registro en estudiantes_documentos_entrega
      const fechaActual = new Date().toISOString().split('T')[0];
      const deliveryData = {
        studentId: student.id,
        documentacionId: null,
        entregado: true,
        enTramite: false,
        esOriginal: false,
        fechaEntrega: fechaActual,
        fechaVencimientoTramite: null,
        observaciones: `Formulario de inscripción generado automáticamente para la gestión ${managementPlain.year || managementPlain.anio}.`,
      };

      const savedDocumentDelivery = await this.studentDocumentDeliveryRepository.create(deliveryData);
      this.logger.info('[Inscripciones] Registro de entrega de formulario creado', {
        studentId: student.id,
        documentId: savedDocument.id,
        deliveryId: savedDocumentDelivery.id,
      });

      return {
        document: savedDocument.toPlainObject ? savedDocument.toPlainObject() : savedDocument,
        documentDelivery: savedDocumentDelivery.toPlainObject ? savedDocumentDelivery.toPlainObject() : savedDocumentDelivery,
        filePath: `/${uploadDir}/${relativeFilePath}`.replace(/\\/g, '/'),
        fileName,
        absolutePath: absoluteUploadPath,
      };
    } catch (error) {
      this.logger.error('[Inscripciones] Error al generar formulario de inscripción', {
        error: error.message,
        stack: error.stack,
        studentId: student.id,
      });
      return null;
    }
  }

  /**
   * Construye la respuesta final del caso de uso
   * @private
   * @param {Object} enrollment - Entidad Enrollment
   * @param {Array} enrollmentSubjects - Array de entidades EnrollmentSubject
   * @param {number} studentId - ID del estudiante
   * @param {number} parallelId - ID del paralelo
   * @param {Object} management - Entidad Management
   * @param {Object|null} formularioDocument - Documento del formulario generado
   * @returns {Object} Respuesta formateada
   */
  _buildResponse(enrollment, enrollmentSubjects, studentId, parallelId, management, formularioDocument) {
    const result = {
      enrollment: enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment,
      enrollmentSubjects: enrollmentSubjects.map((es) =>
        es.toPlainObject ? es.toPlainObject() : es
      ),
    };

    if (formularioDocument) {
      result.formularioInscripcion = formularioDocument;
    }

    this.logger.info('[Inscripciones] Inscripción creada exitosamente', {
      enrollmentId: enrollment.id,
      enrollmentSubjectsCount: enrollmentSubjects.length,
      studentId,
      parallelId,
      managementId: management.id,
      hasFormulario: !!formularioDocument,
    });

    return result;
  }
}
