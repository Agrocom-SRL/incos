import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { CursoHorario as CursoHorarioModel } from '../../../infrastructure/database/models/curso_horario.js';
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
 *
 * Reemplaza el plan semanal (bloques) del paralelo a nivel maestro (`cursos_horarios`).
 * - Omite aula_id (se setea NULL siempre).
 * - Solo admite bloques que existan en la tabla `horarios` (por día + horaInicio + horaFin, tipo CLASES).
 * - Diferencia creación / actualización / eliminación comparando con el estado actual.
 */
export class PutParaleloScheduleUseCase {
  constructor({
    parallelRepository,
    courseRepository,
    scheduleRepository,
    courseScheduleRepository,
    logger,
  }) {
    this.parallelRepository = parallelRepository;
    this.courseRepository = courseRepository;
    this.scheduleRepository = scheduleRepository;
    this.courseScheduleRepository = courseScheduleRepository;
    this.logger = logger;
  }

  /**
   * @param {{ paraleloId: number, schedules: Array<{ cursoId: number, bloques?: Array<{ dia: string, horaInicio: string, horaFin: string }> }> }} input
   */
  async execute(input) {
    const paraleloId = Number(input?.paraleloId);
    if (!Number.isFinite(paraleloId) || paraleloId < 1) {
      throw new ValidationError('El paraleloId es inválido');
    }

    const paralelo = await this.parallelRepository.findById(paraleloId);
    if (!paralelo) throw new NotFoundError('Paralelo');

    const payloadSchedules = Array.isArray(input?.schedules) ? input.schedules : null;
    if (!payloadSchedules) {
      throw new ValidationError('El body debe incluir `schedules` como array');
    }

    // Cursos válidos del paralelo (maestro de oferta)
    const { courses } = await this.courseRepository.findAll({ parallelId: paraleloId });
    const cursoIdsAllowed = new Set((courses || []).map((c) => Number(c.id)).filter((n) => Number.isFinite(n)));

    // Normalizar y validar bloques -> (cursoId, horarioId, ordenSecuencia)
    const desiredByCurso = new Map(); // cursoId -> Array<{ horarioId, dia, startMinutes, ordenSecuencia }>
    const invalidCursos = [];
    const invalidBloques = [];

    for (const c of payloadSchedules) {
      const cursoId = Number(c?.cursoId);
      if (!Number.isFinite(cursoId) || cursoId < 1 || !cursoIdsAllowed.has(cursoId)) {
        invalidCursos.push(c?.cursoId);
        continue;
      }

      const bloques = Array.isArray(c?.bloques) ? c.bloques : [];
      const normalized = [];

      for (const b of bloques) {
        const dia = normalizeDia(b?.dia);
        const horaInicio = normalizeHora(b?.horaInicio);
        const horaFin = normalizeHora(b?.horaFin);
        if (!dia || !horaInicio || !horaFin) {
          invalidBloques.push({ cursoId, dia: b?.dia, horaInicio: b?.horaInicio, horaFin: b?.horaFin });
          continue;
        }
        const a = horaToMinutes(horaInicio);
        const z = horaToMinutes(horaFin);
        if (a == null || z == null || z <= a) {
          invalidBloques.push({ cursoId, dia, horaInicio, horaFin });
          continue;
        }

        // Debe existir en `horarios` (semilla / catálogo)
        const horario = await this.scheduleRepository.findBy({
          day: dia,
          startTime: horaInicio,
          endTime: horaFin,
          scheduleType: 'CLASES',
        });
        if (!horario?.id) {
          invalidBloques.push({ cursoId, dia, horaInicio, horaFin, reason: 'HORARIO_NO_EXISTE' });
          continue;
        }

        normalized.push({
          horarioId: Number(horario.id),
          dia,
          startMinutes: a,
        });
      }

      // Orden determinístico: día + horaInicio
      normalized.sort((x, y) => {
        if (x.dia !== y.dia) return x.dia.localeCompare(y.dia);
        return x.startMinutes - y.startMinutes;
      });
      const withOrder = normalized.map((b, idx) => ({ ...b, ordenSecuencia: idx + 1 }));
      desiredByCurso.set(cursoId, withOrder);
    }

    if (invalidCursos.length) {
      throw new UnprocessableEntityError('Hay cursos inválidos para este paralelo', [
        { field: 'schedules[].cursoId', invalid: invalidCursos },
      ]);
    }
    if (invalidBloques.length) {
      throw new UnprocessableEntityError(
        'Hay bloques inválidos. Asegúrese de usar horarios existentes del catálogo (día + horaInicio + horaFin).',
        invalidBloques,
      );
    }

    const cursoIds = [...desiredByCurso.keys()];

    // Estado actual (solo los cursos en el payload)
    const existingRows = await CursoHorarioModel.findAll({
      where: { cursoId: cursoIds },
      attributes: ['id', 'cursoId', 'horarioId', 'ordenSecuencia', 'aulaId'],
    });

    const existingByKey = new Map(); // key cursoId-horarioId -> row
    for (const r of existingRows) {
      existingByKey.set(`${r.cursoId}-${r.horarioId}`, r);
    }

    const toCreate = [];
    const toUpdate = [];
    const toDeleteIds = [];

    // Detect create/update
    for (const [cursoId, bloques] of desiredByCurso.entries()) {
      const desiredKeys = new Set();
      for (const b of bloques) {
        const key = `${cursoId}-${b.horarioId}`;
        desiredKeys.add(key);
        const ex = existingByKey.get(key);
        if (!ex) {
          toCreate.push({
            cursoId,
            horarioId: b.horarioId,
            aulaId: null,
            ordenSecuencia: b.ordenSecuencia,
            activo: true,
          });
        } else {
          const nextOrden = Number(b.ordenSecuencia);
          const needOrden = Number(ex.ordenSecuencia) !== nextOrden;
          const needAulaNull = ex.aulaId != null;
          if (needOrden || needAulaNull) {
            toUpdate.push({ id: ex.id, ordenSecuencia: nextOrden, aulaId: null });
          }
        }
      }

      // Detect deletions for this curso
      for (const ex of existingRows) {
        if (Number(ex.cursoId) !== Number(cursoId)) continue;
        const key = `${ex.cursoId}-${ex.horarioId}`;
        if (!desiredKeys.has(key)) {
          toDeleteIds.push(ex.id);
        }
      }
    }

    const result = await sequelize.transaction(async (t) => {
      // Deletes
      if (toDeleteIds.length) {
        await CursoHorarioModel.destroy({ where: { id: toDeleteIds }, transaction: t });
      }
      // Creates
      if (toCreate.length) {
        await CursoHorarioModel.bulkCreate(toCreate, { transaction: t });
      }
      // Updates (orden / aula)
      for (const u of toUpdate) {
        await CursoHorarioModel.update(
          { ordenSecuencia: u.ordenSecuencia, aulaId: u.aulaId },
          { where: { id: u.id }, transaction: t },
        );
      }
      return {
        paraleloId,
        created: toCreate.length,
        updated: toUpdate.length,
        deleted: toDeleteIds.length,
      };
    });

    this.logger.info('[Académico] Plan semanal persistido (cursos_horarios)', result);

    // Respuesta útil para UI: resumen + el schedule actualizado via query del use case GET
    // (el controller puede decidir si rehidrata con GET; por ahora devolvemos el resumen)
    return { persistencia: result };
  }
}

