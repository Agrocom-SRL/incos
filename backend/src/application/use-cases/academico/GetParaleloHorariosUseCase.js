/**
 * Use Case: GetParaleloHorariosUseCase
 * Módulo: Académico
 * Obtiene los horarios completos de un paralelo con todos sus datos relacionados
 * 
 * Responsabilidades:
 * - Validar que el paralelo exista
 * - Obtener el paralelo principal
 * - Obtener todos los cursos del paralelo
 * - Para cada curso, obtener asignatura_plan y materia
 * - Para cada curso, obtener cursos_horarios con horarios y aulas
 * - Retornar el paralelo con todos sus horarios estructurados
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la obtención completa de horarios de paralelo
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */
import { NotFoundError } from '../../../domain/errors/AppError.js';

export class GetParaleloHorariosUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.parallelRepository - Repositorio de paralelos
   * @param {Object} params.courseRepository - Repositorio de cursos
   * @param {Object} params.courseScheduleRepository - Repositorio de cursos_horarios
   * @param {Object} params.planSubjectRepository - Repositorio de asignaturas_plan
   * @param {Object} params.subjectRepository - Repositorio de materias
   * @param {Object} params.scheduleRepository - Repositorio de horarios
   * @param {Object} params.classroomRepository - Repositorio de aulas
   * @param {Object} params.careerRepository - Repositorio de carreras
   * @param {Object} params.periodRepository - Repositorio de periodos
   * @param {Object} params.teacherAssignmentRepository - Repositorio de asignaciones docentes
   * @param {Object} params.teacherRepository - Repositorio de docentes
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    parallelRepository,
    courseRepository,
    courseScheduleRepository,
    planSubjectRepository,
    subjectRepository,
    scheduleRepository,
    classroomRepository,
    careerRepository,
    periodRepository,
    teacherAssignmentRepository,
    teacherRepository,
    logger,
  }) {
    this.parallelRepository = parallelRepository;
    this.courseRepository = courseRepository;
    this.courseScheduleRepository = courseScheduleRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.subjectRepository = subjectRepository;
    this.scheduleRepository = scheduleRepository;
    this.classroomRepository = classroomRepository;
    this.careerRepository = careerRepository;
    this.periodRepository = periodRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.teacherRepository = teacherRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de obtención de horarios de paralelo por ID
   * 
   * Template Method: Define el algoritmo común de:
   * 1. Validar que el paralelo exista
   * 2. Obtener todos los cursos del paralelo
   * 3. Para cada curso, obtener asignatura_plan y materia
   * 4. Para cada curso, obtener cursos_horarios con horarios y aulas
   * 5. Estructurar y retornar datos
   * 
   * @param {number} parallelId - ID del paralelo a obtener
   * @returns {Promise<Object>} Paralelo con todos sus horarios estructurados
   */
  async execute(parallelId) {
    // Logging inicial
    this.logger.info('[Académico] Iniciando obtención de horarios de paralelo por ID', {
      parallelId,
    });

    try {
      // 1. Obtener paralelo
      const paralelo = await this.parallelRepository.findById(parallelId);

      if (!paralelo) {
        this.logger.warn('[Académico] Paralelo no encontrado', {
          parallelId,
        });
        throw new NotFoundError('paralelo');
      }

      this.logger.info('[Académico] Paralelo encontrado', {
        parallelId: paralelo.id,
        nombre: paralelo.name,
      });

      let carrera = null;
      if (paralelo.careerId) {
        try {
          carrera = await this.careerRepository.findById(paralelo.careerId);
        } catch (e) {
          this.logger.warn('[Académico] No se pudo cargar carrera del paralelo', {
            careerId: paralelo.careerId,
            error: e.message,
          });
        }
      }

      let periodo = null;
      if (paralelo.periodId) {
        try {
          periodo = await this.periodRepository.findById(paralelo.periodId);
        } catch (e) {
          this.logger.warn('[Académico] No se pudo cargar periodo del paralelo', {
            periodId: paralelo.periodId,
            error: e.message,
          });
        }
      }

      const paraleloResumen = {
        nombre: paralelo.name ?? null,
        turno: paralelo.shift ?? null,
        descripcion: paralelo.description ?? null,
        periodoNombre: periodo?.name ?? null,
        periodoNumero: periodo?.number ?? null,
        carreraNombre: carrera?.name ?? null,
        carreraCodigo: carrera?.code ?? null,
        carreraImagenRuta: carrera?.imagePath ?? null,
        carreraColorHex: carrera?.colorHex ?? null,
      };

      // 2. Obtener todos los cursos del paralelo
      const cursosResult = await this.courseRepository.findAll(
        { parallelId: paralelo.id },
        null, // sin paginación
        null
      );
      const cursos = cursosResult.courses || [];
      const assignedPlanSubjectIds = new Set(
        cursos.map((c) => Number(c.planSubjectId)).filter((n) => Number.isFinite(n) && n > 0),
      );

      this.logger.info('[Académico] Cursos encontrados', {
        parallelId: paralelo.id,
        count: cursos.length,
      });

      // 3. Para cada curso, obtener datos relacionados
      const horariosCompletos = await Promise.all(
        cursos.map(async (curso) => {
          try {
            // 3a. Obtener asignatura_plan
            let asignaturaPlan = null;
            if (curso.planSubjectId) {
              asignaturaPlan = await this.planSubjectRepository.findById(curso.planSubjectId);
              if (asignaturaPlan) {
                this.logger.debug('[Académico] Asignatura plan obtenida', {
                  cursoId: curso.id,
                  asignaturaPlanId: asignaturaPlan.id,
                });
              }
            }

            // 3b. Obtener materia desde asignatura_plan
            let materia = null;
            if (asignaturaPlan?.subjectId) {
              materia = await this.subjectRepository.findById(asignaturaPlan.subjectId);
              if (materia) {
                this.logger.debug('[Académico] Materia obtenida', {
                  cursoId: curso.id,
                  materiaId: materia.id,
                });
              }
            }

            // 3c. Obtener cursos_horarios del curso
            const cursosHorariosResult = await this.courseScheduleRepository.findAll(
              { courseId: curso.id },
              null,
              null
            );
            const cursosHorarios = cursosHorariosResult.courseSchedules || [];

            // 3c.1 Obtener asignación docente vigente del curso (si existe)
            let docenteId = null;
            let docenteNombre = null;
            try {
              const asignacionesResult = await this.teacherAssignmentRepository.findAll(
                { courseId: curso.id, active: true },
                { page: 1, limit: 1 },
                null,
              );
              const firstAsignacion = asignacionesResult?.teacherAssignments?.[0] || null;
              docenteId = firstAsignacion?.teacherId ?? null;
              if (docenteId) {
                const docente = await this.teacherRepository.findById(docenteId);
                docenteNombre = docente
                  ? [docente.firstName, docente.lastName, docente.motherLastName].filter(Boolean).join(' ')
                  : null;
              }
            } catch (e) {
              this.logger.warn('[Académico] No se pudo cargar asignación docente del curso', {
                cursoId: curso.id,
                error: e.message,
              });
            }

            this.logger.debug('[Académico] Cursos horarios encontrados', {
              cursoId: curso.id,
              count: cursosHorarios.length,
            });

            // 3d. Para cada curso_horario, obtener horario y aula completos
            const horarios = await Promise.all(
              cursosHorarios.map(async (cursoHorario) => {
                try {
                  let horario = null;
                  if (cursoHorario.scheduleId) {
                    horario = await this.scheduleRepository.findById(cursoHorario.scheduleId);
                  }

                  let aula = null;
                  if (cursoHorario.classroomId) {
                    try {
                      aula = await this.classroomRepository.findById(cursoHorario.classroomId);
                      if (!aula) {
                        this.logger.warn('[Académico] Aula no encontrada en base de datos', {
                          cursoHorarioId: cursoHorario.id,
                          aulaId: cursoHorario.classroomId,
                        });
                      }
                    } catch (error) {
                      this.logger.warn('[Académico] Error al obtener aula', {
                        cursoHorarioId: cursoHorario.id,
                        aulaId: cursoHorario.classroomId,
                        error: error.message,
                      });
                    }
                  } else {
                    this.logger.debug('[Académico] Curso horario sin aula asignada', {
                      cursoHorarioId: cursoHorario.id,
                    });
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
                  this.logger.warn('[Académico] Error al obtener horario o aula de curso_horario', {
                    cursoHorarioId: cursoHorario.id,
                    error: error.message,
                  });
                  return null;
                }
              })
            );

            // Filtrar horarios nulos (errores)
            const horariosValidos = horarios.filter((h) => h !== null);

            // Ordenar por ordenSecuencia
            horariosValidos.sort((a, b) => a.ordenSecuencia - b.ordenSecuencia);

            return {
              cursoId: curso.id,
              materiaId: materia ? materia.id : null,
              materiaNombre: materia?.name ?? null,
              materiaSigla: materia?.acronym ?? null,
              horasSemanalesPlan: asignaturaPlan?.weeklyHours ?? null,
              gestionPlanId: curso.managementPlanId ?? null,
              docenteId,
              docenteNombre,
              color: curso.colorHex || null,
              horarios: horariosValidos,
            };
          } catch (error) {
            this.logger.warn('[Académico] Error al procesar curso', {
              cursoId: curso.id,
              error: error.message,
            });
            return null;
          }
        })
      );

      // Filtrar cursos nulos (errores)
      const cursosValidos = horariosCompletos.filter((c) => c !== null);

      // 4. Detectar materias del periodo que todavía no tienen curso en este paralelo
      let missingSubjects = [];
      if (paralelo.periodId) {
        try {
          const planSubjectsResult = await this.planSubjectRepository.findAll(
            { periodId: paralelo.periodId },
            null,
            null,
          );
          const planSubjects = planSubjectsResult.planSubjects || [];
          const missingPlanSubjects = planSubjects.filter(
            (ps) => !assignedPlanSubjectIds.has(Number(ps.id)),
          );

          missingSubjects = await Promise.all(
            missingPlanSubjects.map(async (ps) => {
              let materia = null;
              if (ps.subjectId) {
                try {
                  materia = await this.subjectRepository.findById(ps.subjectId);
                } catch (e) {
                  this.logger.warn('[Académico] No se pudo cargar materia faltante', {
                    planSubjectId: ps.id,
                    subjectId: ps.subjectId,
                    error: e.message,
                  });
                }
              }
              return {
                asignaturaPlanId: ps.id,
                materiaId: ps.subjectId ?? null,
                materiaSigla: materia?.acronym ?? null,
                materiaNombre: materia?.name ?? null,
                horasSemanalesPlan: ps.weeklyHours ?? null,
              };
            }),
          );
        } catch (e) {
          this.logger.warn('[Académico] No se pudo construir listado de materias sin curso', {
            parallelId: paralelo.id,
            periodId: paralelo.periodId,
            error: e.message,
          });
        }
      }

      // Logging final
      this.logger.info('[Académico] Horarios de paralelo obtenidos exitosamente', {
        parallelId: paralelo.id,
        cursosCount: cursosValidos.length,
        totalCursos: cursos.length,
      });

      return {
        paralelo: paraleloResumen,
        schedule: cursosValidos,
        missingSubjects,
      };
    } catch (error) {
      // Manejo de errores
      this.logger.error('[Académico] Error al obtener horarios de paralelo por ID', {
        error: error.message,
        stack: error.stack,
        parallelId,
      });
      throw error;
    }
  }
}
