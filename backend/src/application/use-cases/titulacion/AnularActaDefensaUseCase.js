import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ESTADOS_ACTA_DEFENSA } from '../../../domain/constants/titulacion.constants.js';
import { ActaDefensaMapper } from '../../mappers/titulacion/index.js';

/**
 * Use Case: AnularActaDefensaUseCase
 * Módulo: Titulación (TIT), extensión 2026-08-02 (acta de defensa de grado, P8)
 *
 * Anula un acta EMITIDA (decisión administrativa manual, permiso
 * `titulacion.proyecto`·APROBAR — mismo criterio que registrar el acta,
 * Bloque B/P6 del plan). NO revierte la transición del proyecto: el
 * `estado`/`notaDefensa`/`fechaDefensa` de `proyectos_grado` quedan
 * intactos — la corrección de estado del proyecto, si hiciera falta, es una
 * decisión manual documentada aparte (P8 resuelta en
 * `docs/plan/acta-defensa-grado-plan-desarrollo.md`).
 *
 * El motivo se antepone a `observaciones` (patrón "ANULADA: {motivo}") en
 * vez de sobrescribirla, para no perder una observación previa del acto
 * (aunque en la práctica hoy siempre llega NULL al registrar).
 */
export class AnularActaDefensaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.actaDefensaRepository
   * @param {ILogger} params.logger
   */
  constructor({ actaDefensaRepository, logger }) {
    this.actaDefensaRepository = actaDefensaRepository;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @param {number} actaId
   * @param {string} motivo - Motivo de la anulación (requerido, no vacío)
   * @param {number|null} userId
   * @returns {Promise<{actaDefensa: Object}>}
   */
  async execute(proyectoGradoId, actaId, motivo, userId = null) {
    if (!motivo || !String(motivo).trim()) {
      throw new ValidationError('motivo es requerido para anular el acta de defensa');
    }

    const acta = await this.actaDefensaRepository.findById(actaId);
    if (!acta || Number(acta.proyectoGradoId) !== Number(proyectoGradoId)) {
      throw new NotFoundError(`acta de defensa con ID ${actaId} del proyecto ${proyectoGradoId}`);
    }

    if (acta.estado === ESTADOS_ACTA_DEFENSA.ANULADA) {
      throw new ConflictError('El acta ya fue anulada');
    }

    const motivoTrimmed = String(motivo).trim();
    const observacionesPrevias = acta.observaciones ? String(acta.observaciones).trim() : '';
    const observaciones = observacionesPrevias
      ? `ANULADA: ${motivoTrimmed} | ${observacionesPrevias}`
      : `ANULADA: ${motivoTrimmed}`;

    await this.actaDefensaRepository.update(
      actaId,
      { estado: ESTADOS_ACTA_DEFENSA.ANULADA, observaciones },
      userId
    );
    const actualizada = await this.actaDefensaRepository.findByIdWithTribunal(actaId);

    this.logger.info('[Titulación] Acta de defensa anulada (decisión administrativa manual)', {
      proyectoGradoId,
      actaId,
      estudianteId: acta.estudianteId,
    });

    return { actaDefensa: ActaDefensaMapper.toDetail(actualizada) };
  }
}
