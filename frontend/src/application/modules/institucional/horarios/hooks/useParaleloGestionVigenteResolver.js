import { useCallback, useEffect, useState } from 'react';
import { useOfertaAcademicaApi } from '@application-institucional/oferta';

function pickParaleloId(row) {
  return Number(row?.paraleloId ?? row?.paralelo_id ?? row?.parallelId);
}

/**
 * Resuelve paralelo_gestion de la gestión vigente a partir del id del paralelo maestro (URL armado).
 * @param {number|null} paraleloMaestroId — id en tabla `paralelos`
 * @param {{ gestionVigenteId?: number|null }} [options] — catálogo compartido (evita depender solo de fetchGestiones de oferta)
 */
export function useParaleloGestionVigenteResolver(paraleloMaestroId, options = {}) {
  const { gestionVigenteId: gestionVigenteIdOpt } = options;
  const {
    fetchGestionesSilent,
    fetchPlanesHabilitadosSilent,
    fetchParalelosGestionSilent,
    fetchParaleloGestionDetalleSilent,
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

    try {
      let vigenteId =
        gestionVigenteIdOpt != null && Number.isFinite(Number(gestionVigenteIdOpt)) && Number(gestionVigenteIdOpt) > 0
          ? Number(gestionVigenteIdOpt)
          : null;
      let vigenteNombre = null;

      if (!vigenteId) {
        const gestRes = await fetchGestionesSilent();
        if (!gestRes.success) {
          setError(gestRes.error || 'No se pudieron cargar las gestiones');
          return;
        }

        const gestiones = gestRes.data?.gestiones ?? gestRes.data?.managements ?? [];
        const listG = Array.isArray(gestiones) ? gestiones : [];
        const vigente = listG.find((g) => g.vigente) ?? listG[0];
        if (!vigente?.id) {
          setError('No hay gestión académica vigente. Configure la oferta en Institucional → Oferta académica.');
          return;
        }
        vigenteId = Number(vigente.id);
        vigenteNombre = vigente.nombre ?? vigente.codigo ?? null;
      }

      const planesRes = await fetchPlanesHabilitadosSilent(vigenteId);
      if (!planesRes.success) {
        setError(planesRes.error || 'No se pudieron cargar los planes habilitados');
        return;
      }

      const planes = planesRes.data?.planesHabilitados ?? [];
      const pgResults = await Promise.all(
        planes.map(async (plan) => {
          const pgRes = await fetchParalelosGestionSilent(plan.id);
          return { plan, pgRes };
        }),
      );

      for (const { plan, pgRes } of pgResults) {
        if (!pgRes.success) continue;
        const paralelos = pgRes.data?.paralelosGestion ?? [];
        const match = paralelos.find((pg) => pickParaleloId(pg) === pid);
        if (!match?.id) continue;

        const detRes = await fetchParaleloGestionDetalleSilent(match.id);
        const det = detRes.success
          ? detRes.data?.paralelo_gestion ?? detRes.data?.paraleloGestion ?? match
          : match;

        setParaleloGestionId(Number(match.id));
        setGestionPlanId(Number(plan.id));
        setMeta({
          paraleloMaestroId: pid,
          nombre: det.paraleloNombre ?? det.paralelo_nombre ?? match.paraleloNombre ?? null,
          turno: det.turno ?? match.turno ?? null,
          estado: det.estado ?? det.state ?? match.estado ?? match.state ?? null,
          aulaCodigo: det.aulaCodigo ?? det.aula_codigo ?? match.aulaCodigo ?? null,
          carreraNombre: det.carreraNombre ?? det.carrera_nombre ?? null,
          carreraCodigo: det.carreraCodigo ?? det.carrera_codigo ?? null,
          carreraImagenRuta: det.carreraImagenRuta ?? det.carrera_imagen_ruta ?? null,
          periodoNombre: det.periodoNombre ?? det.periodo_nombre ?? null,
          periodoNumero: det.periodoNumero ?? det.periodo_numero ?? null,
          descripcion: det.paraleloDescripcion ?? det.paralelo_descripcion ?? null,
          gestionNombre: vigenteNombre,
          planNombre: plan.nombre ?? plan.planNombre ?? null,
        });
        setError(null);
        return;
      }

      setParaleloGestionId(null);
      setGestionPlanId(null);
      setMeta(null);
      setError(
        'Este paralelo no está habilitado en la gestión vigente. Agregue el paralelo en Institucional → Oferta académica.'
      );
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [
    fetchGestionesSilent,
    fetchPlanesHabilitadosSilent,
    fetchParalelosGestionSilent,
    fetchParaleloGestionDetalleSilent,
    paraleloMaestroId,
    gestionVigenteIdOpt,
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
