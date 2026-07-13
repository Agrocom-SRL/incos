import { NotFoundError } from '../../../domain/errors/AppError.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';

/**
 * Clona un plan de estudios ("nueva versión por RM"): copia periodos,
 * asignaturas_plan y prerrequisitos del plan origen hacia un plan destino
 * nuevo que nace `vigente=false`. El plan destino se edita luego (nombre del
 * plan, resolución ministerial, documento, etc.) y se publica con
 * MarcarPlanEstudiosVigenteUseCase, que desmarca el plan anterior.
 *
 * El plan origen queda intacto: no se modifica ni se migran estudiantes.
 *
 * Orquesta la operación multi-tabla en una única transacción; cada
 * repositorio sigue escribiendo su propia tabla:
 * - studyPlanRepository     → planes_estudios
 * - periodRepository        → periodos
 * - planSubjectRepository   → asignaturas_plan
 * - prerequisiteRepository  → prerrequisitos
 */
export class ClonarPlanEstudiosUseCase {
  constructor({
    studyPlanRepository,
    periodRepository,
    planSubjectRepository,
    prerequisiteRepository,
    logger
  }) {
    this.studyPlanRepository = studyPlanRepository;
    this.periodRepository = periodRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.prerequisiteRepository = prerequisiteRepository;
    this.logger = logger;
  }

  async execute(planOrigenId, userId = null) {
    const resumen = await sequelize.transaction(async (t) => {
      const planOrigen = await this.studyPlanRepository.findById(planOrigenId, { transaction: t });
      if (!planOrigen) throw new NotFoundError('plan de estudios');

      // Lecturas del plan origen dentro de la misma transacción. Se usa
      // getModel() directamente (mismo patrón que MarcarPlanEstudiosVigenteUseCase)
      // porque BaseRepository.findAll() aún no propaga `options`/`transaction`;
      // se delega igualmente el mapeo ORM → Entidad a toEntity() de cada repositorio.
      const periodosOrigenModels = await this.periodRepository.getModel().findAll({
        where: { planEstudioId: planOrigenId, activo: true },
        order: [['numero', 'ASC']],
        transaction: t,
      });
      const periodosOrigen = periodosOrigenModels.map((m) => this.periodRepository.toEntity(m));

      const asignaturasOrigenModels = await this.planSubjectRepository.getModel().findAll({
        where: { planEstudioId: planOrigenId, activo: true },
        transaction: t,
      });
      const asignaturasOrigen = asignaturasOrigenModels.map((m) =>
        this.planSubjectRepository.toEntity(m)
      );

      const prerrequisitosOrigenModels = await this.prerequisiteRepository.getModel().findAll({
        where: { planEstudioId: planOrigenId, activo: true },
        transaction: t,
      });
      const prerrequisitosOrigen = prerrequisitosOrigenModels.map((m) =>
        this.prerequisiteRepository.toEntity(m)
      );

      // 1) Plan destino: copia de los datos estructurales del origen.
      // nombre_plan y resolucion_ministerial se heredan tal cual (se editan
      // después en el formulario de la nueva versión).
      const planDestino = await this.studyPlanRepository.create(
        {
          careerId: planOrigen.careerId,
          planName: planOrigen.planName,
          ministerialResolution: planOrigen.ministerialResolution,
          durationYears: planOrigen.durationYears,
          totalHours: planOrigen.totalHours,
          hoursPerWeek: planOrigen.hoursPerWeek,
          hoursPerMonth: planOrigen.hoursPerMonth,
          hoursPerYear: planOrigen.hoursPerYear,
          isActive: false,
          active: true,
        },
        userId,
        { transaction: t }
      );

      // 2)-4) Periodos, asignaturas y prerrequisitos: cada fila necesita el id
      // generado por el `create` anterior (remapeo old→new), por lo que el
      // clonado es secuencial pieza-por-pieza dentro de esta única transacción
      // y no se puede paralelizar (mismo motivo que BulkRegistrarAsistenciaUseCase).
      /* eslint-disable no-await-in-loop */

      // 2) Periodos: copia 1:1 hacia el plan destino, mapa de ids viejo→nuevo.
      const periodoIdMap = new Map();
      for (const periodo of periodosOrigen) {
        const nuevoPeriodo = await this.periodRepository.create(
          {
            studyPlanId: planDestino.id,
            name: periodo.name,
            number: periodo.number,
            displayOrder: periodo.displayOrder,
            description: periodo.description,
          },
          userId,
          { transaction: t }
        );
        periodoIdMap.set(periodo.id, nuevoPeriodo.id);
      }

      // 3) Asignaturas del plan: copia remapeando periodo_id, mapa de ids viejo→nuevo.
      const asignaturaIdMap = new Map();
      for (const asignatura of asignaturasOrigen) {
        const nuevoPeriodoId = periodoIdMap.get(asignatura.periodId) ?? null;
        if (asignatura.periodId && !periodoIdMap.has(asignatura.periodId)) {
          this.logger.warn('Asignatura de plan clonada con periodo no remapeado', {
            planOrigenId,
            planDestinoId: planDestino.id,
            asignaturaPlanOrigenId: asignatura.id,
            periodoOrigenId: asignatura.periodId,
          });
        }
        const nuevaAsignatura = await this.planSubjectRepository.create(
          {
            studyPlanId: planDestino.id,
            periodId: nuevoPeriodoId,
            subjectId: asignatura.subjectId,
            weeklyHours: asignatura.weeklyHours,
            credits: asignatura.credits,
            modality: asignatura.modality,
            displayOrder: asignatura.displayOrder,
          },
          userId,
          { transaction: t }
        );
        asignaturaIdMap.set(asignatura.id, nuevaAsignatura.id);
      }

      // 4) Prerrequisitos: copia remapeando asignatura_id y prerrequisito_id.
      // Si algún id de origen no aparece en el mapa, se omite la fila (con
      // warning) sin abortar la transacción.
      for (const prerrequisito of prerrequisitosOrigen) {
        const nuevaAsignaturaId = asignaturaIdMap.get(prerrequisito.subjectId);
        const nuevoPrerrequisitoId = asignaturaIdMap.get(prerrequisito.prerequisiteId);
        if (!nuevaAsignaturaId || !nuevoPrerrequisitoId) {
          this.logger.warn('Prerrequisito omitido al clonar plan: asignatura no remapeada', {
            planOrigenId,
            planDestinoId: planDestino.id,
            prerrequisitoOrigenId: prerrequisito.id,
            subjectId: prerrequisito.subjectId,
            prerequisiteId: prerrequisito.prerequisiteId,
          });
        } else {
          await this.prerequisiteRepository.create(
            {
              studyPlanId: planDestino.id,
              subjectId: nuevaAsignaturaId,
              prerequisiteId: nuevoPrerrequisitoId,
            },
            userId,
            { transaction: t }
          );
        }
      }
      /* eslint-enable no-await-in-loop */

      return {
        planDestino,
        totalPeriodos: periodosOrigen.length,
        totalAsignaturas: asignaturasOrigen.length,
        totalPrerrequisitos: prerrequisitosOrigen.length,
      };
    });

    this.logger.info('Plan de estudios clonado', {
      planOrigenId,
      planDestinoId: resumen.planDestino.id,
      periodos: resumen.totalPeriodos,
      asignaturas: resumen.totalAsignaturas,
      prerrequisitos: resumen.totalPrerrequisitos,
    });

    return { plan_estudio: resumen.planDestino };
  }
}
