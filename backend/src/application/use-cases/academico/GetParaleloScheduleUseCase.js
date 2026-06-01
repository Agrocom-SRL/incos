import { NotFoundError } from '../../../domain/errors/AppError.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { QueryTypes } from 'sequelize';

/**
 * GET /api/v1/paralelos/:id/schedule
 * Plan semanal del paralelo maestro en la gestión vigente (oferta + asignacion_horarios).
 */
export class GetParaleloScheduleUseCase {
  constructor({
    parallelRepository,
    courseOfferRepository,
    asignacionHorarioRepository,
    teacherAssignmentRepository,
    teacherRepository,
    planSubjectRepository,
    subjectRepository,
    careerRepository,
    periodRepository,
    logger,
  }) {
    this.parallelRepository = parallelRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.asignacionHorarioRepository = asignacionHorarioRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.teacherRepository = teacherRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.subjectRepository = subjectRepository;
    this.careerRepository = careerRepository;
    this.periodRepository = periodRepository;
    this.logger = logger;
  }

  async execute(parallelId) {
    const pid = Number(parallelId);
    if (!Number.isFinite(pid) || pid < 1) {
      throw new NotFoundError('paralelo');
    }

    const paralelo = await this.parallelRepository.findById(pid);
    if (!paralelo) {
      throw new NotFoundError('paralelo');
    }

    const pgRows = await sequelize.query(
      `
      SELECT pg.id AS paraleloGestionId, pg.gestion_plan_id AS gestionPlanId, pg.turno AS turnoEfectivo
      FROM paralelos_gestion pg
      INNER JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id AND gp.deleted_at IS NULL
      INNER JOIN gestiones g ON g.id = gp.gestion_id AND g.deleted_at IS NULL AND g.vigente = TRUE
      WHERE pg.paralelo_id = :paraleloId
        AND pg.deleted_at IS NULL
        AND pg.activo = TRUE
      ORDER BY pg.id DESC
      LIMIT 1
      `,
      { replacements: { paraleloId: pid }, type: QueryTypes.SELECT }
    );

    const pg = pgRows[0];
    if (!pg?.paraleloGestionId) {
      this.logger.warn('[Académico] Paralelo sin instancia en gestión vigente', { parallelId: pid });
      throw new NotFoundError('Paralelo en gestión vigente');
    }

    let carrera = null;
    if (paralelo.careerId) {
      try {
        carrera = await this.careerRepository.findById(paralelo.careerId);
      } catch (e) {
        this.logger.warn('[Académico] Carrera del paralelo no cargada', { error: e.message });
      }
    }

    let periodo = null;
    if (paralelo.periodId) {
      try {
        periodo = await this.periodRepository.findById(paralelo.periodId);
      } catch (e) {
        this.logger.warn('[Académico] Periodo del paralelo no cargado', { error: e.message });
      }
    }

    const paraleloResumen = {
      nombre: paralelo.name ?? null,
      turno: pg.turnoEfectivo ?? paralelo.shift ?? null,
      descripcion: paralelo.description ?? null,
      periodoNombre: periodo?.name ?? null,
      periodoNumero: periodo?.number ?? null,
      carreraNombre: carrera?.name ?? null,
      carreraCodigo: carrera?.code ?? null,
      carreraImagenRuta: carrera?.imagePath ?? null,
      carreraColorHex: carrera?.colorHex ?? null,
    };

    const ofertas = await this.courseOfferRepository.findEnrichedByParallelManagementId(
      Number(pg.paraleloGestionId)
    );
    const assignedPlanSubjectIds = new Set(
      ofertas.map((o) => Number(o.asignaturaPlanId)).filter((n) => Number.isFinite(n) && n > 0)
    );

    const schedule = await Promise.all(
      ofertas.map(async (oferta) => {
        const ofertaCursoId = Number(oferta.id);
        try {
          const bloques = await this.asignacionHorarioRepository.findBloquesByOfertaCursoIdForPresentation(
            ofertaCursoId
          );

          let docenteId = null;
          let docenteNombre = null;
          let gestionPlanId = Number(pg.gestionPlanId) || null;
          try {
            const asignacionesResult = await this.teacherAssignmentRepository.findAll(
              { offerCourseId: ofertaCursoId, active: true },
              { page: 1, limit: 1 },
              null
            );
            const firstAsignacion = asignacionesResult?.teacherAssignments?.[0] || null;
            docenteId = firstAsignacion?.teacherId ?? null;
            gestionPlanId = firstAsignacion?.managementPlanId ?? gestionPlanId;
            if (docenteId) {
              const docente = await this.teacherRepository.findById(docenteId);
              docenteNombre = docente
                ? [docente.firstName, docente.lastName, docente.motherLastName].filter(Boolean).join(' ')
                : null;
            }
          } catch (e) {
            this.logger.warn('[Académico] Asignación docente no cargada', {
              ofertaCursoId,
              error: e.message,
            });
          }

          const horarios = bloques.map((b) => ({
            id: b.id,
            ordenSecuencia: b.ordenSecuencia,
            horario: {
              dia: b.dia,
              horaInicio: b.horaInicio,
              horaFin: b.horaFin,
            },
            aula: b.aulaNombre ?? b.aulaCodigo ?? null,
          }));

          return {
            cursoId: ofertaCursoId,
            materiaId: oferta.materiaId ?? null,
            materiaNombre: oferta.materiaNombre ?? null,
            materiaSigla: oferta.materiaCodigo ?? oferta.materiaSigla ?? null,
            horasSemanalesPlan: oferta.horasSemanales ?? null,
            gestionPlanId,
            docenteId,
            docenteNombre,
            color: null,
            horarios,
          };
        } catch (error) {
          this.logger.warn('[Académico] Error al procesar oferta en schedule', {
            ofertaCursoId,
            error: error.message,
          });
          return null;
        }
      })
    );

    const cursosValidos = schedule.filter(Boolean);

    let missingSubjects = [];
    if (paralelo.periodId) {
      try {
        const planSubjectsResult = await this.planSubjectRepository.findAll(
          { periodId: paralelo.periodId },
          null,
          null
        );
        const planSubjects = planSubjectsResult.planSubjects || [];
        const missingPlanSubjects = planSubjects.filter(
          (ps) => !assignedPlanSubjectIds.has(Number(ps.id))
        );

        missingSubjects = await Promise.all(
          missingPlanSubjects.map(async (ps) => {
            let materia = null;
            if (ps.subjectId) {
              try {
                materia = await this.subjectRepository.findById(ps.subjectId);
              } catch (e) {
                this.logger.warn('[Académico] Materia faltante no cargada', { error: e.message });
              }
            }
            return {
              asignaturaPlanId: ps.id,
              materiaId: ps.subjectId ?? null,
              materiaSigla: materia?.acronym ?? null,
              materiaNombre: materia?.name ?? null,
              horasSemanalesPlan: ps.weeklyHours ?? null,
            };
          })
        );
      } catch (e) {
        this.logger.warn('[Académico] Materias sin oferta no calculadas', { error: e.message });
      }
    }

    return {
      paralelo: paraleloResumen,
      schedule: cursosValidos,
      missingSubjects,
    };
  }
}
