/**
 * Documento de plan vigente — matriz + prerrequisitos para tab Planes.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePlanEstudiosDetalleApi } from '../api/usePlanEstudiosDetalleApi';
import { buildPrerrequisitoSiglaMap } from '../../utils/buildPrerrequisitoSiglaMap';

export const usePlanesTabDocumento = (planId) => {
  const { fetchMatriz, fetchPlanById } = usePlanEstudiosDetalleApi();
  const [periodos, setPeriodos] = useState([]);
  const [planMeta, setPlanMeta] = useState(null);
  const [prerrequisitos, setPrerrequisitos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const planIdRef = useRef(planId);

  const load = useCallback(async () => {
    const currentPlanId = planIdRef.current;
    if (!currentPlanId) {
      setPeriodos([]);
      setPlanMeta(null);
      setPrerrequisitos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [matrizRes, planRes] = await Promise.all([
        fetchMatriz(currentPlanId),
        fetchPlanById(currentPlanId),
      ]);

      if (planIdRef.current !== currentPlanId) return;

      if (!matrizRes.success) {
        throw new Error(matrizRes.error || 'No se pudo cargar la matriz del plan');
      }

      const matrizRaw = matrizRes.data ?? {};
      const planFromMatriz = matrizRaw.plan ?? {};
      const planFromDetail = planRes.success ? planRes.data : {};
      const mergedPlan = {
        ...planFromDetail,
        ...planFromMatriz,
        id: planFromMatriz.id ?? planFromDetail.id ?? currentPlanId,
      };

      setPeriodos(matrizRaw.periodos ?? []);
      setPlanMeta(mergedPlan);
      setPrerrequisitos(planRes.success ? planRes.prerrequisitos ?? [] : []);
    } catch (e) {
      if (planIdRef.current !== currentPlanId) return;
      setError(e?.message || 'Error al cargar el plan de estudios');
      setPeriodos([]);
      setPlanMeta(null);
      setPrerrequisitos([]);
    } finally {
      if (planIdRef.current === currentPlanId) {
        setLoading(false);
      }
    }
  }, [fetchMatriz, fetchPlanById]);

  useEffect(() => {
    planIdRef.current = planId;
    load();
  }, [planId, load]);

  const prereqSiglaByAsignaturaId = useMemo(
    () => buildPrerrequisitoSiglaMap(periodos, prerrequisitos),
    [periodos, prerrequisitos],
  );

  return {
    periodos,
    planMeta,
    prereqSiglaByAsignaturaId,
    loading,
    error,
    refetch: load,
  };
};
