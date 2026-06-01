import { QueryTypes } from 'sequelize';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { AsignacionHorario as AsignacionHorarioModel } from '../../../infrastructure/database/models/asignacion_horario.js';
import { NotFoundError, ValidationError } from '../../../domain/errors/index.js';
import { TURNOS_VALUES } from '../../../domain/constants/cursos.constants.js';
import { TURNOS_EDITABLES_PARALELO_GESTION } from '../../../domain/constants/oferta.constants.js';
import { assertParaleloGestionHorarioEditable } from '../../utils/horarios/assertParaleloGestionHorarioEditable.js';
import { entityToPresentation } from '../../mappers/oferta/ParallelManagementPresentationMapper.js';

/**
 * PUT /paralelos-gestion/:id/cambiar-turno-con-bloques
 * Re-mapea bloques por número de bloque y día al catálogo del turno destino.
 */
export class CambiarTurnoParaleloGestionConBloquesUseCase {
  constructor({
    parallelManagementRepository,
    grillaBloqueViewRepository,
    scheduleRepository,
    logger,
  }) {
    this.parallelManagementRepository = parallelManagementRepository;
    this.grillaBloqueViewRepository = grillaBloqueViewRepository;
    this.scheduleRepository = scheduleRepository;
    this.logger = logger;
  }

  async execute(id, { turno }, userId = null) {
    if (!turno || !TURNOS_VALUES.includes(turno)) {
      throw new ValidationError('turno inválido');
    }

    const pgId = Number(id);
    const pg = await this.parallelManagementRepository.findById(pgId);
    if (!pg) throw new NotFoundError('Paralelo en gestión');

    if (!TURNOS_EDITABLES_PARALELO_GESTION.includes(pg.state)) {
      throw new ValidationError(
        'No se puede cambiar el turno cuando el paralelo está PUBLICADO o CERRADO'
      );
    }

    assertParaleloGestionHorarioEditable(pg.state);

    const turnoActual = pg.shift;
    if (turnoActual === turno) {
      return {
        paralelo_gestion: entityToPresentation(pg),
        bloques_remapeados: 0,
        advertencias: [],
      };
    }

    const bloques = await this.grillaBloqueViewRepository.findByParaleloGestionId(pgId);
    const advertencias = [];
    const updates = [];

    for (const b of bloques) {
      const dia = b.dia;
      const numeroBloque = Number(b.numeroBloque);
      const bloqueId = Number(b.asignacionHorarioId);

      if (dia === 'SABADO') {
        advertencias.push({
          asignacion_horario_id: bloqueId,
          mensaje: 'Bloque de sábado no se re-mapea automáticamente; revise manualmente',
        });
        continue;
      }

      if (!Number.isFinite(numeroBloque) || numeroBloque < 1) {
        advertencias.push({
          asignacion_horario_id: bloqueId,
          mensaje: 'Bloque sin número de orden; no se pudo re-mapear',
        });
        continue;
      }

      const destino = await this.scheduleRepository.findBy({
        shift: turno,
        day: dia,
        blockNumber: numeroBloque,
        scheduleType: 'CLASES',
      });

      if (!destino?.id) {
        throw new ValidationError(
          `El turno ${turno} no tiene bloque #${numeroBloque} para ${dia}. Elimine bloques excedentes antes de cambiar el turno.`
        );
      }

      if (Number(destino.id) !== Number(b.horarioId)) {
        updates.push({ id: bloqueId, horarioId: Number(destino.id) });
      }
    }

    const maxBloqueDestino = await sequelize.query(
      `
      SELECT MAX(numero_bloque) AS maxBloque
      FROM horarios
      WHERE turno = :turno
        AND tipo_horario = 'CLASES'
        AND deleted_at IS NULL
        AND activo = TRUE
        AND dia <> 'SABADO'
      `,
      { replacements: { turno }, type: QueryTypes.SELECT }
    );
    const maxDest = Number(maxBloqueDestino[0]?.maxBloque ?? 0);
    const maxOrigen = bloques
      .filter((b) => b.dia !== 'SABADO')
      .reduce((m, b) => Math.max(m, Number(b.numeroBloque) || 0), 0);

    if (maxOrigen > maxDest) {
      throw new ValidationError(
        `El turno ${turno} tiene menos bloques (${maxDest}) que el actual (${maxOrigen}). Elimine bloques excedentes primero.`
      );
    }

    await sequelize.transaction(async (t) => {
      for (const u of updates) {
        await AsignacionHorarioModel.update(
          { horarioId: u.horarioId },
          { where: { id: u.id }, transaction: t }
        );
      }
      await this.parallelManagementRepository.update(pgId, { shift: turno }, userId);
    });

    const updated = await this.parallelManagementRepository.findById(pgId);

    this.logger.info('[Horarios] Turno con re-mapeo de bloques', {
      paraleloGestionId: pgId,
      turnoAnterior: turnoActual,
      turnoNuevo: turno,
      bloquesRemapeados: updates.length,
      advertencias: advertencias.length,
    });

    return {
      paralelo_gestion: entityToPresentation(updated),
      bloques_remapeados: updates.length,
      advertencias,
    };
  }
}
