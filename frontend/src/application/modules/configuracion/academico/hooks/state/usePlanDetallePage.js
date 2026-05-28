/**
 * Orquestación PlanDetallePage — matriz, validación, marcar vigente.
 * Patrón: PoliticaInstitucionalPage + armado horarios (header entidad).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { PLANES_LIST_PATH } from '@application-configuracion/academico/config/paths';
import {
  buildAsignaturaCatalog,
  buildPlanMatrizRows,
} from '@application-configuracion/academico/utils/buildPlanMatrizGrid';
import { usePlanEstudiosDetalleApi } from '../api/usePlanEstudiosDetalleApi';

const DEBOUNCE_MS = 500;

export const usePlanDetallePage = () => {
  const { planId: planIdParam } = useParams();
  const planId = Number(planIdParam);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const api = usePlanEstudiosDetalleApi();
  const saveTimersRef = useRef(new Map());

  const isInvalidId = !Number.isFinite(planId) || planId < 1;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planMeta, setPlanMeta] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [validacion, setValidacion] = useState(null);
  const [marcandoVigente, setMarcandoVigente] = useState(false);
  const [savingCellId, setSavingCellId] = useState(null);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Académico', href: PLANES_LIST_PATH },
      { title: planMeta?.nombre_plan || 'Detalle del plan' },
    ],
    [planMeta?.nombre_plan],
  );

  const carrera = planMeta?.carrera ?? null;
  const carreraColor = carrera?.colorHex || '#52c41a';

  const matrizRows = useMemo(() => buildPlanMatrizRows(periodos), [periodos]);
  const asignaturaCatalog = useMemo(() => buildAsignaturaCatalog(periodos), [periodos]);

  const validacionPorPeriodo = useMemo(() => {
    const map = new Map();
    for (const row of validacion?.periodos ?? []) {
      map.set(row.periodo_id, row);
    }
    return map;
  }, [validacion]);

  const loadAll = useCallback(async () => {
    if (isInvalidId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [planRes, matrizRes, validacionRes] = await Promise.all([
        api.fetchPlanById(planId),
        api.fetchMatriz(planId),
        api.fetchValidacion(planId),
      ]);

      if (!planRes.success) throw new Error(planRes.error || 'No se pudo cargar el plan');
      if (!matrizRes.success) throw new Error(matrizRes.error || 'No se pudo cargar la matriz');
      if (!validacionRes.success) throw new Error(validacionRes.error || 'No se pudo validar el plan');

      const matrizRaw = matrizRes.data;
      const planFromMatriz = matrizRaw?.plan ?? {};
      const planEstudio = planRes.data;

      setPlanMeta({
        ...(planEstudio ?? {}),
        ...planFromMatriz,
        id: planId,
        carrera: planFromMatriz.carrera ?? planEstudio?.carrera ?? null,
      });
      setPeriodos(matrizRaw?.periodos ?? []);
      setValidacion(validacionRes.data);
    } catch (e) {
      setError(e?.message || 'Error al cargar el plan');
    } finally {
      setLoading(false);
    }
  }, [api, isInvalidId, planId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleVolver = useCallback(() => {
    navigate(PLANES_LIST_PATH);
  }, [navigate]);

  const handleMarcarVigente = useCallback(async () => {
    if (planMeta?.vigente) return;
    setMarcandoVigente(true);
    try {
      const result = await api.marcarVigente(planId);
      if (!result.success) {
        throw new Error(result.error || 'No se pudo marcar como vigente');
      }
      message.success('Plan marcado como vigente');
      await loadAll();
    } catch (e) {
      message.error(e?.message || 'No se pudo marcar como vigente');
    } finally {
      setMarcandoVigente(false);
    }
  }, [api, loadAll, message, planId, planMeta?.vigente]);

  const refreshValidacion = useCallback(async () => {
    try {
      const validacionRes = await api.fetchValidacion(planId);
      if (!validacionRes.success) {
        throw new Error(validacionRes.error);
      }
      setValidacion(validacionRes.data);
    } catch {
      /* silencioso tras edición inline */
    }
  }, [api, planId]);

  const patchAsignaturaInState = useCallback((asignaturaId, patch) => {
    setPeriodos((prev) =>
      prev.map((periodo) => {
        const asignaturas = (periodo.asignaturas ?? []).map((a) =>
          a.id === asignaturaId ? { ...a, ...patch } : a,
        );
        const horas_total = asignaturas.reduce(
          (acc, a) => acc + (Number(a.horas_semanales ?? 0) || 0),
          0,
        );
        return { ...periodo, asignaturas, horas_total };
      }),
    );
  }, []);

  const handleCellChange = useCallback(
    (asignaturaId, field, value) => {
      patchAsignaturaInState(asignaturaId, { [field]: value });

      const prevTimer = saveTimersRef.current.get(asignaturaId);
      if (prevTimer) clearTimeout(prevTimer);

      const timer = setTimeout(async () => {
        setSavingCellId(asignaturaId);
        try {
          const payload = { [field]: value };
          const result = await api.actualizarAsignatura(asignaturaId, payload);
          if (!result.success) {
            throw new Error(result.error);
          }
          await refreshValidacion();
        } catch (e) {
          message.error(e?.message || 'No se pudo guardar la celda');
          await loadAll();
        } finally {
          setSavingCellId(null);
          saveTimersRef.current.delete(asignaturaId);
        }
      }, DEBOUNCE_MS);

      saveTimersRef.current.set(asignaturaId, timer);
    },
    [api, loadAll, message, patchAsignaturaInState, refreshValidacion],
  );

  useEffect(
    () => () => {
      saveTimersRef.current.forEach((t) => clearTimeout(t));
      saveTimersRef.current.clear();
    },
    [],
  );

  return {
    planId,
    isInvalidId,
    loading,
    error,
    planMeta,
    periodos,
    matrizRows,
    asignaturaCatalog,
    validacion,
    validacionPorPeriodo,
    carrera,
    carreraColor,
    breadcrumbItems,
    handleVolver,
    handleMarcarVigente,
    marcarVigenteLoading: marcandoVigente,
    savingCellId,
    handleCellChange,
    refetch: loadAll,
    api,
  };
};
