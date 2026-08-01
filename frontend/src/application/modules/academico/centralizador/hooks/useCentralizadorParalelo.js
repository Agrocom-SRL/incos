/**
 * Estado de pantalla — Centralizador de calificaciones por paralelo (P2 y P3).
 *
 * Eje = paralelo en gestión vigente (NO docente/curso). El `paraleloGestionId`
 * llega por la URL (`/centralizador/:paraleloGestionId[/bimestre/:n]`), no por un
 * Select. Carga la matriz estudiantes × asignaturas desde
 * GET /v1/calificaciones/centralizador?paraleloGestionId=<id>.
 *
 * P2 (resultado anual) y P3 (matriz por bimestre) consumen `asignaturas` +
 * `estudiantes`; P2 muestra la nota anual por asignatura y P3 filtra por `:n`.
 *
 * Toda la orquestación vive aquí; la página solo compone (incos-frontend-module §2).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { useParalelosEstadoApi } from '@application-shared/hooks';
import {
  normalizarParalelosCentralizador,
  etiquetaParaleloCorta,
} from '../utils/paraleloCentralizador.js';
import { nombreBimestre } from '../utils/centralizadorDoc.js';
import { createCentralizadorBreadcrumbItems } from '../utils/centralizadorBreadcrumbs.js';

/** Nota mínima de aprobación por defecto si la política aún no la define. */
const NOTA_MINIMA_FALLBACK = 61;

/** Bimestres del régimen anual del centralizador. */
export const BIMESTRES_CENTRALIZADOR = [1, 2, 3, 4];

/**
 * @param {string} routeKey clave de la ruta para los breadcrumbs (P2 o P3)
 */
export const useCentralizadorParalelo = (routeKey = 'ACA-CENTRALIZADOR-ANUAL') => {
  const params = useParams();
  const paraleloGestionId = useMemo(() => {
    const n = Number(params.paraleloGestionId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params.paraleloGestionId]);

  const bimestreActivo = useMemo(() => {
    const n = Number(params.n);
    return Number.isFinite(n) && n >= 1 && n <= 4 ? n : null;
  }, [params.n]);

  // Metadatos del paralelo (carrera, curso, turno) desde el dashboard.
  const { paralelosEstadoDashboard } = useParalelosEstadoApi();
  const paraleloSeleccionado = useMemo(() => {
    const lista = normalizarParalelosCentralizador(paralelosEstadoDashboard?.paralelos);
    return lista.find((p) => p.paraleloGestionId === paraleloGestionId) ?? null;
  }, [paralelosEstadoDashboard, paraleloGestionId]);

  // Datos del centralizador para el paralelo de la URL.
  const [asignaturas, setAsignaturas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [gestionId, setGestionId] = useState(null);
  const [gestionAnio, setGestionAnio] = useState(null);
  const [gestionNombre, setGestionNombre] = useState(null);
  const [notaMinimaAprobacion, setNotaMinimaAprobacion] = useState(NOTA_MINIMA_FALLBACK);
  // Cabecera del Libro de registro del paralelo (schema 25): null si el
  // paralelo aún no tiene folios generados en la gestión.
  const [libro, setLibro] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (pgId) => {
    if (pgId == null) {
      setAsignaturas([]);
      setEstudiantes([]);
      setGestionId(null);
      setGestionAnio(null);
      setGestionNombre(null);
      setNotaMinimaAprobacion(NOTA_MINIMA_FALLBACK);
      setLibro(null);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.obtenerCentralizadorParalelo();
      const result = await uc.ejecutar({ paraleloGestionId: pgId });
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el centralizador');
      }
      const data = result.data ?? {};
      setAsignaturas(Array.isArray(data.asignaturas) ? data.asignaturas : []);
      setEstudiantes(Array.isArray(data.estudiantes) ? data.estudiantes : []);
      setGestionId(data.gestionId ?? null);
      setGestionAnio(data.gestionAnio ?? null);
      setGestionNombre(data.gestionNombre ?? null);
      setNotaMinimaAprobacion(
        data.notaMinimaAprobacion != null ? Number(data.notaMinimaAprobacion) : NOTA_MINIMA_FALLBACK,
      );
      setLibro(data.libro ?? null);
    } catch (err) {
      setError(err?.message || String(err));
      setAsignaturas([]);
      setEstudiantes([]);
      setGestionId(null);
      setGestionAnio(null);
      setGestionNombre(null);
      setNotaMinimaAprobacion(NOTA_MINIMA_FALLBACK);
      setLibro(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar(paraleloGestionId);
  }, [cargar, paraleloGestionId]);

  const refetch = useCallback(() => cargar(paraleloGestionId), [cargar, paraleloGestionId]);

  // Migas: Inicio → Académico → Centralizador → (paralelo) → (bimestre en P3).
  // - La última miga es el paralelo (P2) o el nombre literal del bimestre (P3).
  // - En P3 además se reetiqueta la miga intermedia "Resultado anual" con el
  //   paralelo, para que la cadena lea el paralelo y luego el bimestre.
  const breadcrumbItems = useMemo(() => {
    const esMatriz = routeKey === 'ACA-CENTRALIZADOR-MATRIZ';
    const paraleloLabel = etiquetaParaleloCorta(paraleloSeleccionado);
    const currentTitle = esMatriz
      ? nombreBimestre(bimestreActivo) || null
      : paraleloLabel;
    const items = createCentralizadorBreadcrumbItems(routeKey, 'ACA-CENTRALIZADOR', currentTitle, {
      paraleloGestionId,
      n: bimestreActivo,
    });
    if (esMatriz && paraleloLabel) {
      // La miga intermedia de P2 (breadcrumbLabel 'Resultado anual') pasa a nombrar el paralelo.
      return items.map((item) =>
        item.title === 'Resultado anual' ? { ...item, title: paraleloLabel } : item,
      );
    }
    return items;
  }, [routeKey, paraleloGestionId, bimestreActivo, paraleloSeleccionado]);

  return {
    paraleloGestionId,
    bimestreActivo,
    paraleloSeleccionado,
    asignaturas,
    estudiantes,
    gestionId,
    gestionAnio,
    gestionNombre,
    notaMinimaAprobacion,
    libro,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
  };
};
