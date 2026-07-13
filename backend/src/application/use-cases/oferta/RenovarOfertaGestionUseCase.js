import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_GESTION_PLAN } from '../../../domain/constants/cursos.constants.js';
import {
  ESTADOS_PARALELO_GESTION,
  ESTADOS_OFERTA_CURSO,
} from '../../../domain/constants/oferta.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';

/**
 * Renueva la oferta de una gestión: copia la cadena
 * `gestiones_planes → paralelos_gestion → oferta_cursos → asignaciones_docentes
 * → asignacion_horarios` desde una gestión ORIGEN hacia la gestión DESTINO.
 *
 * Reglas de negocio:
 * - Cada gestion_plan seleccionado se copia en SU PROPIA transacción: si la
 *   copia de una carrera falla, las demás quedan aplicadas y el resumen lo refleja.
 * - Idempotencia (la BD no tiene UNIQUEs): si el destino ya tiene un
 *   gestiones_planes activo para el mismo plan de estudios, NO se copia y se
 *   registra la advertencia «ya existe».
 * - `plan_estudio_destino_id` opcional por plan (nueva versión del plan por RM):
 *   las asignaturas se re-resuelven cruzando (materia_id + número de periodo);
 *   las que no tienen equivalente se omiten con advertencia.
 * - Estados al nacer: gestion_plan PROPUESTO, paralelos BORRADOR, ofertas
 *   PROGRAMADA, asignaciones vigente=TRUE.
 * - Solo se copian asignaciones_docentes `vigente=TRUE`; si el docente está
 *   inactivo, la asignación nace con docente_id NULL (pendiente) + advertencia.
 * - Los catálogos (paralelos, aulas, horarios, docentes) solo se re-referencian.
 *
 * Mismo patrón de orquestación multi-tabla que ClonarPlanEstudiosUseCase:
 * lecturas vía getModel().findAll({ transaction }) + toEntity(), creates
 * secuenciales con mapas de remapeo old→new, advertencias sin abortar.
 */
export class RenovarOfertaGestionUseCase {
  constructor({
    managementRepository,
    managementPlanRepository,
    parallelManagementRepository,
    courseOfferRepository,
    teacherAssignmentRepository,
    asignacionHorarioRepository,
    studyPlanRepository,
    planSubjectRepository,
    periodRepository,
    subjectRepository,
    teacherRepository,
    logger,
  }) {
    this.managementRepository = managementRepository;
    this.managementPlanRepository = managementPlanRepository;
    this.parallelManagementRepository = parallelManagementRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.asignacionHorarioRepository = asignacionHorarioRepository;
    this.studyPlanRepository = studyPlanRepository;
    this.planSubjectRepository = planSubjectRepository;
    this.periodRepository = periodRepository;
    this.subjectRepository = subjectRepository;
    this.teacherRepository = teacherRepository;
    this.logger = logger;
  }

  /**
   * @param {number} gestionDestinoId - Gestión DESTINO (`:id` de la ruta)
   * @param {Object} body - { gestion_origen_id, incluir_asignaciones, incluir_horarios, gestiones_planes }
   * @param {number|null} userId - Usuario que ejecuta (auditoría)
   * @returns {Promise<{resumen: Object}>}
   */
  async execute(gestionDestinoId, body = {}, userId = null) {
    const gestionOrigenId = Number(body.gestion_origen_id ?? body.gestionOrigenId);
    if (!Number.isFinite(gestionOrigenId) || gestionOrigenId < 1) {
      throw new ValidationError('gestion_origen_id es requerido');
    }

    // incluir_horarios implica incluir_asignaciones (los bloques cuelgan de la asignación).
    const incluirHorarios = this.toBool(body.incluir_horarios ?? body.incluirHorarios, true);
    const incluirAsignaciones =
      incluirHorarios ||
      this.toBool(body.incluir_asignaciones ?? body.incluirAsignaciones, true);

    const seleccion = Array.isArray(body.gestiones_planes) ? body.gestiones_planes : [];
    if (!seleccion.length) {
      throw new ValidationError('gestiones_planes debe incluir al menos un plan a renovar');
    }

    const gestionDestino = await this.managementRepository.findById(gestionDestinoId);
    if (!gestionDestino) throw new NotFoundError('gestión académica destino');
    if (gestionDestinoId === gestionOrigenId) {
      throw new ValidationError('La gestión origen y la gestión destino no pueden ser la misma');
    }
    const gestionOrigen = await this.managementRepository.findById(gestionOrigenId);
    if (!gestionOrigen) throw new NotFoundError('gestión académica origen');

    // Validación previa: cada gestion_plan seleccionado debe pertenecer a la gestión origen.
    const planesOrigen = [];
    /* eslint-disable no-await-in-loop */
    for (const item of seleccion) {
      const gestionPlanOrigenId = Number(item.gestion_plan_origen_id ?? item.gestionPlanOrigenId);
      if (!Number.isFinite(gestionPlanOrigenId) || gestionPlanOrigenId < 1) {
        throw new ValidationError('Cada elemento de gestiones_planes requiere gestion_plan_origen_id');
      }
      const gestionPlanOrigen = await this.managementPlanRepository.findById(gestionPlanOrigenId);
      if (!gestionPlanOrigen || gestionPlanOrigen.managementId !== gestionOrigenId) {
        throw new ValidationError(
          `El plan habilitado ${gestionPlanOrigenId} no pertenece a la gestión origen ${gestionOrigenId}`
        );
      }
      const planEstudioDestinoId = Number(
        item.plan_estudio_destino_id ?? item.planEstudioDestinoId ?? gestionPlanOrigen.studyPlanId
      );
      if (item.plan_estudio_destino_id ?? item.planEstudioDestinoId) {
        const planDestino = await this.studyPlanRepository.findById(planEstudioDestinoId);
        if (!planDestino) throw new NotFoundError('plan de estudios destino');
      }
      planesOrigen.push({ gestionPlanOrigen, planEstudioDestinoId });
    }

    // Copia por plan: cada carrera en SU PROPIA transacción.
    const planes = [];
    for (const { gestionPlanOrigen, planEstudioDestinoId } of planesOrigen) {
      const planResumen = {
        gestion_plan_origen_id: gestionPlanOrigen.id,
        gestion_plan_destino_id: null,
        plan_estudio_id: planEstudioDestinoId,
        paralelos: 0,
        ofertas: 0,
        asignaciones: 0,
        bloques: 0,
        advertencias: [],
      };
      try {
        await sequelize.transaction(async (t) =>
          this.copiarGestionPlan({
            t,
            gestionDestinoId,
            gestionPlanOrigen,
            planEstudioDestinoId,
            incluirAsignaciones,
            incluirHorarios,
            planResumen,
            userId,
          })
        );
      } catch (error) {
        // La transacción de ESTE plan se revierte; los demás planes siguen.
        this.logger.error('[Oferta] Falló la renovación de un plan habilitado', {
          gestionDestinoId,
          gestionPlanOrigenId: gestionPlanOrigen.id,
          error: error.message,
        });
        planResumen.gestion_plan_destino_id = null;
        planResumen.paralelos = 0;
        planResumen.ofertas = 0;
        planResumen.asignaciones = 0;
        planResumen.bloques = 0;
        planResumen.advertencias.push(`No se pudo copiar el plan: ${error.message}`);
      }
      planes.push(planResumen);
    }
    /* eslint-enable no-await-in-loop */

    const resumen = {
      gestion_destino_id: gestionDestinoId,
      gestion_origen_id: gestionOrigenId,
      planes,
    };

    this.logger.info('[Oferta] Renovación de oferta de gestión completada', {
      gestionOrigenId,
      gestionDestinoId,
      incluirAsignaciones,
      incluirHorarios,
      planes: planes.map((p) => ({
        origen: p.gestion_plan_origen_id,
        destino: p.gestion_plan_destino_id,
        paralelos: p.paralelos,
        ofertas: p.ofertas,
        asignaciones: p.asignaciones,
        bloques: p.bloques,
        advertencias: p.advertencias.length,
      })),
    });

    return { resumen };
  }

  /**
   * Copia la cadena completa de UN gestion_plan dentro de una transacción.
   * Los creates son secuenciales porque cada fila necesita el id generado por
   * el create anterior (remapeo old→new), igual que en ClonarPlanEstudiosUseCase.
   */
  async copiarGestionPlan({
    t,
    gestionDestinoId,
    gestionPlanOrigen,
    planEstudioDestinoId,
    incluirAsignaciones,
    incluirHorarios,
    planResumen,
    userId,
  }) {
    /* eslint-disable no-await-in-loop */

    // 1) Idempotencia: si el destino ya tiene un plan habilitado activo para el
    // mismo plan de estudios, no se copia nada de esta carrera.
    const existente = await this.managementPlanRepository.getModel().findOne({
      where: {
        gestionId: gestionDestinoId,
        planEstudioId: planEstudioDestinoId,
        activo: true,
      },
      transaction: t,
    });
    if (existente) {
      planResumen.advertencias.push(
        `Ya existe un plan habilitado activo (gestion_plan ${existente.id}) para el plan de estudios ${planEstudioDestinoId} en la gestión destino; no se copió`
      );
      return;
    }

    // 2) gestiones_planes destino: estado PROPUESTO, nombre heredado del origen.
    const gestionPlanDestino = await this.managementPlanRepository.create(
      {
        managementId: gestionDestinoId,
        studyPlanId: planEstudioDestinoId,
        name: gestionPlanOrigen.name,
        state: ESTADOS_GESTION_PLAN.PROPUESTO,
      },
      userId,
      { transaction: t }
    );
    planResumen.gestion_plan_destino_id = gestionPlanDestino.id;

    // Mapa de asignaturas origen→destino (identidad si es el mismo plan;
    // cruce materia_id + número de periodo si es una nueva versión del plan).
    const { asignaturaPlanMap, siglaByAsignaturaOrigenId } = await this.buildAsignaturaPlanMap({
      t,
      planEstudioOrigenId: gestionPlanOrigen.studyPlanId,
      planEstudioDestinoId,
    });

    // 3) paralelos_gestion: mismo paralelo/aula/turno/cupos, estado BORRADOR.
    const paralelosOrigenModels = await this.parallelManagementRepository.getModel().findAll({
      where: { gestionPlanId: gestionPlanOrigen.id, activo: true },
      order: [['id', 'ASC']],
      transaction: t,
    });
    const paralelosOrigen = paralelosOrigenModels.map((m) =>
      this.parallelManagementRepository.toEntity(m)
    );

    const paraleloGestionIdMap = new Map();
    for (const paralelo of paralelosOrigen) {
      const nuevoParalelo = await this.parallelManagementRepository.create(
        {
          managementPlanId: gestionPlanDestino.id,
          parallelId: paralelo.parallelId,
          classroomId: paralelo.classroomId,
          shift: paralelo.shift,
          state: ESTADOS_PARALELO_GESTION.BORRADOR,
          maxCapacity: paralelo.maxCapacity,
          minCapacity: paralelo.minCapacity,
        },
        userId,
        { transaction: t }
      );
      paraleloGestionIdMap.set(paralelo.id, nuevoParalelo.id);
      planResumen.paralelos += 1;
    }

    // 4) oferta_cursos: remapea paralelo_gestion_id y asignatura_plan_id,
    // estado PROGRAMADA. Asignaturas sin equivalente en el plan destino se
    // omiten (advertencia agrupada por asignatura).
    const ofertaCursoIdMap = new Map();
    const omitidasPorAsignatura = new Map();
    if (paralelosOrigen.length) {
      const ofertasOrigenModels = await this.courseOfferRepository.getModel().findAll({
        where: { paraleloGestionId: [...paraleloGestionIdMap.keys()], activo: true },
        order: [['id', 'ASC']],
        transaction: t,
      });
      const ofertasOrigen = ofertasOrigenModels.map((m) => this.courseOfferRepository.toEntity(m));

      for (const oferta of ofertasOrigen) {
        const nuevoParaleloGestionId = paraleloGestionIdMap.get(oferta.parallelManagementId);
        const nuevaAsignaturaPlanId = asignaturaPlanMap.get(oferta.planSubjectId);
        if (!nuevoParaleloGestionId || !nuevaAsignaturaPlanId) {
          const etiqueta =
            siglaByAsignaturaOrigenId.get(oferta.planSubjectId) ??
            `asignatura_plan ${oferta.planSubjectId}`;
          omitidasPorAsignatura.set(etiqueta, (omitidasPorAsignatura.get(etiqueta) ?? 0) + 1);
        } else {
          const nuevaOferta = await this.courseOfferRepository.create(
            {
              parallelManagementId: nuevoParaleloGestionId,
              planSubjectId: nuevaAsignaturaPlanId,
              state: ESTADOS_OFERTA_CURSO.PROGRAMADA,
            },
            userId,
            { transaction: t }
          );
          ofertaCursoIdMap.set(oferta.id, nuevaOferta.id);
          planResumen.ofertas += 1;
        }
      }
    }
    for (const [etiqueta, cantidad] of omitidasPorAsignatura) {
      planResumen.advertencias.push(
        `${etiqueta} no tiene equivalente en el plan destino; se omitieron ${cantidad} oferta(s)`
      );
    }

    if (!incluirAsignaciones) return;

    // 5) asignaciones_docentes: solo las vigente=TRUE del origen. Docente
    // inactivo → nace pendiente (docente_id NULL) con advertencia.
    const asignacionesOrigenModels = await this.teacherAssignmentRepository.getModel().findAll({
      where: { gestionPlanId: gestionPlanOrigen.id, vigente: true, activo: true },
      order: [['id', 'ASC']],
      transaction: t,
    });
    const asignacionesOrigen = asignacionesOrigenModels.map((m) =>
      this.teacherAssignmentRepository.toEntity(m)
    );
    const docentesById = await this.loadDocentes(
      asignacionesOrigen.map((a) => a.teacherId).filter(Boolean),
      t
    );

    const asignacionDocenteIdMap = new Map();
    for (const asignacion of asignacionesOrigen) {
      const nuevaOfertaCursoId = ofertaCursoIdMap.get(asignacion.offerCourseId);
      if (!nuevaOfertaCursoId) {
        planResumen.advertencias.push(
          `Asignación docente ${asignacion.id} omitida: su oferta no fue copiada`
        );
      } else {
        let docenteId = asignacion.teacherId ?? null;
        if (docenteId) {
          const docente = docentesById.get(docenteId);
          if (!docente || !docente.activo) {
            const nombre = docente
              ? [docente.apellidoPaterno, docente.apellidoMaterno, docente.nombres]
                  .filter(Boolean)
                  .join(' ')
              : `docente ${docenteId}`;
            planResumen.advertencias.push(
              `El docente ${nombre} está inactivo: la asignación quedó pendiente (sin docente)`
            );
            docenteId = null;
          }
        }

        const nuevaAsignacion = await this.teacherAssignmentRepository.create(
          {
            managementPlanId: gestionPlanDestino.id,
            offerCourseId: nuevaOfertaCursoId,
            teacherId: docenteId,
            hours: asignacion.hours,
            // vigente=TRUE al nacer (active mapea a vigente en TeacherAssignmentMapper).
            active: true,
            assignmentDate: new Date().toISOString().slice(0, 10),
          },
          userId,
          { transaction: t }
        );
        asignacionDocenteIdMap.set(asignacion.id, nuevaAsignacion.id);
        planResumen.asignaciones += 1;
      }
    }

    if (!incluirHorarios || !asignacionesOrigen.length) return;

    // 6) asignacion_horarios: remapea asignacion_docente_id; horario_id y
    // orden_secuencia se copian tal cual. Bloques de asignaciones no clonadas
    // se omiten con advertencia agrupada.
    const bloquesOrigenModels = await this.asignacionHorarioRepository.getModel().findAll({
      where: { asignacionDocenteId: asignacionesOrigen.map((a) => a.id), activo: true },
      order: [['id', 'ASC']],
      transaction: t,
    });
    const bloquesOrigen = bloquesOrigenModels.map((m) =>
      this.asignacionHorarioRepository.toEntity(m)
    );

    const bloquesOmitidos = new Map();
    for (const bloque of bloquesOrigen) {
      const nuevaAsignacionId = asignacionDocenteIdMap.get(bloque.teacherAssignmentId);
      if (!nuevaAsignacionId) {
        bloquesOmitidos.set(
          bloque.teacherAssignmentId,
          (bloquesOmitidos.get(bloque.teacherAssignmentId) ?? 0) + 1
        );
      } else {
        await this.asignacionHorarioRepository.create(
          {
            teacherAssignmentId: nuevaAsignacionId,
            scheduleId: bloque.scheduleId,
            sequenceOrder: bloque.sequenceOrder,
          },
          userId,
          { transaction: t }
        );
        planResumen.bloques += 1;
      }
    }
    for (const [asignacionOrigenId, cantidad] of bloquesOmitidos) {
      planResumen.advertencias.push(
        `Se omitieron ${cantidad} bloque(s) de horario: la asignación ${asignacionOrigenId} no fue clonada`
      );
    }
    /* eslint-enable no-await-in-loop */
  }

  /**
   * Construye el mapa asignatura_plan origen → destino.
   * - Mismo plan de estudios: identidad (se reutilizan los mismos ids).
   * - Plan destino distinto (nueva versión por RM): cruce por
   *   (materia_id de la asignatura origen + número de periodo).
   * También resuelve las siglas de materia del origen para las advertencias.
   */
  async buildAsignaturaPlanMap({ t, planEstudioOrigenId, planEstudioDestinoId }) {
    const asignaturasOrigenModels = await this.planSubjectRepository.getModel().findAll({
      where: { planEstudioId: planEstudioOrigenId, activo: true },
      transaction: t,
    });
    const asignaturasOrigen = asignaturasOrigenModels.map((m) =>
      this.planSubjectRepository.toEntity(m)
    );

    // Siglas de las materias del origen (solo para mensajes de advertencia).
    const siglaByAsignaturaOrigenId = new Map();
    const materiaIds = [...new Set(asignaturasOrigen.map((a) => a.subjectId).filter(Boolean))];
    if (materiaIds.length) {
      const materias = await this.subjectRepository.getModel().findAll({
        attributes: ['id', 'sigla'],
        where: { id: materiaIds },
        raw: true,
        transaction: t,
      });
      const siglaByMateriaId = new Map(materias.map((m) => [m.id, m.sigla]));
      for (const asignatura of asignaturasOrigen) {
        const sigla = siglaByMateriaId.get(asignatura.subjectId);
        if (sigla) siglaByAsignaturaOrigenId.set(asignatura.id, sigla);
      }
    }

    const asignaturaPlanMap = new Map();
    if (planEstudioDestinoId === planEstudioOrigenId) {
      for (const asignatura of asignaturasOrigen) {
        asignaturaPlanMap.set(asignatura.id, asignatura.id);
      }
      return { asignaturaPlanMap, siglaByAsignaturaOrigenId };
    }

    // Nueva versión del plan: cruzar (materia_id + número de periodo).
    const [periodosOrigen, periodosDestino, asignaturasDestinoModels] = await Promise.all([
      this.periodRepository.getModel().findAll({
        where: { planEstudioId: planEstudioOrigenId, activo: true },
        transaction: t,
      }),
      this.periodRepository.getModel().findAll({
        where: { planEstudioId: planEstudioDestinoId, activo: true },
        transaction: t,
      }),
      this.planSubjectRepository.getModel().findAll({
        where: { planEstudioId: planEstudioDestinoId, activo: true },
        transaction: t,
      }),
    ]);

    const numeroByPeriodoOrigenId = new Map(
      periodosOrigen.map((p) => [p.id, this.periodRepository.toEntity(p).number])
    );
    const numeroByPeriodoDestinoId = new Map(
      periodosDestino.map((p) => [p.id, this.periodRepository.toEntity(p).number])
    );

    const destinoByMateriaPeriodo = new Map();
    for (const model of asignaturasDestinoModels) {
      const asignatura = this.planSubjectRepository.toEntity(model);
      const numero = numeroByPeriodoDestinoId.get(asignatura.periodId) ?? null;
      destinoByMateriaPeriodo.set(`${asignatura.subjectId}:${numero}`, asignatura.id);
    }

    for (const asignatura of asignaturasOrigen) {
      const numero = numeroByPeriodoOrigenId.get(asignatura.periodId) ?? null;
      const destinoId = destinoByMateriaPeriodo.get(`${asignatura.subjectId}:${numero}`);
      if (destinoId) asignaturaPlanMap.set(asignatura.id, destinoId);
    }

    return { asignaturaPlanMap, siglaByAsignaturaOrigenId };
  }

  /**
   * Carga en bloque los docentes referenciados por las asignaciones origen
   * (id, activo y nombre para las advertencias de docente pendiente).
   */
  async loadDocentes(teacherIds, t) {
    const ids = [...new Set(teacherIds)];
    if (!ids.length) return new Map();
    const rows = await this.teacherRepository.getModel().findAll({
      attributes: ['id', 'activo', 'nombres', 'apellidoPaterno', 'apellidoMaterno'],
      where: { id: ids },
      raw: true,
      transaction: t,
    });
    return new Map(rows.map((d) => [d.id, d]));
  }

  /** Normaliza banderas booleanas del payload (acepta true/false, 1/0, '1'/'0'). */
  toBool(value, defaultValue) {
    if (value === undefined || value === null || value === '') return defaultValue;
    return value === true || value === 1 || value === '1' || value === 'true';
  }
}
