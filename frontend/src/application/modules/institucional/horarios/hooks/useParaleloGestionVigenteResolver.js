import { useCallback, useEffect, useState } from 'react';
import { useOfertaAcademicaApi } from '@application-institucional/oferta';

function pickParaleloId(row) {
  return Number(row?.paraleloId ?? row?.paralelo_id ?? row?.parallelId);
}

/**
 * Resuelve paralelo_gestion de la gestión vigente a partir del id del paralelo maestro (URL armado).
 */
export function useParaleloGestionVigenteResolver(paraleloMaestroId) {
  const {
    fetchGestiones,
    fetchPlanesHabilitados,
    fetchParalelosGestion,
    fetchParaleloGestionDetalle,
  } = useOfertaAcademicaApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paraleloGestionId, setParaleloGestionId] = useState(null);
  const [gestionPlanId, setGestionPlanId] = useState(null);
  const [meta, setMeta] = useState(null);

  const resolve = useCallback(async () => {
    const pid = Number(paraleloMaestroId);
    if (!Number.isFinite(pid) || pid < 1) {
      setParaleloGestionId(null);
      setGestionPlanId(null);
      setMeta(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const gestRes = await fetchGestiones();
    if (!gestRes.success) {
      setError(gestRes.error || 'No se pudieron cargar las gestiones');
      setLoading(false);
      return;
    }

    const gestiones = gestRes.data?.gestiones ?? gestRes.data?.managements ?? [];
    const listG = Array.isArray(gestiones) ? gestiones : [];
    const vigente = listG.find((g) => g.vigente) ?? listG[0];
    if (!vigente?.id) {
      setError('No hay gestión académica vigente. Configure la oferta en Institucional → Oferta académica.');
      setLoading(false);
      return;
    }

    const planesRes = await fetchPlanesHabilitados(vigente.id);
    if (!planesRes.success) {
      setError(planesRes.error || 'No se pudieron cargar los planes habilitados');
      setLoading(false);
      return;
    }

    const planes = planesRes.data?.planesHabilitados ?? [];
    for (const plan of planes) {
      const pgRes = await fetchParalelosGestion(plan.id);
      if (!pgRes.success) continue;
      const paralelos = pgRes.data?.paralelosGestion ?? [];
      const match = paralelos.find((pg) => pickParaleloId(pg) === pid);
      if (!match?.id) continue;

      const detRes = await fetchParaleloGestionDetalle(match.id);
      const det = detRes.success
        ? detRes.data?.paralelo_gestion ?? detRes.data?.paraleloGestion ?? match
        : match;

      setParaleloGestionId(Number(match.id));
      setGestionPlanId(Number(plan.id));
      setMeta({
        nombre: det.paraleloNombre ?? det.paralelo_nombre ?? match.paraleloNombre ?? null,
        turno: det.turno ?? match.turno ?? null,
        aulaCodigo: det.aulaCodigo ?? det.aula_codigo ?? match.aulaCodigo ?? null,
        gestionNombre: vigente.nombre ?? vigente.codigo ?? null,
        planNombre: plan.nombre ?? plan.planNombre ?? null,
      });
      setError(null);
      setLoading(false);
      return;
    }

    setParaleloGestionId(null);
    setGestionPlanId(null);
    setMeta(null);
    setError(
      'Este paralelo no está habilitado en la gestión vigente. Agregue el paralelo en Institucional → Oferta académica.'
    );
    setLoading(false);
  }, [
    fetchGestiones,
    fetchPlanesHabilitados,
    fetchParalelosGestion,
    fetchParaleloGestionDetalle,
    paraleloMaestroId,
  ]);

  useEffect(() => {
    resolve();
  }, [resolve]);

  return {
    loading,
    error,
    paraleloGestionId,
    gestionPlanId,
    meta,
    reload: resolve,
  };
}
