import { ESTADOS_PARALELO_GESTION } from '../../../domain/constants/oferta.constants.js';

/**
 * Auto-transición BORRADOR → OFERTADO de un paralelo de gestión.
 *
 * Regla de negocio: un paralelo queda ofertado automáticamente cuando tiene aula
 * asignada Y todas sus oferta_cursos tienen docente vigente. Así el usuario no
 * marca «ofertar» a mano; el único cambio manual posterior es publicar el horario.
 *
 * Best-effort: si no corresponde, es no-op; ante cualquier error se registra y se
 * ignora para no romper la operación que la disparó (asignar docente / aula).
 *
 * @param {{ parallelManagementRepository: object, courseOfferRepository: object, logger?: object }} deps
 * @param {number} paraleloGestionId
 * @param {number|null} userId
 * @returns {Promise<object|null>} el paralelo actualizado, o null si no se ofertó
 */
export async function autoOfertarParaleloGestion(deps, paraleloGestionId, userId = null) {
  const { parallelManagementRepository, courseOfferRepository, logger } = deps || {};
  const pgId = Number(paraleloGestionId);
  if (!Number.isFinite(pgId) || pgId < 1) return null;
  if (!parallelManagementRepository || !courseOfferRepository) return null;

  try {
    const pg = await parallelManagementRepository.findById(pgId);
    if (!pg) return null;
    const estado = pg.state ?? pg.estado ?? null;
    if (estado !== ESTADOS_PARALELO_GESTION.BORRADOR) return null;

    const classroomId = pg.classroomId ?? pg.aulaId ?? null;
    if (!classroomId) return null;

    const cobertura = await courseOfferRepository.findCoberturaDocenteByParallelManagementId(pgId);
    if (!cobertura || cobertura.cursosTotal === 0) return null;
    if (cobertura.cursosConDocente !== cobertura.cursosTotal) return null;

    const updated = await parallelManagementRepository.update(
      pgId,
      { state: ESTADOS_PARALELO_GESTION.OFERTADO },
      userId,
    );
    logger?.info?.('[Oferta] Paralelo auto-ofertado (aula + docentes completos)', {
      paraleloGestionId: pgId,
    });
    return updated;
  } catch (err) {
    logger?.warn?.('[Oferta] No se pudo auto-ofertar el paralelo', {
      paraleloGestionId: pgId,
      error: err?.message,
    });
    return null;
  }
}
