/**
 * Estado de pantalla — Consolidado % de asistencia por paralelo (ACA-ASI-CONS).
 *
 * Eje = paralelo en gestión vigente elegido en un Select (a diferencia del
 * Centralizador, que lo recibe por URL) + alcance temporal: un bimestre (1..4)
 * o el ACUMULADO ANUAL (bimestre null, valor por defecto). La matriz llega de
 * GET /v1/asistencia/consolidado ya pivotada (patrón centralizador):
 * `asignaturas` = columnas, `estudiantes` = filas con
 * `asistencia[ofertaCursoId]` y `promedioPct`.
 *
 * Los paralelos del Select reusan el dashboard de estado (mismo origen que el
 * Centralizador P1); la normalización se importa de ese módulo para no
 * duplicarla. Toda la orquestación vive aquí; la página solo compone.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCasesFactory } from '@container';
import { useParalelosEstadoApi } from '@application-shared/hooks';
import {
  normalizarParalelosCentralizador,
  etiquetaParalelo,
} from '@application-academico/centralizador/utils/paraleloCentralizador.js';

export const useConsolidadoAsistenciaPage = () => {
  // ---- Paralelos en gestión vigente (Select) ----
  const {
    paralelosEstadoDashboard,
    loading: paralelosLoading,
    error: paralelosError,
    refetch: refetchParalelos,
  } = useParalelosEstadoApi();

  const paralelos = useMemo(
    () => normalizarParalelosCentralizador(paralelosEstadoDashboard?.paralelos),
    [paralelosEstadoDashboard],
  );

  const paraleloOptions = useMemo(
    () =>
      paralelos.map((p) => ({
        value: p.paraleloGestionId,
        label: etiquetaParalelo(p) ?? `Paralelo ${p.paraleloGestionId}`,
        disabled: (p.cantidadEstudiantes ?? 0) === 0,
      })),
    [paralelos],
  );

  const [paraleloGestionId, setParaleloGestionId] = useState(null);
  /** null = acumulado anual (por defecto); 1..4 = bimestre puntual. */
  const [bimestre, setBimestre] = useState(null);

  const paraleloSeleccionado = useMemo(
    () => paralelos.find((p) => p.paraleloGestionId === paraleloGestionId) ?? null,
    [paralelos, paraleloGestionId],
  );

  // ---- Matriz del consolidado ----
  const [asignaturas, setAsignaturas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [gestionAnio, setGestionAnio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (pgId, bim) => {
    if (pgId == null) {
      setAsignaturas([]);
      setEstudiantes([]);
      setGestionAnio(null);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.obtenerConsolidadoAsistencia();
      const result = await uc.ejecutar({ paraleloGestionId: pgId, bimestre: bim });
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el consolidado de asistencia');
      }
      const data = result.data ?? {};
      setAsignaturas(Array.isArray(data.asignaturas) ? data.asignaturas : []);
      setEstudiantes(Array.isArray(data.estudiantes) ? data.estudiantes : []);
      setGestionAnio(data.gestionAnio ?? null);
    } catch (err) {
      setError(err?.message || String(err));
      setAsignaturas([]);
      setEstudiantes([]);
      setGestionAnio(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar(paraleloGestionId, bimestre);
  }, [cargar, paraleloGestionId, bimestre]);

  const refetch = useCallback(
    () => cargar(paraleloGestionId, bimestre),
    [cargar, paraleloGestionId, bimestre],
  );

  return {
    // Selectores
    paraleloOptions,
    paralelosLoading,
    paralelosError,
    refetchParalelos,
    paraleloGestionId,
    setParaleloGestionId,
    paraleloSeleccionado,
    bimestre,
    setBimestre,
    // Matriz
    asignaturas,
    estudiantes,
    gestionAnio,
    isLoading,
    error,
    refetch,
  };
};

export default useConsolidadoAsistenciaPage;
