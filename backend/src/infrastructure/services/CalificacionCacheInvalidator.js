/**
 * Invalidación de caché Redis del consolidado (cuando esté configurado).
 * Por ahora es no-op documentado; el cliente se conectará en fase consolidado.
 */

const PREFIX = 'consolidado:asignacion:';

export async function invalidarCacheConsolidado(asignacionId, gestionId = null) {
  // TODO: conectar ioredis cuando REDIS_URL esté en entorno
  if (process.env.REDIS_URL) {
    // eslint-disable-next-line no-console
    console.debug('[Calificaciones] invalidarCacheConsolidado pendiente Redis', {
      key: `${PREFIX}${asignacionId}:gestion:${gestionId ?? '*'}`,
    });
  }
}
