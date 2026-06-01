/**
 * Normaliza planes de GET /paralelos/dashboard/horarios-publicacion
 * tras columnas paralelo_gestion en vista 84.
 */
export function mapHorariosPublicacionPlanesPayload(payload) {
  const planes = Array.isArray(payload?.planes) ? payload.planes : [];
  return planes.map((plan) => {
    const paralelo = plan?.paralelo ?? {};
    const pgId = paralelo.paraleloGestionId ?? paralelo.paralelo_gestion_id ?? null;
    const pgEstado =
      paralelo.paraleloGestionEstado ?? paralelo.paralelo_gestion_estado ?? null;
    return {
      ...plan,
      paralelo: {
        ...paralelo,
        paraleloGestionId: pgId != null ? Number(pgId) : null,
        paraleloGestionEstado: pgEstado,
      },
    };
  });
}
