/**
 * Estado de pantalla — P1 nivel 2 de Nivelación: grilla estudiantes ×
 * asignaturas de UN paralelo (`/academico/nivelaciones/listar/:paraleloGestionId`).
 * Metadatos del paralelo (carrera, curso, turno) desde el dataset compartido
 * (mismo patrón que `useCentralizadorParalelo.js`); datos de la grilla desde
 * `GET /nivelaciones?paraleloGestionId=`.
 *
 * Toda la orquestación vive aquí; la página solo compone (incos-frontend-module §2).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { useParalelosEstadoApi } from '@application-shared/hooks';
import { normalizarParalelosNivelacion, etiquetaParaleloNivelacionCorta } from '../utils/paraleloNivelacion.js';
import { createNivelacionBreadcrumbItems } from '../utils/nivelacionBreadcrumbs.js';

export const useNivelacionParalelo = () => {
  const params = useParams();
  const paraleloGestionId = useMemo(() => {
    const n = Number(params.paraleloGestionId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params.paraleloGestionId]);

  const { paralelosEstadoDashboard } = useParalelosEstadoApi();
  const paraleloSeleccionado = useMemo(() => {
    const lista = normalizarParalelosNivelacion(paralelosEstadoDashboard?.paralelos);
    return lista.find((p) => p.paraleloGestionId === paraleloGestionId) ?? null;
  }, [paralelosEstadoDashboard, paraleloGestionId]);

  const [asignaturas, setAsignaturas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [totalPendientes, setTotalPendientes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (pgId) => {
    if (pgId == null) {
      setAsignaturas([]);
      setEstudiantes([]);
      setTotalPendientes(0);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const uc = useCasesFactory.obtenerNivelacionParalelo();
      const result = await uc.ejecutar({ paraleloGestionId: pgId });
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar la grilla de nivelación');
      }
      const data = result.data ?? {};
      setAsignaturas(Array.isArray(data.asignaturas) ? data.asignaturas : []);
      setEstudiantes(Array.isArray(data.estudiantes) ? data.estudiantes : []);
      setTotalPendientes(Number(data.totalPendientes) || 0);
    } catch (err) {
      setError(err?.message || String(err));
      setAsignaturas([]);
      setEstudiantes([]);
      setTotalPendientes(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar(paraleloGestionId);
  }, [cargar, paraleloGestionId]);

  const refetch = useCallback(() => cargar(paraleloGestionId), [cargar, paraleloGestionId]);

  const breadcrumbItems = useMemo(() => {
    const paraleloLabel = etiquetaParaleloNivelacionCorta(paraleloSeleccionado);
    return createNivelacionBreadcrumbItems('ACA-NIV-GRID', 'ACA-NIV', paraleloLabel, {
      paraleloGestionId,
    });
  }, [paraleloGestionId, paraleloSeleccionado]);

  return {
    paraleloGestionId,
    paraleloSeleccionado,
    asignaturas,
    estudiantes,
    totalPendientes,
    isLoading,
    error,
    refetch,
    breadcrumbItems,
  };
};

export default useNivelacionParalelo;
