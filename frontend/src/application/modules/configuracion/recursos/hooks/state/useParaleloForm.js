/**
 * Orquestación ABM paralelo maestro (página completa crear/editar).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import apiClient from '@api-client';
import { PLANES_ESTUDIOS_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';
import { useCasesFactory } from '@container';
import { useCarrerasApi } from '@application-configuracion/academico/hooks/api/useCarrerasApi';
import { usePlanesEstudiosApi } from '@application-configuracion/academico/hooks/api/usePlanesEstudiosApi';
import {
  mapFormValuesToParaleloPayload,
  mapParaleloToFormValues,
} from '@application-configuracion/recursos/mappers/paraleloFormMapper';
import {
  PARALELOS_LIST_PATH,
  paraleloDetallePath,
} from '@application-configuracion/recursos/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/recursos/config/navigation';
import { createParaleloFormSections } from '@application-configuracion/recursos/config/paraleloFormFields';
import { mapPeriodosPlanList } from '@application-configuracion/academico/utils/mapPeriodosPlanList';

export const useParaleloForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const paraleloId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const { carreras = [], loading: carrerasLoading, error: carrerasError } = useCarrerasApi();
  const { planes = [], loading: planesLoading } = usePlanesEstudiosApi();

  const returnListPath = resolveReturnListPath(location, PARALELOS_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const pendingPeriodoIdRef = useRef(null);
  const isHydratingRef = useRef(false);

  const carreraId = Form.useWatch('carrera_id', form);
  const planEstudioId = Form.useWatch('plan_estudio_id', form);

  const pageTitle = isEditMode ? 'Editar paralelo' : 'Nuevo paralelo';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(paraleloId) || paraleloId < 1);

  const planCarreraId = (p) => Number(p.carrera_id ?? p.carreraId);
  const esPlanActivo = (p) => p.activo !== false && p.activo !== 0;
  const esPlanVigente = (p) => p.vigente === true || p.vigente === 1;

  /**
   * Planes ACTIVOS por carrera (no solo el vigente): una carrera puede tener
   * más de uno operando a la vez — el vigente (nuevas admisiones) y uno o
   * más históricos con estudiantes en curso que aún necesitan paralelos
   * nuevos en los años que les quedan. Ordenados vigente primero, luego más
   * reciente primero.
   */
  const planesActivosPorCarrera = useMemo(() => {
    const map = new Map();
    for (const p of planes) {
      if (!esPlanActivo(p)) continue;
      const cid = planCarreraId(p);
      if (!Number.isFinite(cid)) continue;
      const lista = map.get(cid) ?? [];
      lista.push(p);
      map.set(cid, lista);
    }
    for (const lista of map.values()) {
      lista.sort((a, b) => {
        const aVig = esPlanVigente(a);
        const bVig = esPlanVigente(b);
        if (aVig !== bVig) return aVig ? -1 : 1;
        return b.id - a.id;
      });
    }
    return map;
  }, [planes]);

  const planesDisponibles = useMemo(() => {
    if (carreraId == null || carreraId === '') return [];
    return planesActivosPorCarrera.get(Number(carreraId)) ?? [];
  }, [carreraId, planesActivosPorCarrera]);

  /** Plan efectivo: único activo → automático; varios → el elegido en el formulario. */
  const planSeleccionado = useMemo(() => {
    if (!planesDisponibles.length) return null;
    if (planesDisponibles.length === 1) return planesDisponibles[0];
    return planesDisponibles.find((p) => Number(p.id) === Number(planEstudioId)) ?? null;
  }, [planesDisponibles, planEstudioId]);

  const fetchPeriodosDePlan = useCallback(async (planId) => {
    if (!planId) return [];
    let list = [];
    const response = await apiClient.get(PLANES_ESTUDIOS_ENDPOINTS.PERIODOS(planId));
    const result = handleSuccessResponse(response);
    if (result.success) {
      const raw = result.data?.periodos ?? result.data ?? [];
      list = Array.isArray(raw) ? raw : [];
    }
    if (!list.length) {
      const planRes = await apiClient.get(PLANES_ESTUDIOS_ENDPOINTS.BY_ID(planId));
      const planResult = handleSuccessResponse(planRes);
      if (planResult.success) {
        const raw =
          planResult.data?.periodos ??
          planResult.data?.plan_estudio?.periodos ??
          [];
        list = Array.isArray(raw) ? raw : [];
      }
    }
    return mapPeriodosPlanList(list);
  }, []);

  const loadPeriodos = useCallback(
    async (planId) => {
      if (!planId) {
        setPeriodos([]);
        return [];
      }
      setLoadingPeriodos(true);
      try {
        const mapped = await fetchPeriodosDePlan(planId);
        setPeriodos(mapped);
        return mapped;
      } catch (e) {
        handleErrorResponse(e, 'Error al cargar periodos');
        setPeriodos([]);
        return [];
      } finally {
        setLoadingPeriodos(false);
      }
    },
    [fetchPeriodosDePlan],
  );

  useEffect(() => {
    if (isHydratingRef.current) return;
    const planId = planSeleccionado?.id ?? planSeleccionado?.plan_estudio_id;
    if (planId) {
      loadPeriodos(Number(planId));
    } else {
      setPeriodos([]);
    }
  }, [planSeleccionado, loadPeriodos]);

  useEffect(() => {
    const pendingId = pendingPeriodoIdRef.current;
    if (pendingId == null) return;
    if (!periodos.some((o) => Number(o.value) === Number(pendingId))) return;
    form.setFieldValue('periodo_id', pendingId);
    pendingPeriodoIdRef.current = null;
  }, [periodos, form]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Recursos académicos', href: returnListPath },
      { title: 'Paralelos', href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath],
  );

  const loadedEditIdRef = useRef(null);

  const loadParaleloForEdit = useCallback(async () => {
    if (isInvalidEditId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.obtenerParaleloPorId().ejecutar(paraleloId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el paralelo');
      }
      const raw = result.data?.paralelo ?? result.data;
      const values = mapParaleloToFormValues(raw);
      let planIdHidratado;

      if (values.carrera_id) {
        const cid = Number(values.carrera_id);
        const candidatos = planesActivosPorCarrera.get(cid) ?? [];
        if (candidatos.length <= 1) {
          const planId = candidatos[0]?.id;
          if (planId) {
            await loadPeriodos(Number(planId));
            planIdHidratado = planId;
          }
        } else {
          // Varios planes activos: resolver a cuál pertenece el periodo ya
          // asignado probando cada candidato (vigente primero).
          for (const candidato of candidatos) {
            const planId = candidato.id;
            const lista = await fetchPeriodosDePlan(Number(planId));
            if (lista.some((o) => Number(o.value) === Number(values.periodo_id))) {
              setPeriodos(lista);
              planIdHidratado = planId;
              break;
            }
          }
        }
      }

      isHydratingRef.current = true;
      pendingPeriodoIdRef.current = values.periodo_id ?? null;
      form.setFieldsValue({ ...values, periodo_id: undefined, plan_estudio_id: planIdHidratado });
      isHydratingRef.current = false;
      loadedEditIdRef.current = paraleloId;
    } catch (e) {
      setError(e?.message || 'Error al cargar el paralelo');
    } finally {
      setLoading(false);
    }
  }, [form, isInvalidEditId, paraleloId, planesActivosPorCarrera, loadPeriodos, fetchPeriodosDePlan]);

  useEffect(() => {
    if (!isEditMode) {
      loadedEditIdRef.current = null;
      pendingPeriodoIdRef.current = null;
      form.setFieldsValue(mapParaleloToFormValues(null));
      setLoading(false);
      return;
    }
    if (isInvalidEditId) {
      setLoading(false);
      return;
    }
    if (planesLoading) return;
    if (loadedEditIdRef.current === paraleloId) return;
    loadParaleloForEdit();
  }, [isEditMode, isInvalidEditId, planesLoading, paraleloId, loadParaleloForEdit, form]);

  const handleVolver = useCallback(() => {
    navigate(
      returnListPath,
      menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined,
    );
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToParaleloPayload(values);
      const useCase = isEditMode
        ? useCasesFactory.actualizarParalelo()
        : useCasesFactory.crearParalelo();
      const result = isEditMode
        ? await useCase.ejecutar(paraleloId, payload)
        : await useCase.ejecutar(payload);

      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo guardar el paralelo');
      }
      notification.success({
        title: isEditMode ? 'Paralelo actualizado' : 'Paralelo creado',
      });
      const savedId = result.data?.paralelo?.id ?? result.data?.data?.paralelo?.id ?? paraleloId;
      if (savedId) {
        navigate(paraleloDetallePath(savedId), {
          state: { returnListPath, menuSidebarKey },
        });
      } else {
        handleVolver();
      }
    } catch (e) {
      if (e?.errorFields) return;
      setError(e?.message || 'Error al guardar');
    } finally {
      setSubmitLoading(false);
    }
  }, [form, handleVolver, isEditMode, menuSidebarKey, navigate, notification, paraleloId, returnListPath]);

  const carreraOptions = useMemo(
    () =>
      carreras.map((c) => ({
        value: c.id,
        label: c.codigo ? `${c.codigo} — ${c.nombre}` : c.nombre,
      })),
    [carreras],
  );

  const planOptions = useMemo(
    () =>
      planesDisponibles.map((p) => ({
        value: p.id,
        label: `${p.nombre_plan || `Plan ${p.id}`}${esPlanVigente(p) ? ' · Vigente' : ' · Activo'}`,
      })),
    [planesDisponibles],
  );

  const resolveOptions = useCallback(
    (key) => {
      if (key === 'carreras') return carreraOptions;
      if (key === 'periodos') return periodos;
      if (key === 'planes') return planOptions;
      return [];
    },
    [carreraOptions, periodos, planOptions],
  );

  const formSections = useMemo(() => createParaleloFormSections(), []);

  const sinPlanActivo = Boolean(carreraId && !planesDisponibles.length && !planesLoading);

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    loading: loading || loadingPeriodos,
    submitLoading,
    error,
    formSections,
    resolveOptions,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
    carreraId,
    planSeleccionado,
    planesDisponibles,
    carreras,
    carrerasLoading,
    carrerasError,
    periodos,
    periodosLoading: loadingPeriodos,
    sinPlanActivo,
  };
};
