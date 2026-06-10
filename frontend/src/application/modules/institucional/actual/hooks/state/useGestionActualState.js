/**
 * Estado del PANEL de Gestión actual (solo lectura).
 *
 * Muestra la gestión vigente, KPIs globales y la línea de tiempo de bimestres
 * con sus fechas y estado. Las acciones (iniciar gestión / cerrar bimestre) viven
 * en la página de Control de bimestres (`/institucional/actual/bimestres`).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGestionActivacionApi } from '../api/useGestionActivacionApi.js';
import { gestionActivacionStatus } from '../../utils/gestionActivacionStatus.js';
import { buildBimestresTimeline } from '../../utils/bimestresTimeline.js';
import { resolverFaseGestion } from '../../utils/resolverFaseGestion.js';
import { actualPaths } from '../../config/paths.js';

export function useGestionActualState() {
  const navigate = useNavigate();
  const { loading, fetchGestionVigente, fetchEstadoActivacion } = useGestionActivacionApi();

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [error, setError] = useState(null);
  const [gestionVigente, setGestionVigente] = useState(null);
  const [estadoPayload, setEstadoPayload] = useState(null);

  const cargar = useCallback(async () => {
    setCargandoInicial(true);
    setError(null);
    try {
      const vigenteResult = await fetchGestionVigente();
      if (!vigenteResult.success) {
        setError(vigenteResult.error || 'No se pudo cargar la gestión vigente.');
      } else {
        setGestionVigente(vigenteResult.data);
      }
      const estadoResult = await fetchEstadoActivacion();
      setEstadoPayload(estadoResult?.success ? estadoResult.data : estadoResult?.data ?? null);
    } finally {
      setCargandoInicial(false);
    }
  }, [fetchGestionVigente, fetchEstadoActivacion]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const estado = useMemo(() => gestionActivacionStatus(estadoPayload), [estadoPayload]);

  const timeline = useMemo(
    () => buildBimestresTimeline(estadoPayload?.bimestres),
    [estadoPayload],
  );

  const fase = useMemo(
    () =>
      resolverFaseGestion({
        gestionIniciada: Boolean(estadoPayload?.gestionIniciada),
        bimestres: estadoPayload?.bimestres ?? [],
        bimestreVigente: estadoPayload?.bimestreVigente,
      }),
    [estadoPayload],
  );

  const kpis = useMemo(() => {
    const m = estadoPayload?.metricasGlobales ?? {};
    return {
      matriculasCursando: estado.matriculasCursando,
      totalCursos: m.totalCursos ?? null,
      totalDocentes: m.totalDocentes ?? null,
      bimestreVigente: estadoPayload?.bimestreVigente ?? null,
    };
  }, [estadoPayload, estado.matriculasCursando]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
      { title: 'Gestión actual' },
    ],
    [],
  );

  return {
    loading: cargandoInicial || loading,
    error,
    gestionVigente,
    iniciada: estado.iniciada,
    estadoLabel: estado.estadoLabel,
    estadoColor: estado.estadoColor,
    timeline,
    kpis,
    fase,
    breadcrumbItems,
    pageTitle: 'Gestión actual',
    goToControl: useCallback(() => navigate(actualPaths.bimestres()), [navigate]),
  };
}
