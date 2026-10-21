import { QueryTypes } from 'sequelize';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { AsignacionHorario as AsignacionHorarioModel } from '../../../infrastructure/database/models/asignacion_horario.js';
import { AsignacionDocente as AsignacionDocenteModel } from '../../../infrastructure/database/models/asignacion_docente.js';
import { NotFoundError, UnprocessableEntityError, ValidationError } from '../../../domain/errors/index.js';

function normalizeDia(raw) {
  const s = String(raw || '').trim().toUpperCase();
  const allowed = new Set(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']);
  return allowed.has(s) ? s : null;
}

function normalizeHora(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const hh = String(parseInt(m[1], 10)).padStart(2, '0');
  const mm = m[2];
  const ss = m[3] ?? '00';
  return `${hh}:${mm}:${ss}`;
}

function horaToMinutes(hhmmss) {
  const m = String(hhmmss || '').match(/^(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/**
 * PUT /api/v1/paralelos/:id/schedule
 * Persiste bloques en asignacion_horarios (vía asignaciones_docentes + oferta_cursos).
 */
export class PutParaleloScheduleUseCase {
  constructor({
    parallelRepository,
    courseOfferRepository,
    scheduleRepository,
    teacherAssignmentRepository,
    logger,
  }) {
    this.parallelRepository = parallelRepository;
    this.courseOfferRepository = courseOfferRepository;
    this.scheduleRepository = scheduleRepository;
    this.teacherAssignmentRepository = teacherAssignmentRepository;
    this.logger = logger;
  }

  async execute(input) {
    const paraleloId = Number(input?.paraleloId);
    if (!Number.isFinite(paraleloId) || paraleloId < 1) {
      throw new ValidationError('El paraleloId es inválido');
    }

    const paralelo = await this.parallelRepository.findById(paraleloId);
    if (!paralelo) throw new NotFoundError('Paralelo');

    const pgRows = await sequelize.query(
      `
      SELECT pg.id AS paraleloGestionId, pg.gestion_plan_id AS gestionPlanId
      FROM paralelos_gestion pg
      INNER JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id AND gp.deleted_at IS NULL
      INNER JOIN gestiones g ON g.id = gp.gestion_id AND g.deleted_at IS NULL AND g.vigente = TRUE
      WHERE pg.paralelo_id = :paraleloId
        AND pg.deleted_at IS NULL
        AND pg.activo = TRUE
      ORDER BY pg.id DESC
      LIMIT 1
      `,
      { replacements: { paraleloId }, type: QueryTypes.SELECT }
    );
    const pg = pgRows[0];
    if (!pg?.paraleloGestionId) {
      throw new NotFoundError('Paralelo en gestión vigente');
    }

    const gestionPlanId = Number(pg.gestionPlanId);
    const paraleloGestionId = Number(pg.paraleloGestionId);

    const payloadSchedules = Array.isArray(input?.schedules) ? input.schedules : null;
    if (!payloadSchedules) {
      throw new ValidationError('El body debe incluir `schedules` como array');
    }

    const ofertas = await this.courseOfferRepository.findEnrichedByParallelManagementId(paraleloGestionId);
    const ofertaIdsAllowed = new Set(ofertas.map((o) => Number(o.id)).filter((n) => Number.isFinite(n)));

    const desiredByOferta = new Map();
    const invalidOfertas = [];
    const invalidBloques = [];

    for (const c of payloadSchedules) {
      const ofertaCursoId = Number(c?.cursoId);
      if (!Number.isFinite(ofertaCursoId) || ofertaCursoId < 1 || !ofertaIdsAllowed.has(ofertaCursoId)) {
        invalidOfertas.push(c?.cursoId);
        continue;
      }
      if (desiredByOferta.has(ofertaCursoId)) {
        // Un cursoId repetido sobrescribiría en silencio los bloques del anterior.
        invalidOfertas.push({ cursoId: c.cursoId, reason: 'CURSO_DUPLICADO' });
        continue;
      }

      const bloques = Array.isArray(c?.bloques) ? c.bloques : [];
      const normalized = [];
      const horariosVistos = new Set();

      for (const b of bloques) {
        const dia = normalizeDia(b?.dia);
        const horaInicio = normalizeHora(b?.horaInicio);
        const horaFin = normalizeHora(b?.horaFin);
        if (!dia || !horaInicio || !horaFin) {
          invalidBloques.push({ cursoId: ofertaCursoId, dia: b?.dia, horaInicio: b?.horaInicio, horaFin: b?.horaFin });
          continue;
        }
        const a = horaToMinutes(horaInicio);
        const z = horaToMinutes(horaFin);
        if (a == null || z == null || z <= a) {
          invalidBloques.push({ cursoId: ofertaCursoId, dia, horaInicio, horaFin });
          continue;
        }

        const horario = await this.scheduleRepository.findBy({
          day: dia,
          startTime: horaInicio,
          endTime: horaFin,
          scheduleType: 'CLASES',
        });
        if (!horario?.id) {
          invalidBloques.push({ cursoId: ofertaCursoId, dia, horaInicio, horaFin, reason: 'HORARIO_NO_EXISTE' });
          continue;
        }

        if (horariosVistos.has(Number(horario.id))) {
          invalidBloques.push({ cursoId: ofertaCursoId, dia, horaInicio, horaFin, reason: 'BLOQUE_DUPLICADO' });
          continue;
        }
        horariosVistos.add(Number(horario.id));

        normalized.push({
          horarioId: Number(horario.id),
          dia,
          startMinutes: a,
        });
      }

      normalized.sort((x, y) => {
        if (x.dia !== y.dia) return x.dia.localeCompare(y.dia);
        return x.startMinutes - y.startMinutes;
      });
      const withOrder = normalized.map((b, idx) => ({ ...b, ordenSecuencia: idx + 1 }));
      desiredByOferta.set(ofertaCursoId, withOrder);
    }

    if (invalidOfertas.length) {
      throw new UnprocessableEntityError('Hay ofertas inválidas para este paralelo', [
        { field: 'schedules[].cursoId', invalid: invalidOfertas },
      ]);
    }
    if (invalidBloques.length) {
      throw new UnprocessableEntityError(
        'Hay bloques inválidos. Use horarios del catálogo (día + horaInicio + horaFin).',
        invalidBloques
      );
    }

    const ofertaCursoIds = [...desiredByOferta.keys()];

    const asignacionByOferta = new Map();
    for (const ofertaCursoId of ofertaCursoIds) {
      let asignacion = await AsignacionDocenteModel.findOne({
        where: {
          ofertaCursoId,
          gestionPlanId,
          vigente: true,
          deletedAt: null,
        },
        order: [['id', 'DESC']],
      });
      if (!asignacion) {
        asignacion = await AsignacionDocenteModel.create({
          gestionPlanId,
          ofertaCursoId,
          docenteId: null,
          vigente: true,
          activo: true,
        });
      }
      asignacionByOferta.set(ofertaCursoId, Number(asignacion.id));
    }

    const asignacionIds = [...asignacionByOferta.values()];
    const existingRows = await AsignacionHorarioModel.findAll({
      where: { asignacionDocenteId: asignacionIds },
      attributes: ['id', 'asignacionDocenteId', 'horarioId', 'ordenSecuencia', 'aulaId'],
    });

    const existingByKey = new Map();
    for (const r of existingRows) {
      const ofertaId = [...asignacionByOferta.entries()].find(
        ([, aid]) => aid === Number(r.asignacionDocenteId)
      )?.[0];
      if (ofertaId != null) {
        existingByKey.set(`${ofertaId}-${r.horarioId}`, r);
      }
    }

    const toCreate = [];
    const toUpdate = [];
    const toDeleteIds = [];

    for (const [ofertaCursoId, bloques] of desiredByOferta.entries()) {
      const asignacionDocenteId = asignacionByOferta.get(ofertaCursoId);
      const desiredKeys = new Set();

      for (const b of bloques) {
        const key = `${ofertaCursoId}-${b.horarioId}`;
        desiredKeys.add(key);
        const ex = existingByKey.get(key);
        if (!ex) {
          toCreate.push({
            asignacionDocenteId,
            horarioId: b.horarioId,
            aulaId: null,
            ordenSecuencia: b.ordenSecuencia,
            activo: true,
          });
        } else {
          const needOrden = Number(ex.ordenSecuencia) !== Number(b.ordenSecuencia);
          const needAulaNull = ex.aulaId != null;
          if (needOrden || needAulaNull) {
            toUpdate.push({ id: ex.id, ordenSecuencia: b.ordenSecuencia, aulaId: null });
          }
        }
      }

      for (const ex of existingRows) {
        if (Number(ex.asignacionDocenteId) !== Number(asignacionDocenteId)) continue;
        const key = `${ofertaCursoId}-${ex.horarioId}`;
        if (!desiredKeys.has(key)) {
          toDeleteIds.push(ex.id);
        }
      }
    }

    const result = await sequelize.transaction(async (t) => {
      if (toDeleteIds.length) {
        await AsignacionHorarioModel.destroy({ where: { id: toDeleteIds }, transaction: t });
      }
      if (toCreate.length) {
        await AsignacionHorarioModel.bulkCreate(toCreate, { transaction: t });
      }
      for (const u of toUpdate) {
        await AsignacionHorarioModel.update(
          { ordenSecuencia: u.ordenSecuencia, aulaId: u.aulaId },
          { where: { id: u.id }, transaction: t }
        );
      }
      return {
        paraleloId,
        created: toCreate.length,
        updated: toUpdate.length,
        deleted: toDeleteIds.length,
      };
    });

    this.logger.info('[Académico] Plan semanal persistido (asignacion_horarios)', result);
    return { persistencia: result };
  }
}
