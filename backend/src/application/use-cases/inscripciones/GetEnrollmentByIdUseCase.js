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

import { ValidationError } from '../../../domain/errors/AppError.js';
import { EnrollmentMapper } from '../../mappers/inscripciones/index.js';
import { StudentAcademicDataMapper, StudentMapper } from '../../mappers/estudiantes/index.js';
import { ManagementMapper } from '../../mappers/academico/index.js';
import { CareerMapper } from '../../mappers/configuracion/index.js';
import { serverConfig } from '../../../infrastructure/config/server.config.js';

export class GetEnrollmentByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} params.enrollmentSubjectRepository - Repositorio de materias inscritas
   * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.careerRepository - Repositorio de carreras
   * @param {Object} params.studyPlanRepository - Repositorio de planes de estudio
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {Object} params.teacherAssignmentRepository - Repositorio de asignaciones docentes
   * @param {Object} params.courseRepository - Repositorio de cursos
   * @param {Object} params.planSubjectRepository - Repositorio de asignaturas de plan
   * @param {Object} params.subjectRepository - Repositorio de materias
   * @param {Object} params.courseScheduleRepository - Repositorio de horarios de cursos
   * @param {Object} params.scheduleRepository - Repositorio de horarios
   * @param {Object} params.classroomRepository - Repositorio de aulas
   * @param {Object} params.teacherRepository - Repositorio de docentes
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    enrollmentRepository,
    enrollmentSubjectRepository,
    studentAcademicDataRepository,
    studentRepository,
    careerRepository,
    studyPlanRepository,
    managementRepository,
    teacherAssignmentRepository,
    courseRepository,
    planSubjectRepository,
    subjectRepository,
    courseScheduleRepository,
    scheduleRepository,
    classroomRepository,
    teacherRepository,
    studentDocumentRepository,
    logger,
  }) {
    this.enrollmentRepository = enrollmentRepository;
    this.enrollmentSubjectRepository = enrollmentSubjectRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.studentRepository = studentRepository;
    this.careerRepository = careerRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.managementRepository = managementRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.courseRepository = courseRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.subjectRepository = subjectRepository;
    this.courseScheduleRepository = courseScheduleRepository;
    this.scheduleRepository = scheduleRepository;
    this.classroomRepository = classroomRepository;
    this.teacherRepository = teacherRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.logger = logger;
  }

  /**
   * Método interno para obtener una inscripción por ID
   * Valida que la inscripción exista y lanza ValidationError si no se encuentra
   * Solo recupera los campos necesarios: id, studentAcademicDataId, managementId, enrollmentType
   * 
   * @private
   * @param {number} enrollmentId - ID de la inscripción a obtener
   * @returns {Promise<Object>} Inscripción encontrada con solo los campos especificados
   * @throws {ValidationError} Si la inscripción no existe
   */
  async _getEnrollmentById(enrollmentId) {
    // Obtener solo los campos necesarios usando los nombres del modelo Sequelize
    const enrollment = await this.enrollmentRepository.findById(enrollmentId, {
      attributes: ['id', 'estudianteDatosAcademicosId', 'gestionId', 'tipoInscripcion'],
    });

    // Si se proporciona ID pero no se encuentra, lanzar ValidationError (inconsistencia de datos)
    if (!enrollment) {
      throw new ValidationError(
        `No se encontró una inscripción con ID ${enrollmentId}`,
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
   * @param {number|null|undefined} studentAcademicDataId - ID de los datos académicos del estudiante
   * @returns {Promise<Object|null>} Datos académicos encontrados o null si no se proporciona ID
   * @throws {ValidationError} Si se proporciona ID pero no se encuentra el registro
   */
  async _getStudentAcademicDataById(studentAcademicDataId) {
    // Si no se proporciona ID, retornar null (es opcional)
    if (!studentAcademicDataId) {
      return null;
    }

    // Obtener solo los campos necesarios usando los nombres del modelo Sequelize
    const studentAcademicData = await this.studentAcademicDataRepository.findById(
      studentAcademicDataId,
      {
        attributes: ['id', 'estudianteId', 'carreraId', 'estadoRegistro'],
      }
    );

    // Si se proporciona ID pero no se encuentra, lanzar ValidationError (inconsistencia de datos)
    if (!studentAcademicData) {
      throw new ValidationError(
        `No se encontraron datos académicos del estudiante con ID ${studentAcademicDataId}`,
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
   * @throws {ValidationError} Si se proporciona ID pero no se encuentra el registro
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

    // Si se proporciona ID pero no se encuentra, lanzar ValidationError (inconsistencia de datos)
    if (!management) {
      throw new ValidationError(
        `No se encontró una gestión académica con ID ${managementId}`,
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
   * @throws {ValidationError} Si se proporciona ID pero no se encuentra el registro
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

    // Si se proporciona ID pero no se encuentra, lanzar ValidationError (inconsistencia de datos)
    if (!student) {
      throw new ValidationError(
        `No se encontró un estudiante con ID ${studentId}`,
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
   * @throws {ValidationError} Si se proporciona ID pero no se encuentra el registro
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

    // Si se proporciona ID pero no se encuentra, lanzar ValidationError (inconsistencia de datos)
    if (!career) {
      throw new ValidationError(
        `No se encontró una carrera con ID ${careerId}`,
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
   * @throws {ValidationError} Si la inscripción no existe
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
        enrollment.studentAcademicDataId
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
      const career = await this._getCareerById(
        studentAcademicData?.careerId
      );

      // 6. Obtener materias inscritas (múltiples)
      const enrollmentSubjectsResult = await this.enrollmentSubjectRepository.findAll(
        { enrollmentId: enrollment.id },
        null,
        null
      );
      const enrollmentSubjects = enrollmentSubjectsResult.enrollmentSubjects || [];

      this.logger.info('[Inscripciones] Materias inscritas encontradas', {
        enrollmentId: enrollment.id,
        count: enrollmentSubjects.length,
      });

      // 7. Para cada materia inscrita, obtener datos relacionados (teacherAssignment, course, planSubject, subject, horarios)
      const materiasConDetalles = await Promise.all(
        enrollmentSubjects.map(async (enrollmentSubject) => {
          try {
            const enrollmentSubjectPlain = enrollmentSubject?.toPlainObject
              ? enrollmentSubject.toPlainObject()
              : enrollmentSubject;

            let teacherAssignment = null;
            let teacher = null;
            let course = null;
            let planSubject = null;
            let subject = null;
            let horarios = [];

            // 7a. Obtener asignación docente
            if (enrollmentSubjectPlain.teacherAssignmentId) {
              try {
                teacherAssignment = await this.teacherAssignmentRepository.findById(
                  enrollmentSubjectPlain.teacherAssignmentId
                );
                teacherAssignment = teacherAssignment?.toPlainObject
                  ? teacherAssignment.toPlainObject()
                  : teacherAssignment;

                // 7a.1. Obtener docente desde la asignación docente
                if (teacherAssignment?.teacherId) {
                  try {
                    teacher = await this.teacherRepository.findById(teacherAssignment.teacherId, {
                      attributes: ['id', 'nombres', 'apellidoPaterno', 'apellidoMaterno', 'ci', 'expedicion', 'telefono', 'celular', 'emailPersonal'],
                    });
                    teacher = teacher?.toPlainObject ? teacher.toPlainObject() : teacher;
                  } catch (err) {
                    this.logger.warn('[Inscripciones] Error al obtener docente', {
                      enrollmentSubjectId: enrollmentSubjectPlain.id,
                      teacherId: teacherAssignment.teacherId,
                      error: err.message,
                    });
                  }
                }

                // 7b. Obtener curso desde la asignación docente
                if (teacherAssignment?.courseId) {
                  try {
                    course = await this.courseRepository.findById(teacherAssignment.courseId);
                    course = course?.toPlainObject ? course.toPlainObject() : course;

                    // 7c. Obtener asignatura de plan desde el curso
                    if (course?.planSubjectId) {
                      try {
                        planSubject = await this.planSubjectRepository.findById(course.planSubjectId);
                        planSubject = planSubject?.toPlainObject ? planSubject.toPlainObject() : planSubject;

                        // 7d. Obtener materia desde la asignatura de plan
                        if (planSubject?.subjectId) {
                          try {
                            subject = await this.subjectRepository.findById(planSubject.subjectId);
                            subject = subject?.toPlainObject ? subject.toPlainObject() : subject;
                          } catch (err) {
                            this.logger.warn('[Inscripciones] Error al obtener materia', {
                              enrollmentSubjectId: enrollmentSubjectPlain.id,
                              subjectId: planSubject.subjectId,
                              error: err.message,
                            });
                          }
                        }
                      } catch (err) {
                        this.logger.warn('[Inscripciones] Error al obtener asignatura de plan', {
                          enrollmentSubjectId: enrollmentSubjectPlain.id,
                          planSubjectId: course.planSubjectId,
                          error: err.message,
                        });
                      }
                    }

                    // 7e. Obtener horarios del curso
                    if (course?.id) {
                      try {
                        const cursosHorariosResult = await this.courseScheduleRepository.findAll(
                          { courseId: course.id },
                          null,
                          null
                        );
                        const cursosHorarios = cursosHorariosResult.courseSchedules || [];

                        // 7f. Para cada curso_horario, obtener horario y aula completos
                        horarios = await Promise.all(
                          cursosHorarios.map(async (cursoHorario) => {
                            try {
                              let horario = null;
                              if (cursoHorario.scheduleId) {
                                horario = await this.scheduleRepository.findById(cursoHorario.scheduleId);
                                horario = horario?.toPlainObject ? horario.toPlainObject() : horario;
                              }

                              let aula = null;
                              if (cursoHorario.classroomId) {
                                try {
                                  aula = await this.classroomRepository.findById(cursoHorario.classroomId);
                                  aula = aula?.toPlainObject ? aula.toPlainObject() : aula;
                                } catch (error) {
                                  this.logger.warn('[Inscripciones] Error al obtener aula', {
                                    cursoHorarioId: cursoHorario.id,
                                    aulaId: cursoHorario.classroomId,
                                    error: error.message,
                                  });
                                }
                              }

                              return {
                                id: cursoHorario.id,
                                ordenSecuencia: cursoHorario.sequenceOrder,
                                horario: horario
                                  ? {
                                      dia: horario.day,
                                      horaInicio: horario.startTime,
                                      horaFin: horario.endTime,
                                    }
                                  : null,
                                aula: aula ? aula.name : null,
                              };
                            } catch (error) {
                              this.logger.warn('[Inscripciones] Error al obtener horario o aula', {
                                cursoHorarioId: cursoHorario.id,
                                error: error.message,
                              });
                              return null;
                            }
                          })
                        );

                        // Filtrar horarios nulos (errores)
                        horarios = horarios.filter((h) => h !== null);

                        // Ordenar por ordenSecuencia
                        horarios.sort((a, b) => a.ordenSecuencia - b.ordenSecuencia);
                      } catch (err) {
                        this.logger.warn('[Inscripciones] Error al obtener horarios del curso', {
                          enrollmentSubjectId: enrollmentSubjectPlain.id,
                          courseId: course.id,
                          error: err.message,
                        });
                      }
                    }
                  } catch (err) {
                    this.logger.warn('[Inscripciones] Error al obtener curso', {
                      enrollmentSubjectId: enrollmentSubjectPlain.id,
                      courseId: teacherAssignment.courseId,
                      error: err.message,
                    });
                  }
                }
              } catch (err) {
                this.logger.warn('[Inscripciones] Error al obtener asignación docente', {
                  enrollmentSubjectId: enrollmentSubjectPlain.id,
                  teacherAssignmentId: enrollmentSubjectPlain.teacherAssignmentId,
                  error: err.message,
                });
              }
            }

            const periodoId = planSubject?.periodId ?? planSubject?.periodoId ?? null;
            const paraleloId = course?.parallelId ?? course?.paraleloId ?? null;

            return {
              ...enrollmentSubjectPlain,
              materiaId: subject ? subject.id : null,
              materiaNombre: subject ? subject.name : null,
              materiaSigla: subject ? subject.acronym : null,
              color: course ? course.colorHex : null,
              periodoId,
              paraleloId,
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

      // 8. Buscar formulario de inscripción del estudiante
      let formularioInscripcion = null;
      if (student?.id) {
        try {
          const documentosResult = await this.studentDocumentRepository.findAll(
            {
              studentId: student.id,
              tipoDocumento: 'INSCRIPCION',
            },
            null,
            null
          );

          const documentos = documentosResult.studentDocuments || [];
          
          this.logger.info('[Inscripciones] Documentos encontrados para estudiante', {
            studentId: student.id,
            totalDocumentos: documentos.length,
            documentosConTipoInscripcion: documentos.filter(d => {
              const docPlain = d.toPlainObject ? d.toPlainObject() : d;
              return docPlain.tipoDocumento === 'INSCRIPCION';
            }).length,
          });
          
          // Filtrar solo documentos que sean boletas de inscripción (deben tener BOLETA_INSCRIPCION en el nombre)
          // y que sean PDF (la boleta se genera como PDF)
          // Ordenar por fecha de creación descendente para obtener el más reciente
          const formulariosDocs = documentos
            .map(doc => {
              const docPlain = doc.toPlainObject ? doc.toPlainObject() : doc;
              return docPlain;
            })
            .filter(doc => {
              // El documento puede tener fileName (desde entidad) o nombreArchivo (desde modelo Sequelize directo)
              const fileName = doc.fileName || doc.nombreArchivo || '';
              const extension = doc.extension || '';
              
              // Debe tener tipoDocumento === 'INSCRIPCION' 
              // Y el nombre debe incluir 'BOLETA_INSCRIPCION' (nombre generado por CreateEnrollmentUseCase)
              // Y debe ser PDF (extension === 'pdf')
              const matches = doc.tipoDocumento === 'INSCRIPCION' && 
                     (fileName.includes('BOLETA_INSCRIPCION') || fileName.includes('FORMULARIO_INSCRIPCION')) &&
                     (extension === 'pdf' || fileName.toLowerCase().endsWith('.pdf'));
              
              if (doc.tipoDocumento === 'INSCRIPCION') {
                this.logger.debug('[Inscripciones] Documento INSCRIPCION encontrado', {
                  fileName: fileName,
                  extension: extension,
                  docKeys: Object.keys(doc),
                  matches: matches,
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
              filePath: filePath,
              fileName: fileNameRaw,
            };
            
            this.logger.info('[Inscripciones] Formulario de inscripción encontrado', {
              fileName: formularioDoc.fileName,
              filePath: filePath,
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
        enrollmentSubjectsCount: materiasValidas.length,
      });

      // TODO: Construir el schema por partes
      // Comentado temporalmente para construcción incremental
      // Los siguientes pasos se implementarán gradualmente:

      //   // 2. Obtener materias inscritas (múltiples)
      //   const enrollmentSubjectsResult = await this.enrollmentSubjectRepository.findAll(
      //     { enrollmentId: enrollment.id },
      //     null,
      //     null
      //   );
      //   const enrollmentSubjects = enrollmentSubjectsResult.enrollmentSubjects || [];

      //   this.logger.info('[Inscripciones] Materias inscritas encontradas', {
      //     enrollmentId: enrollment.id,
      //     count: enrollmentSubjects.length,
      //   });

      //   // 3. Obtener datos académicos del estudiante
      //   let studentAcademicData = null;
      //   if (enrollment.studentAcademicDataId) {
      //     try {
      //       studentAcademicData = await this.studentAcademicDataRepository.findById(
      //         enrollment.studentAcademicDataId
      //       );
      //       studentAcademicData = studentAcademicData?.toPlainObject
      //         ? studentAcademicData.toPlainObject()
      //         : studentAcademicData;
      //     } catch (err) {
      //       this.logger.warn('[Inscripciones] Error al obtener datos académicos', {
      //         enrollmentId: enrollment.id,
      //         studentAcademicDataId: enrollment.studentAcademicDataId,
      //         error: err.message,
      //       });
      //     }
      //   }

      //   // 4. Obtener gestión académica
      //   let management = null;
      //   if (enrollment.managementId) {
      //     try {
      //       management = await this.managementRepository.findById(enrollment.managementId);
      //       management = management?.toPlainObject ? management.toPlainObject() : management;
      //     } catch (err) {
      //       this.logger.warn('[Inscripciones] Error al obtener gestión', {
      //         enrollmentId: enrollment.id,
      //         managementId: enrollment.managementId,
      //         error: err.message,
      //       });
      //     }
      //   }

      //   // 5. Obtener estudiante desde datos académicos
      //   let student = null;
      //   if (studentAcademicData?.studentId) {
      //     try {
      //       student = await this.studentRepository.findById(studentAcademicData.studentId);
      //       student = student?.toPlainObject ? student.toPlainObject() : student;
      //     } catch (err) {
      //       this.logger.warn('[Inscripciones] Error al obtener estudiante', {
      //         enrollmentId: enrollment.id,
      //         studentId: studentAcademicData.studentId,
      //         error: err.message,
      //       });
      //     }
      //   }

      //   // 6. Obtener carrera desde datos académicos
      //   let career = null;
      //   if (studentAcademicData?.careerId) {
      //     try {
      //       career = await this.careerRepository.findById(studentAcademicData.careerId);
      //       career = career?.toPlainObject ? career.toPlainObject() : career;
      //     } catch (err) {
      //       this.logger.warn('[Inscripciones] Error al obtener carrera', {
      //         enrollmentId: enrollment.id,
      //         careerId: studentAcademicData.careerId,
      //         error: err.message,
      //       });
      //     }
      //   }

      //   // 7. Obtener plan de estudio desde carrera
      //   let studyPlan = null;
      //   if (studentAcademicData?.careerId) {
      //     try {
      //       const studyPlans = await this.studyPlanRepository.findByCarreraId(studentAcademicData.careerId);
      //       // Obtener el plan activo o el primero disponible
      //       studyPlan = studyPlans.find((sp) => sp.isActive) || studyPlans[0];
      //       studyPlan = studyPlan?.toPlainObject ? studyPlan.toPlainObject() : studyPlan;
      //     } catch (err) {
      //       this.logger.warn('[Inscripciones] Error al obtener plan de estudio', {
      //         enrollmentId: enrollment.id,
      //         careerId: studentAcademicData.careerId,
      //         error: err.message,
      //       });
      //     }
      //   }

      //   // 8. Obtener datos completos de cada materia inscrita (asignación docente, curso, asignatura de plan, materia)
      //   const enrollmentSubjectsWithDetails = await Promise.all(
      //     enrollmentSubjects.map(async (es) => {
      //       const enrollmentSubjectPlain = es.toPlainObject ? es.toPlainObject() : es;
      //       let teacherAssignment = null;
      //       let course = null;
      //       let planSubject = null;
      //       let subject = null;

      //       // Obtener asignación docente
      //       if (es.teacherAssignmentId) {
      //         try {
      //           teacherAssignment = await this.teacherAssignmentRepository.findById(es.teacherAssignmentId);
      //           teacherAssignment = teacherAssignment?.toPlainObject
      //             ? teacherAssignment.toPlainObject()
      //             : teacherAssignment;

      //           // Obtener curso desde la asignación docente
      //           if (teacherAssignment?.courseId) {
      //             try {
      //               course = await this.courseRepository.findById(teacherAssignment.courseId);
      //               course = course?.toPlainObject ? course.toPlainObject() : course;

      //               // Obtener asignatura de plan desde el curso
      //               if (course?.planSubjectId) {
      //                 try {
      //                   planSubject = await this.planSubjectRepository.findById(course.planSubjectId);
      //                   planSubject = planSubject?.toPlainObject ? planSubject.toPlainObject() : planSubject;

      //                   // Obtener materia desde la asignatura de plan
      //                   if (planSubject?.subjectId) {
      //                     try {
      //                       subject = await this.subjectRepository.findById(planSubject.subjectId);
      //                       subject = subject?.toPlainObject ? subject.toPlainObject() : subject;
      //                     } catch (err) {
      //                       this.logger.warn('[Inscripciones] Error al obtener materia', {
      //                         enrollmentSubjectId: es.id,
      //                         subjectId: planSubject.subjectId,
      //                         error: err.message,
      //                       });
      //                     }
      //                   }
      //                 } catch (err) {
      //                   this.logger.warn('[Inscripciones] Error al obtener asignatura de plan', {
      //                     enrollmentSubjectId: es.id,
      //                     planSubjectId: course.planSubjectId,
      //                     error: err.message,
      //                   });
      //                 }
      //               }
      //             } catch (err) {
      //               this.logger.warn('[Inscripciones] Error al obtener curso', {
      //                 enrollmentSubjectId: es.id,
      //                 courseId: teacherAssignment.courseId,
      //                 error: err.message,
      //               });
      //             }
      //           }
      //         } catch (err) {
      //           this.logger.warn('[Inscripciones] Error al obtener asignación docente', {
      //             enrollmentSubjectId: es.id,
      //             teacherAssignmentId: es.teacherAssignmentId,
      //             error: err.message,
      //           });
      //         }
      //       }

      //       return {
      //         ...enrollmentSubjectPlain,
      //         teacherAssignment,
      //         course,
      //         planSubject,
      //         subject,
      //       };
      //     })
      //   );

      //   // 9. Retornar la inscripción con todos sus datos relacionados
      //   const result = {
      //     enrollment: enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment,
      //     enrollmentSubjects: enrollmentSubjectsWithDetails,
      //     related: {
      //       studentAcademicData,
      //       student,
      //       career,
      //       studyPlan,
      //       management,
      //     },
      //   };

      //   this.logger.info('[Inscripciones] Inscripción obtenida exitosamente', {
      //     enrollmentId: enrollment.id,
      //     enrollmentSubjectsCount: enrollmentSubjects.length,
      //     hasStudentAcademicData: !!studentAcademicData,
      //     hasStudent: !!student,
      //     hasCareer: !!career,
      //     hasStudyPlan: !!studyPlan,
      //     hasManagement: !!management,
      //   });

      //   return result;
      // } catch (error) {
      //   this.logger.error('[Inscripciones] Error al obtener inscripción por ID', {
      //     error: error.message,
      //     stack: error.stack,
      //     enrollmentId,
      //   });
      //   throw error;
      // }

      // Retornar todas las entidades en formato de presentación
      const result = {
        enrollment: enrollmentPresentation,
        studentAcademicData: studentAcademicDataPresentation,
        management: managementPresentation,
        student: studentPresentation,
        career: careerPresentation,
        enrollmentSubjects: materiasValidas,
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
}
