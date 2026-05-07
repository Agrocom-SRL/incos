/**
 * Oferta de cursos del paralelo (sin bloques de horario).
 * Separado de GET /paralelos/:id/schedule para no mezclar lectura de grilla con CRUD de oferta.
 */
import { NotFoundError } from '../../../domain/errors/AppError.js';

export class GetParaleloCursosOfertaUseCase {
  constructor({
    parallelRepository,
    courseRepository,
    courseScheduleRepository,
    planSubjectRepository,
    subjectRepository,
    careerRepository,
    periodRepository,
    logger,
  }) {
    this.parallelRepository = parallelRepository;
    this.courseRepository = courseRepository;
    this.courseScheduleRepository = courseScheduleRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.subjectRepository = subjectRepository;
    this.careerRepository = careerRepository;
    this.periodRepository = periodRepository;
    this.logger = logger;
  }

  async execute(parallelId) {
    this.logger.info('[Académico] Obtener oferta de cursos del paralelo', { parallelId });

    const paralelo = await this.parallelRepository.findById(parallelId);
    if (!paralelo) {
      this.logger.warn('[Académico] Paralelo no encontrado', { parallelId });
      throw new NotFoundError('paralelo');
    }

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

    const cursosResult = await this.courseRepository.findAll({ parallelId: paralelo.id }, null, null);
    const cursos = cursosResult.courses || [];
    const assignedPlanSubjectIds = new Set(
      cursos.map((c) => Number(c.planSubjectId)).filter((n) => Number.isFinite(n) && n > 0),
    );

    const cursosPayload = await Promise.all(
      cursos.map(async (curso) => {
        let asignaturaPlan = null;
        if (curso.planSubjectId) {
          asignaturaPlan = await this.planSubjectRepository.findById(curso.planSubjectId);
        }
        let materia = null;
        if (asignaturaPlan?.subjectId) {
          try {
            materia = await this.subjectRepository.findById(asignaturaPlan.subjectId);
          } catch (e) {
            this.logger.warn('[Académico] No se pudo cargar materia del curso', {
              cursoId: curso.id,
              error: e.message,
            });
          }
        }

        let bloquesCount = 0;
        try {
          bloquesCount = await this.courseScheduleRepository.count({ courseId: curso.id });
        } catch (e) {
          this.logger.warn('[Académico] No se pudo contar bloques del curso', {
            cursoId: curso.id,
            error: e.message,
          });
        }

        const plain = typeof curso.toPlainObject === 'function' ? curso.toPlainObject() : curso;

        return {
          cursoId: curso.id,
          codigo: plain.code ?? null,
          cupoMaximo: plain.maxCapacity ?? null,
          cupoMinimo: plain.minCapacity ?? null,
          colorHex: plain.colorHex ?? null,
          asignaturaPlanId: curso.planSubjectId ?? null,
          materiaId: materia?.id ?? asignaturaPlan?.subjectId ?? null,
          materiaNombre: materia?.name ?? null,
          materiaSigla: materia?.acronym ?? null,
          horasSemanalesPlan: asignaturaPlan?.weeklyHours ?? null,
          bloquesCount,
          tieneHorarios: bloquesCount > 0,
        };
      }),
    );

    let missingSubjects = [];
    if (paralelo.periodId) {
      try {
        const planSubjectsResult = await this.planSubjectRepository.findAll(
          { periodId: paralelo.periodId },
          null,
          null,
        );
        const planSubjects = planSubjectsResult.planSubjects || [];
        const missingPlanSubjects = planSubjects.filter((ps) => !assignedPlanSubjectIds.has(Number(ps.id)));

        missingSubjects = await Promise.all(
          missingPlanSubjects.map(async (ps) => {
            let materia = null;
            if (ps.subjectId) {
              try {
                materia = await this.subjectRepository.findById(ps.subjectId);
              } catch (e) {
                this.logger.warn('[Académico] No se pudo cargar materia faltante', {
                  planSubjectId: ps.id,
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

    return {
      paralelo: paraleloResumen,
      cursos: cursosPayload,
      missingSubjects,
    };
  }
}
