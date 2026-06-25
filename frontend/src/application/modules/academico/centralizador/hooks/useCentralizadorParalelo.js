/**
 * Estado de pantalla — Centralizador de calificaciones por paralelo (P2 y P3).
 *
 * Eje = paralelo en gestión vigente (NO docente/curso). El `paraleloGestionId`
 * llega por la URL (`/centralizador/:paraleloGestionId[/bimestre/:n]`), no por un
 * Select. Carga la matriz estudiantes × asignaturas desde
 * GET /v1/calificaciones/centralizador?paraleloGestionId=<id>.
 *
 * P2 (bimestres) consume `bimestrePromedios` (promedio del estudiante por
 * bimestre). P3 (matriz) consume `asignaturas` + `estudiantes` y filtra por `:n`.
 *
 * Toda la orquestación vive aquí; la página solo compone (incos-frontend-module §2).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { useParalelosEstadoApi } from '@application-shared/hooks';
import {
  normalizarParalelosCentralizador,
  etiquetaParalelo,
} from '../utils/paraleloCentralizador.js';
import { nombreBimestre } from '../utils/centralizadorDoc.js';
import { createCentralizadorBreadcrumbItems } from '../utils/centralizadorBreadcrumbs.js';

/** Nota mínima de aprobación por defecto si la política aún no la define. */
const NOTA_MINIMA_FALLBACK = 61;

/** Bimestres del régimen anual del centralizador. */
export const BIMESTRES_CENTRALIZADOR = [1, 2, 3, 4];

/** Promedio de un arreglo de notas, ignorando null; null si no hay ninguna. */
const promediar = (valores) => {
  const validos = valores.filter((v) => v != null && Number.isFinite(Number(v)));
  if (validos.length === 0) return null;
  const suma = validos.reduce((acc, v) => acc + Number(v), 0);
  return Math.round(suma / validos.length);
};

/**
 * Promedios por estudiante: media de las notas de sus asignaturas en cada
 * bimestre (bim1..bim4) y la final (media de notaFinal, o promedioAnual).
 */
const computarBimestrePromedios = (estudiantes, asignaturas) =>
  estudiantes.map((est) => {
    const celdas = asignaturas.map((a) => est.notas?.[a.ofertaCursoId]).filter(Boolean);
    return {
      estudianteId: est.estudianteId,
      codigoEstudiante: est.codigoEstudiante,
      ci: est.ci,
      nombreCompleto: est.nombreCompleto,
      bim1: promediar(celdas.map((c) => c.bim1)),
      bim2: promediar(celdas.map((c) => c.bim2)),
      bim3: promediar(celdas.map((c) => c.bim3)),
      bim4: promediar(celdas.map((c) => c.bim4)),
      final: promediar(celdas.map((c) => c.notaFinal ?? c.promedioAnual)),
    };
  });

/**
 * @param {string} routeKey clave de la ruta para los breadcrumbs (P2 o P3)
 */
export const useCentralizadorParalelo = (routeKey = 'ACA-CENTRALIZADOR-BIMESTRES') => {
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
    } catch (err) {
      setError(err?.message || String(err));
      setAsignaturas([]);
      setEstudiantes([]);
      setGestionId(null);
      setGestionAnio(null);
      setGestionNombre(null);
      setNotaMinimaAprobacion(NOTA_MINIMA_FALLBACK);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar(paraleloGestionId);
  }, [cargar, paraleloGestionId]);

  const bimestrePromedios = useMemo(
    () => computarBimestrePromedios(estudiantes, asignaturas),
    [estudiantes, asignaturas],
  );

  const refetch = useCallback(() => cargar(paraleloGestionId), [cargar, paraleloGestionId]);

  // Migas: Inicio → Académico → Centralizador → (paralelo) → (bimestre en P3).
  // - La última miga es el paralelo (P2) o el nombre literal del bimestre (P3).
  // - En P3 además se reetiqueta la miga intermedia "Bimestres" con el paralelo,
  //   para que la cadena lea el paralelo y luego el bimestre.
  const breadcrumbItems = useMemo(() => {
    const esMatriz = routeKey === 'ACA-CENTRALIZADOR-MATRIZ';
    const paraleloLabel = etiquetaParalelo(paraleloSeleccionado);
    const currentTitle = esMatriz
      ? nombreBimestre(bimestreActivo) || null
      : paraleloLabel;
    const items = createCentralizadorBreadcrumbItems(routeKey, 'ACA-CENTRALIZADOR', currentTitle, {
      paraleloGestionId,
      n: bimestreActivo,
    });
    if (esMatriz && paraleloLabel) {
      // La miga intermedia de P2 (breadcrumbLabel 'Bimestres') pasa a nombrar el paralelo.
      return items.map((item) =>
        item.title === 'Bimestres' ? { ...item, title: paraleloLabel } : item,
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
    bimestrePromedios,
    gestionId,
    gestionAnio,
    gestionNombre,
    notaMinimaAprobacion,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
  };
};
