/**
 * Use Case: GetEnrollmentByIdUseCase
 * Módulo: Inscripciones
 * Obtiene una inscripción por ID con todos sus datos relacionados
 *
 * Responsabilidades:
 * - Validar que la inscripción exista
 * - Obtener la inscripción principal
 * - Obtener materias inscritas (múltiples)
 * - Obtener datos relacionados (estudiante, gestión, etc.)
 * - Retornar la inscripción con todos sus datos relacionados
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la obtención completa de inscripciones
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 * - Usa Mapper (Application) para conversión Domain → Presentation
 */

import { NotFoundError } from '../../../domain/errors/AppError.js';
import { derivarCarreraPlanDesdeMatriculas } from './enrollmentBusinessRules.js';
import { EnrollmentMapper, PriorEnrollmentHistoryMapper } from '../../mappers/inscripciones/index.js';
import { TIPOS_INSCRIPCION } from '../../../domain/constants/inscripciones.constants.js';
import { StudentAcademicDataMapper, StudentMapper } from '../../mappers/estudiantes/index.js';
import { ManagementMapper } from '../../mappers/academico/index.js';
import { CareerMapper } from '../../mappers/configuracion/index.js';
import { serverConfig } from '../../../infrastructure/config/server.config.js';

export class GetEnrollmentByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} params.subjectEnrollmentRepository - Repositorio de materias inscritas
   * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.careerRepository - Repositorio de carreras
   * @param {Object} params.studyPlanRepository - Repositorio de planes de estudio
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {Object} params.teacherAssignmentRepository - Repositorio de asignaciones docentes
   * @param {Object} params.courseOfferRepository - Repositorio de oferta de cursos
   * @param {Object} params.parallelManagementRepository - Repositorio de paralelos en gestión
   * @param {Object} params.planSubjectRepository - Repositorio de asignaturas de plan
   * @param {Object} params.subjectRepository - Repositorio de materias
   * @param {Object} params.scheduleRepository - Repositorio de horarios
   * @param {Object} params.classroomRepository - Repositorio de aulas
   * @param {Object} params.teacherRepository - Repositorio de docentes
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    enrollmentRepository,
    subjectEnrollmentRepository,
    studentAcademicDataRepository,
    studentRepository,
    careerRepository,
    studyPlanRepository,
    managementRepository,
    teacherAssignmentRepository,
    courseOfferRepository,
    parallelManagementRepository,
    planSubjectRepository,
    subjectRepository,
    scheduleRepository,
    asignacionHorarioRepository,
    classroomRepository,
    teacherRepository,
    parallelRepository,
    studentDocumentRepository,
    priorEnrollmentHistoryRepository,
    periodRepository,
    logger,
  }) {
    this.enrollmentRepository = enrollmentRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.studentRepository = studentRepository;
    this.careerRepository = careerRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.managementRepository = managementRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.subjectRepository = subjectRepository;
    this.scheduleRepository = scheduleRepository;
    this.asignacionHorarioRepository = asignacionHorarioRepository;
    this.classroomRepository = classroomRepository;
    this.teacherRepository = teacherRepository;
    this.parallelRepository = parallelRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.priorEnrollmentHistoryRepository = priorEnrollmentHistoryRepository;
    this.periodRepository = periodRepository;
    this.logger = logger;
  }

  /**
   * Método interno para obtener una inscripción por ID
   * Valida que la inscripción exista y lanza NotFoundError si no se encuentra
   * Solo recupera los campos necesarios: id, academicDataId, managementId, enrollmentType
   *
   * @private
   * @param {number} enrollmentId - ID de la inscripción a obtener
   * @returns {Promise<Object>} Inscripción encontrada con solo los campos especificados
   * @throws {NotFoundError} Si la inscripción no existe
   */
  async _getEnrollmentById(enrollmentId) {
    // Obtener solo los campos necesarios usando los nombres del modelo Sequelize
    const enrollment = await this.enrollmentRepository.findById(enrollmentId, {
      attributes: ['id', 'datosAcademicosId', 'gestionId', 'tipoInscripcion'],
    });

    // Si se proporciona ID pero no se encuentra, lanzar NotFoundError (inconsistencia de datos)
    if (!enrollment) {
      throw new NotFoundError(
        `Inscripción con ID ${enrollmentId}`,
      );
    }

    return enrollment;
  }

  /**
   * Método interno para obtener datos académicos del estudiante por ID
   * Valida que existan si se proporciona un ID, retorna null si no se proporciona ID (opcional)
   * Solo recupera los campos necesarios: estudianteId, carreraId, estadoRegistro
   *
   * @private
   * @param {number|null|undefined} academicDataId - ID de los datos académicos del estudiante
   * @returns {Promise<Object|null>} Datos académicos encontrados o null si no se proporciona ID
   * @throws {NotFoundError} Si se proporciona ID pero no se encuentra el registro
   */
  async _getStudentAcademicDataById(academicDataId) {
    // Si no se proporciona ID, retornar null (es opcional)
    if (!academicDataId) {
      return null;
    }

    // Obtener solo los campos necesarios usando los nombres del modelo Sequelize
    const studentAcademicData = await this.studentAcademicDataRepository.findById(
      academicDataId,
      {
        attributes: ['id', 'estudianteId', 'carreraId', 'estadoRegistro'],
      }
    );

    // Si se proporciona ID pero no se encuentra, lanzar NotFoundError (inconsistencia de datos)
    if (!studentAcademicData) {
      throw new NotFoundError(
        `Datos académicos con ID ${academicDataId}`,
      );
    }

    return studentAcademicData;
  }

  /**
   * Método interno para obtener gestión académica por ID
   * Valida que exista si se proporciona un ID, retorna null si no se proporciona ID (opcional)
   * Solo recupera los campos necesarios: nombre, anio
   *
   * @private
   * @param {number|null|undefined} managementId - ID de la gestión académica
   * @returns {Promise<Object|null>} Gestión encontrada o null si no se proporciona ID
   * @throws {NotFoundError} Si se proporciona ID pero no se encuentra el registro
   */
  async _getManagementById(managementId) {
    // Si no se proporciona ID, retornar null (es opcional)
    if (!managementId) {
      return null;
    }

    // Obtener solo los campos necesarios usando los nombres del modelo Sequelize
    const management = await this.managementRepository.findById(managementId, {
      attributes: ['id', 'nombre', 'anio'],
    });

    // Si se proporciona ID pero no se encuentra, lanzar NotFoundError (inconsistencia de datos)
    if (!management) {
      throw new NotFoundError(
        `Gestión con ID ${managementId}`,
      );
    }

    return management;
  }

  /**
   * Método interno para obtener estudiante por ID
   * Valida que exista si se proporciona un ID, retorna null si no se proporciona ID (opcional)
   * Solo recupera los campos necesarios: codigoEstudiante, nombres, apellidoPaterno, apellidoMaterno, ci, expedicion
   *
   * @private
   * @param {number|null|undefined} studentId - ID del estudiante
   * @returns {Promise<Object|null>} Estudiante encontrado o null si no se proporciona ID
   * @throws {NotFoundError} Si se proporciona ID pero no se encuentra el registro
   */
  async _getStudentById(studentId) {
    // Si no se proporciona ID, retornar null (es opcional)
    if (!studentId) {
      return null;
    }

    // Obtener solo los campos necesarios usando los nombres del modelo Sequelize
    const student = await this.studentRepository.findById(studentId, {
      attributes: ['id', 'codigoEstudiante', 'nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'expedicion', 'genero', 'celular'],
    });

    // Si se proporciona ID pero no se encuentra, lanzar NotFoundError (inconsistencia de datos)
    if (!student) {
      throw new NotFoundError(
        `Estudiante con ID ${studentId}`,
      );
    }

    return student;
  }

  /**
   * Método interno para obtener carrera por ID
   * Valida que exista si se proporciona un ID, retorna null si no se proporciona ID (opcional)
   * Solo recupera los campos necesarios: codigo, nombre
   *
   * @private
   * @param {number|null|undefined} careerId - ID de la carrera
   * @returns {Promise<Object|null>} Carrera encontrada o null si no se proporciona ID
   * @throws {NotFoundError} Si se proporciona ID pero no se encuentra el registro
   */
  async _getCareerById(careerId) {
    // Si no se proporciona ID, retornar null (es opcional)
    if (!careerId) {
      return null;
    }

    // Obtener solo los campos necesarios usando los nombres del modelo Sequelize
    const career = await this.careerRepository.findById(careerId, {
      attributes: ['id', 'codigo', 'nombre', 'tituloOtorgado'],
    });

    // Si se proporciona ID pero no se encuentra, lanzar NotFoundError (inconsistencia de datos)
    if (!career) {
      throw new NotFoundError(
        `Carrera con ID ${careerId}`,
      );
    }

    return career;
  }

  /**
   * Ejecuta el caso de uso de obtención de inscripción por ID
   *
   * Sigue el patrón de BaseListUseCase y BaseSearchUseCase:
   * - Logging inicial
   * - Try-catch para manejo de errores
   * - Logging de éxito/error
   * - Conversión a formato de presentación usando mapper
   *
   * NOTA: Desarrollo incremental - Los comentarios representan funcionalidad futura
   * que se implementará por pasos. El método _getEnrollmentById es el paso actual.
   *
   * @param {number} enrollmentId - ID de la inscripción a obtener
   * @returns {Promise<Object>} Inscripción encontrada en formato de presentación
   * @throws {NotFoundError} Si la inscripción no existe
   */
  async execute(enrollmentId) {
    // Logging inicial
    this.logger.info('[Inscripciones] Iniciando obtención de inscripción por ID', {
      enrollmentId,
    });

    try {
      // 1. Obtener la inscripción usando el método interno
      const enrollment = await this._getEnrollmentById(enrollmentId);

      // 2. Obtener datos académicos del estudiante (usando la entidad enrollment)
      const studentAcademicData = await this._getStudentAcademicDataById(
        enrollment.academicDataId
      );

      // 3. Obtener gestión académica (usando la entidad enrollment)
      const management = await this._getManagementById(
        enrollment.managementId
      );

      // 4. Obtener estudiante (usando la entidad studentAcademicData)
      const student = await this._getStudentById(
        studentAcademicData?.studentId
      );

      // 5. Obtener carrera (usando la entidad studentAcademicData)
      let career = await this._getCareerById(
        studentAcademicData?.careerId
      );

      // 6. Obtener materias inscritas (múltiples)
      const subjectEnrollmentsResult = await this.subjectEnrollmentRepository.findAll(
        { enrollmentId: enrollment.id },
        null,
        null
      );
      const subjectEnrollments = subjectEnrollmentsResult.subjectEnrollments || [];

      this.logger.info('[Inscripciones] Materias inscritas encontradas', {
        enrollmentId: enrollment.id,
        count: subjectEnrollments.length,
      });

      // 7. Para cada materia inscrita, obtener datos relacionados (teacherAssignment, course, planSubject, subject, horarios)
      const materiasConDetalles = await Promise.all(
        subjectEnrollments.map(async (enrollmentSubject) => {
          try {
            const enrollmentSubjectPlain = enrollmentSubject?.toPlainObject
              ? enrollmentSubject.toPlainObject()
              : enrollmentSubject;

            let teacherAssignment = null;
            let teacher = null;
            const course = null;
            let planSubject = null;
            let subject = null;
            let horarios = [];

            let parallelIdFromOffer = null;

            const offerCourseId = enrollmentSubjectPlain.offerCourseId;
            if (offerCourseId) {
              try {
                const offerEntity = await this.courseOfferRepository.findById(offerCourseId);
                const offer = offerEntity?.toPlainObject
                  ? offerEntity.toPlainObject()
                  : offerEntity;

                const curriculumSubjectId =
                  enrollmentSubjectPlain.curriculumSubjectId ?? offer?.planSubjectId;
                if (curriculumSubjectId) {
                  planSubject = await this.planSubjectRepository.findById(curriculumSubjectId);
                  planSubject = planSubject?.toPlainObject
                    ? planSubject.toPlainObject()
                    : planSubject;

                  if (planSubject?.subjectId) {
                    subject = await this.subjectRepository.findById(planSubject.subjectId);
                    subject = subject?.toPlainObject ? subject.toPlainObject() : subject;
                  }
                }

                const parallelManagementId = offer?.parallelManagementId ?? offer?.paraleloGestionId;
                if (parallelManagementId) {
                  const pgEntity = await this.parallelManagementRepository.findById(parallelManagementId);
                  const pg = pgEntity?.toPlainObject ? pgEntity.toPlainObject() : pgEntity;
                  parallelIdFromOffer = pg?.parallelId ?? pg?.paraleloId ?? null;
                }

                // Bloques de horario armados para la oferta (vista de presentación).
                // Forma esperada por el frontend (useMatriculaDetailSchedules):
                // cada item con dia/horaInicio/horaFin + aula{codigo,nombre} + ordenSecuencia.
                try {
                  const bloques =
                    (await this.asignacionHorarioRepository?.findBloquesByOfertaCursoIdForPresentation(
                      offerCourseId,
                    )) || [];
                  horarios = bloques.map((b) => ({
                    id: b.id,
                    ordenSecuencia: b.ordenSecuencia ?? null,
                    dia: b.dia,
                    horaInicio: b.horaInicio,
                    horaFin: b.horaFin,
                    turno: b.turno ?? null,
                    numeroBloque: b.numeroBloque ?? null,
                    aula:
                      b.aulaCodigo || b.aulaNombre
                        ? { codigo: b.aulaCodigo ?? null, nombre: b.aulaNombre ?? null }
                        : null,
                  }));
                } catch (errHor) {
                  this.logger.warn('[Inscripciones] Error al obtener bloques de horario', {
                    offerCourseId,
                    error: errHor.message,
                  });
                }

                const assignmentsResult = await this.teacherAssignmentRepository.findAll(
                  { offerCourseId, active: true },
                  1,
                  null
                );
                const assignList = assignmentsResult.teacherAssignments || [];
                if (assignList.length > 0) {
                  teacherAssignment = assignList[0]?.toPlainObject
                    ? assignList[0].toPlainObject()
                    : assignList[0];

                  if (teacherAssignment?.teacherId) {
                    teacher = await this.teacherRepository.findById(teacherAssignment.teacherId, {
                      attributes: [
                        'id',
                        'nombres',
                        'apellidoPaterno',
                        'apellidoMaterno',
                        'ci',
                        'expedicion',
                        'telefono',
                        'celular',
                        'emailPersonal',
                        'colorHex',
                      ],
                    });
                    teacher = teacher?.toPlainObject ? teacher.toPlainObject() : teacher;
                  }
                }
              } catch (err) {
                this.logger.warn('[Inscripciones] Error al resolver oferta de curso', {
                  enrollmentSubjectId: enrollmentSubjectPlain.id,
                  offerCourseId,
                  error: err.message,
                });
              }
            } else if (enrollmentSubjectPlain.curriculumSubjectId) {
              try {
                planSubject = await this.planSubjectRepository.findById(
                  enrollmentSubjectPlain.curriculumSubjectId
                );
                planSubject = planSubject?.toPlainObject
                  ? planSubject.toPlainObject()
                  : planSubject;
                if (planSubject?.subjectId) {
                  subject = await this.subjectRepository.findById(planSubject.subjectId);
                  subject = subject?.toPlainObject ? subject.toPlainObject() : subject;
                }
              } catch (err) {
                this.logger.warn('[Inscripciones] Error al obtener asignatura de plan', {
                  enrollmentSubjectId: enrollmentSubjectPlain.id,
                  error: err.message,
                });
              }
            }

            const periodoId = planSubject?.periodId ?? planSubject?.periodoId ?? null;
            const paraleloId = parallelIdFromOffer ?? course?.parallelId ?? course?.paraleloId ?? null;

            let paralelo = null;
            if (paraleloId) {
              try {
                const paraleloRaw = await this.parallelRepository.findById(paraleloId, {
                  attributes: ['id', 'nombre', 'turno'],
                });
                const paraleloPlain = paraleloRaw?.toPlainObject ? paraleloRaw.toPlainObject() : paraleloRaw;
                if (paraleloPlain) {
                  paralelo = {
                    id: paraleloPlain.id,
                    nombre: paraleloPlain.name ?? paraleloPlain.nombre ?? null,
                    turno: paraleloPlain.shift ?? paraleloPlain.turno ?? null,
                  };
                }
              } catch (err) {
                this.logger.warn('[Inscripciones] Error al obtener paralelo', {
                  enrollmentSubjectId: enrollmentSubjectPlain.id,
                  paraleloId,
                  error: err.message,
                });
              }
            }

            return {
              ...enrollmentSubjectPlain,
              materiaId: subject ? subject.id : null,
              materiaNombre: subject ? subject.name : null,
              materiaSigla: subject ? subject.acronym : null,
              // Color del bloque de horario = color propio del docente (docentes.color_hex),
              // misma fuente que la grilla del detalle de docente. Fallback al color del curso.
              color: teacher?.colorHex ?? (course ? course.colorHex : null),
              periodoId,
              paraleloId,
              paralelo,
              docente: teacher
                ? {
                  id: teacher.id,
                  nombres: teacher.firstName,
                  apellidoPaterno: teacher.lastName,
                  apellidoMaterno: teacher.motherLastName || null,
                  nombreCompleto: teacher.firstName && teacher.lastName
                    ? `${teacher.firstName} ${teacher.lastName}${teacher.motherLastName ? ` ${teacher.motherLastName}` : ''}`
                    : null,
                  ci: teacher.ci || null,
                  expedicion: teacher.expedition || null,
                  telefono: teacher.phone || null,
                  celular: teacher.mobilePhone || null,
                  email: teacher.personalEmail || null,
                }
                : null,
              horarios,
            };
          } catch (error) {
            this.logger.warn('[Inscripciones] Error al procesar materia inscrita', {
              enrollmentSubjectId: enrollmentSubject?.id,
              error: error.message,
            });
            return null;
          }
        })
      );

      // Filtrar materias nulas (errores)
      const materiasValidas = materiasConDetalles.filter((m) => m !== null);

      // 7b. Agregar periodos y paralelos por periodo para el formulario de edición (array de IDs de periodos y objeto periodo -> paralelo)
      const byPeriod = {};
      materiasValidas.forEach((item) => {
        const pid = item.periodoId ?? item.periodo_id ?? item.periodId;
        const plid = item.paraleloId ?? item.paralelo_id ?? item.parallelId;
        const mid = item.materiaId ?? item.materia_id ?? item.subjectId;
        if (pid == null || mid == null) return;
        const key = String(pid);
        if (!byPeriod[key]) byPeriod[key] = { materiaIds: [], paraleloId: plid };
        if (!byPeriod[key].materiaIds.includes(Number(mid))) byPeriod[key].materiaIds.push(Number(mid));
        if (plid != null) byPeriod[key].paraleloId = plid;
      });
      const selectedPeriodIds = Object.keys(byPeriod).map((k) => Number(k)).sort((a, b) => a - b);
      const parallelIdsByPeriod = {};
      Object.keys(byPeriod).forEach((key) => {
        if (byPeriod[key].paraleloId != null) parallelIdsByPeriod[key] = Number(byPeriod[key].paraleloId);
      });

      // 7c. Vínculo roto (datos académicos sin carrera): la carrera se deriva de
      // las materias matriculadas (asignatura de plan → plan → carrera) para que
      // el detalle y el modo edición no queden sin contexto de carrera. La fila
      // de datos académicos se repara al guardar (UpdateEnrollmentUseCase), no
      // aquí: un GET no escribe.
      if (!career) {
        const derivado = await derivarCarreraPlanDesdeMatriculas({
          enrollmentId: enrollment.id,
          subjectEnrollmentRepository: this.subjectEnrollmentRepository,
          courseOfferRepository: this.courseOfferRepository,
          planSubjectRepository: this.planSubjectRepository,
          studyPlanRepository: this.studyPlanRepository,
          logger: this.logger,
        });
        if (derivado?.careerId) {
          career = await this._getCareerById(derivado.careerId);
          this.logger.info('[Inscripciones] Carrera derivada desde materias matriculadas (datos académicos sin carrera)', {
            enrollmentId: enrollment.id,
            careerId: derivado.careerId,
            studyPlanId: derivado.studyPlanId,
          });
        }
      }

      // 8. Buscar formulario de inscripción del estudiante
      let formularioInscripcion = null;
      if (student?.id) {
        try {
          const documentosResult = await this.studentDocumentRepository.findAll(
            {
              studentId: student.id,
              tipoDocumento: 'INSCRIPCION',
              includeInactive: true, // Incluir documentos inactivos para no perder formularios ya generados
            },
            null,
            null
          );

          const documentos = documentosResult.studentDocuments || [];

          this.logger.info('[Inscripciones] Documentos encontrados para estudiante', {
            studentId: student.id,
            totalDocumentos: documentos.length,
            documentosConTipoInscripcion: documentos.filter((d) => {
              const docPlain = d.toPlainObject ? d.toPlainObject() : d;
              return docPlain.tipoDocumento === 'INSCRIPCION';
            }).length,
          });

          // Filtrar solo documentos que sean boleta/formulario de inscripción (PDF)
          // Nombres aceptados: BOLETA_INSCRIPCION, FORMULARIO_INSCRIPCION, o formulario_inscripcion_* (GenerateFormularioInscripcionUseCase)
          // Ordenar por fecha de creación descendente para obtener el más reciente
          const formulariosDocs = documentos
            .map((doc) => {
              const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
              return docPlain;
            })
            .filter((doc) => {
              // El documento puede tener fileName (desde entidad) o nombreArchivo (desde modelo Sequelize directo)
              const fileName = doc.fileName || doc.nombreArchivo || '';
              const extension = doc.extension || '';
              const fileNameLower = fileName.toLowerCase();

              // tipoDocumento === 'INSCRIPCION' y nombre de boleta/formulario (varios formatos usados al guardar)
              const isFormularioOrBoleta =
                fileName.includes('BOLETA_INSCRIPCION') ||
                fileName.includes('FORMULARIO_INSCRIPCION') ||
                fileNameLower.includes('formulario_inscripcion');
              const isPdf = extension === 'pdf' || fileNameLower.endsWith('.pdf');
              const matches = doc.tipoDocumento === 'INSCRIPCION' && isFormularioOrBoleta && isPdf;

              if (doc.tipoDocumento === 'INSCRIPCION') {
                this.logger.debug('[Inscripciones] Documento INSCRIPCION encontrado', {
                  fileName,
                  extension,
                  docKeys: Object.keys(doc),
                  matches,
                });
              }

              return matches;
            })
            .sort((a, b) => {
              // Ordenar por fecha de creación descendente (más reciente primero)
              const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
              const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
              return dateB - dateA;
            });

          // Tomar el más reciente
          const formularioDoc = formulariosDocs[0];

          if (formularioDoc) {
            const uploadDir = serverConfig.uploadsPath || 'uploads';
            // El documento puede tener filePath (desde entidad) o rutaArchivo (desde modelo Sequelize directo)
            const filePathRaw = formularioDoc.filePath || formularioDoc.rutaArchivo || '';
            const fileNameRaw = formularioDoc.fileName || formularioDoc.nombreArchivo || 'formulario_inscripcion.pdf';

            // El filePath ya incluye la ruta relativa desde uploads/, solo necesitamos agregar el prefijo
            const filePath = filePathRaw.startsWith('/')
              ? filePathRaw
              : `/${uploadDir}/${filePathRaw}`.replace(/\\/g, '/');

            formularioInscripcion = {
              filePath,
              fileName: fileNameRaw,
            };

            this.logger.info('[Inscripciones] Formulario de inscripción encontrado', {
              fileName: formularioDoc.fileName,
              filePath,
            });
          } else {
            this.logger.warn('[Inscripciones] No se encontró boleta de inscripción', {
              studentId: student.id,
              totalDocumentos: documentos.length,
            });
          }
        } catch (err) {
          this.logger.warn('[Inscripciones] Error al buscar formulario de inscripción', {
            enrollmentId: enrollment.id,
            studentId: student.id,
            error: err.message,
          });
        }
      }

      // 8b. Historial previo (materias concluidas al inscribir)
      const priorEnrollmentHistories = await this._fetchPriorEnrollmentHistoriesPresentation(
        enrollment.id
      );
      const tipoInscripcion =
        enrollment.enrollmentType ?? enrollment.tipoInscripcion ?? null;
      const requiereHistorialPrevio = this._requiereHistorialPrevio(tipoInscripcion);
      const historialPrevioEstado = this._historialPrevioEstado(
        requiereHistorialPrevio,
        priorEnrollmentHistories.length
      );

      // 9. Convertir entidades de dominio a formato de presentación usando mappers
      // Los mappers pueden trabajar directamente con entidades (no necesitan aplanado)
      const enrollmentPresentation = EnrollmentMapper.entityToPresentation(enrollment);
      const studentAcademicDataPresentation = StudentAcademicDataMapper.entityToPresentation(studentAcademicData);
      const managementPresentation = ManagementMapper.entityToPresentation(management);
      const studentPresentation = StudentMapper.entityToPresentation(student);
      const careerPresentation = CareerMapper.entityToPresentation(career);

      // Logging de éxito
      this.logger.info('[Inscripciones] Inscripción obtenida exitosamente', {
        hasEnrollment: !!enrollment,
        hasStudentAcademicData: !!studentAcademicData,
        hasManagement: !!management,
        hasStudent: !!student,
        hasCareer: !!career,
        subjectEnrollmentsCount: materiasValidas.length,
        priorEnrollmentHistoriesCount: priorEnrollmentHistories.length,
      });

      // Retornar todas las entidades en formato de presentación
      const result = {
        enrollment: enrollmentPresentation,
        studentAcademicData: studentAcademicDataPresentation,
        management: managementPresentation,
        student: studentPresentation,
        career: careerPresentation,
        subjectEnrollments: materiasValidas,
        selectedPeriodIds: selectedPeriodIds.length > 0 ? selectedPeriodIds : undefined,
        parallelIdsByPeriod: Object.keys(parallelIdsByPeriod).length > 0 ? parallelIdsByPeriod : undefined,
        materiaIdsByPeriod: Object.keys(byPeriod).length > 0
          ? Object.fromEntries(Object.entries(byPeriod).map(([k, v]) => [k, v.materiaIds]))
          : undefined,
        priorEnrollmentHistories,
        requiereHistorialPrevio,
        cantidadHistorialPrevio: priorEnrollmentHistories.length,
        historialPrevioEstado,
      };

      // Agregar formulario de inscripción si existe
      if (formularioInscripcion) {
        result.formularioInscripcion = formularioInscripcion;
      }

      return result;
    } catch (error) {
      // Manejo de errores
      this.logger.error('[Inscripciones] Error al obtener inscripción por ID', {
        error: error.message,
        stack: error.stack,
        enrollmentId,
      });

      // Re-lanzar el error para que el controlador/middleware lo maneje
      throw error;
    }
  }

  _requiereHistorialPrevio(tipoInscripcion) {
    const t = String(tipoInscripcion ?? '').toUpperCase();
    return [
      TIPOS_INSCRIPCION.ANTIGUO,
      TIPOS_INSCRIPCION.TRASPASO,
      TIPOS_INSCRIPCION.TRANSITABILIDAD,
    ].includes(t);
  }

  _historialPrevioEstado(requiere, cantidad) {
    if (!requiere) return 'NO_APLICA';
    if (cantidad > 0) return 'REGISTRADO';
    return 'PENDIENTE';
  }

  /**
   * @private
   */
  async _fetchPriorEnrollmentHistoriesPresentation(enrollmentId) {
    if (!this.priorEnrollmentHistoryRepository || !enrollmentId) return [];

    const result = await this.priorEnrollmentHistoryRepository.findAll(
      { enrollmentId },
      null,
      null
    );
    const list = result.priorEnrollmentHistories || [];
    const enriched = [];

    for (const row of list) {
      const plain = row.toPlainObject ? row.toPlainObject() : row;
      let materiaId = null;
      let periodId = null;
      let materiaNombre = null;
      let materiaSigla = null;
      let periodName = null;
      let periodNumero = null;

      const asignaturaPlanId = plain.curriculumSubjectId ?? plain.asignaturaPlanId;
      if (asignaturaPlanId && this.planSubjectRepository) {
        try {
          const planSubject = await this.planSubjectRepository.findById(asignaturaPlanId);
          const ps = planSubject?.toPlainObject ? planSubject.toPlainObject() : planSubject;
          if (ps) {
            periodId = ps.periodId ?? ps.periodoId ?? null;
            periodNumero = ps.periodNumber ?? ps.periodoNumero ?? null;
            materiaId = ps.subjectId ?? ps.materiaId ?? null;
            if (materiaId && this.subjectRepository) {
              const subject = await this.subjectRepository.findById(materiaId);
              const sp = subject?.toPlainObject ? subject.toPlainObject() : subject;
              materiaNombre = sp?.name ?? sp?.nombre ?? null;
              materiaSigla = sp?.acronym ?? sp?.sigla ?? null;
            }
            if (periodId && this.periodRepository) {
              try {
                const periodEntity = await this.periodRepository.findById(periodId);
                const periodPlain = periodEntity?.toPlainObject
                  ? periodEntity.toPlainObject()
                  : periodEntity;
                periodName =
                  periodPlain?.name ??
                  periodPlain?.nombre ??
                  `Periodo ${ps.periodNumber ?? ps.periodoNumero ?? periodId}`;
              } catch {
                periodName = `Periodo ${ps.periodNumber ?? ps.periodoNumero ?? periodId}`;
              }
            } else if (periodId) {
              periodName = `Periodo ${ps.periodNumber ?? ps.periodoNumero ?? periodId}`;
            }
          }
        } catch (err) {
          this.logger.warn('[Inscripciones] Error al enriquecer historial previo', {
            asignaturaPlanId,
            error: err.message,
          });
        }
      }

      enriched.push(
        PriorEnrollmentHistoryMapper.entityToPresentation(plain, {
          materiaId,
          periodoId: periodId,
          periodId,
          materiaNombre,
          materiaSigla,
          periodName,
          periodoNombre: periodName,
          periodoNumero: periodNumero,
        })
      );
    }

    return enriched;
  }
}
