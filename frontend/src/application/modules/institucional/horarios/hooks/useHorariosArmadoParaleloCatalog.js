import { useCallback, useEffect, useState } from 'react';
import { useOfertaAcademicaApi } from '@application-institucional/oferta';

function pickParaleloId(row) {
  return Number(row?.paraleloId ?? row?.paralelo_id ?? row?.parallelId);
}

/**
 * Catálogo de paralelos en gestión para el selector de armado (por gestión académica).
 */
export function useHorariosArmadoParaleloCatalog(gestionId) {
  const { fetchPlanesHabilitados, fetchParalelosGestion } = useOfertaAcademicaApi();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const gId = Number(gestionId);
    if (!Number.isFinite(gId) || gId < 1) {
      setOptions([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const planesRes = await fetchPlanesHabilitados(gId);
    if (!planesRes.success) {
      setError(planesRes.error || 'No se pudieron cargar los planes');
      setOptions([]);
      setLoading(false);
      return;
    }

    const planes = planesRes.data?.planesHabilitados ?? [];
    const collected = [];

    for (const plan of planes) {
      const planId = Number(plan.id ?? plan.gestionPlanId);
      if (!Number.isFinite(planId)) continue;

      const pgRes = await fetchParalelosGestion(planId);
      if (!pgRes.success) continue;

      const list = pgRes.data?.paralelosGestion ?? [];
      for (const pg of list) {
        const pgId = Number(pg.id);
        const paraleloId = pickParaleloId(pg);
        if (!Number.isFinite(pgId) || pgId < 1) continue;

        const nombre = pg.paraleloNombre ?? pg.paralelo_nombre ?? `Paralelo #${paraleloId || pgId}`;
        const turno = pg.turno ?? '';
        collected.push({
          value: pgId,
          paraleloGestionId: pgId,
          paraleloId: Number.isFinite(paraleloId) ? paraleloId : null,
          label: turno ? `${nombre} · ${turno}` : nombre,
          turno,
          planNombre: plan.nombre ?? plan.planNombre ?? null,
        });
      }
    }

    collected.sort((a, b) => String(a.label).localeCompare(String(b.label), 'es'));
    setOptions(collected);
    setLoading(false);
  }, [fetchPlanesHabilitados, fetchParalelosGestion, gestionId]);

  useEffect(() => {
    load();
  }, [load]);

  return { options, loading, error, reload: load };
}
