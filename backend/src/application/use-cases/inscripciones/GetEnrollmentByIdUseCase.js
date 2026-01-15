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
 */

import { ValidationError } from '../../../domain/errors/AppError.js';

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
    this.logger.info('[Inscripciones] Obteniendo inscripción por ID', {
      enrollmentId,
    });

    // Obtener solo los campos necesarios usando los nombres del modelo Sequelize
    // Mapeo: estudianteDatosAcademicosId -> studentAcademicDataId, gestionId -> managementId, tipoInscripcion -> enrollmentType
    const enrollment = await this.enrollmentRepository.findById(enrollmentId, {
      attributes: ['id', 'estudianteDatosAcademicosId', 'gestionId', 'tipoInscripcion'],
    });

    if (!enrollment) {
      throw new ValidationError(
        `No se encontró una inscripción con ID ${enrollmentId}`,
      );
    }

    this.logger.info('[Inscripciones] Inscripción encontrada', {
      enrollmentId: enrollment.id,
      studentAcademicDataId: enrollment.studentAcademicDataId,
      managementId: enrollment.managementId,
      enrollmentType: enrollment.enrollmentType,
    });

    return enrollment;
  }

  /**
   * Ejecuta el caso de uso de obtención de inscripción por ID
   * 
   * @param {number} enrollmentId - ID de la inscripción a obtener
   * @returns {Promise<Object>} Inscripción encontrada (temporal para construcción incremental del schema)
   */
  async execute(enrollmentId) {
    // Obtener la inscripción usando el método interno
    // Si es exitoso, retornar la inscripción encontrada
    const enrollment = await this._getEnrollmentById(enrollmentId);
    
    // Convertir a objeto plano si tiene el método toPlainObject
    const enrollmentPlain = enrollment?.toPlainObject 
      ? enrollment.toPlainObject() 
      : enrollment;
    
    // TODO: Construir el schema por partes
    // Comentado temporalmente para construcción incremental
    
    // this.logger.info('[Inscripciones] Iniciando obtención de inscripción por ID', {
    //   enrollmentId,
    // });

    // try {
    //   // 1. Obtener la inscripción principal
    //   const enrollment = await this.enrollmentRepository.findById(enrollmentId);

    //   if (!enrollment) {
    //     throw new Error(`No se encontró una inscripción con ID ${enrollmentId}`);
    //   }

    //   this.logger.info('[Inscripciones] Inscripción encontrada', {
    //     enrollmentId: enrollment.id,
    //     studentAcademicDataId: enrollment.studentAcademicDataId,
    //     managementId: enrollment.managementId,
    //   });

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

    // Retornar la inscripción encontrada (temporal para construcción incremental del schema)
    return enrollmentPlain;
  }
}
