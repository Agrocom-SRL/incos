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
import { useCarrerasApi } from '../api/useCarrerasApi';
import { usePlanesEstudiosApi } from '../api/usePlanesEstudiosApi';
import {
  mapFormValuesToParaleloPayload,
  mapParaleloToFormValues,
} from '@application-configuracion/academico/mappers/paraleloFormMapper';
import {
  PARALELOS_LIST_PATH,
  paraleloDetallePath,
} from '@application-configuracion/academico/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/academico/config/academicoNavigation';
import { createParaleloFormSections } from '@application-configuracion/academico/config/paraleloFormFields';
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

  const pageTitle = isEditMode ? 'Editar paralelo' : 'Nuevo paralelo';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(paraleloId) || paraleloId < 1);

  const planCarreraId = (p) => Number(p.carrera_id ?? p.carreraId);

  const vigentePlanPorCarrera = useMemo(() => {
    const map = new Map();
    for (const p of planes) {
      if (p.vigente !== true && p.vigente !== 1) continue;
      const cid = planCarreraId(p);
      if (Number.isFinite(cid)) map.set(cid, p);
    }
    return map;
  }, [planes]);

  const planVigente = useMemo(() => {
    if (carreraId == null || carreraId === '') return null;
    return vigentePlanPorCarrera.get(Number(carreraId)) ?? null;
  }, [carreraId, vigentePlanPorCarrera]);

  const loadPeriodos = useCallback(async (planId) => {
    if (!planId) {
      setPeriodos([]);
      return [];
    }
    setLoadingPeriodos(true);
    try {
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
      const mapped = mapPeriodosPlanList(list);
      setPeriodos(mapped);
      return mapped;
    } catch (e) {
      handleErrorResponse(e, 'Error al cargar periodos');
      setPeriodos([]);
      return [];
    } finally {
      setLoadingPeriodos(false);
    }
  }, []);

  useEffect(() => {
    if (isHydratingRef.current) return;
    const planId = planVigente?.id ?? planVigente?.plan_estudio_id;
    if (planId) {
      loadPeriodos(Number(planId));
    } else {
      setPeriodos([]);
    }
  }, [planVigente, loadPeriodos]);

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
      { title: 'Académico', href: returnListPath },
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

      if (values.carrera_id) {
        const cid = Number(values.carrera_id);
        const plan = vigentePlanPorCarrera.get(cid);
        const planId = plan?.id ?? plan?.plan_estudio_id;
        if (planId) {
          await loadPeriodos(Number(planId));
        }
      }

      isHydratingRef.current = true;
      pendingPeriodoIdRef.current = values.periodo_id ?? null;
      form.setFieldsValue({ ...values, periodo_id: undefined });
      isHydratingRef.current = false;
      loadedEditIdRef.current = paraleloId;
    } catch (e) {
      setError(e?.message || 'Error al cargar el paralelo');
    } finally {
      setLoading(false);
    }
  }, [form, isInvalidEditId, paraleloId, vigentePlanPorCarrera, loadPeriodos]);

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
        message: isEditMode ? 'Paralelo actualizado' : 'Paralelo creado',
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

  const resolveOptions = useCallback(
    (key) => {
      if (key === 'carreras') return carreraOptions;
      if (key === 'periodos') return periodos;
      return [];
    },
    [carreraOptions, periodos],
  );

  const formSections = useMemo(() => createParaleloFormSections(), []);

  const sinPlanVigente = Boolean(carreraId && !planVigente && !planesLoading);

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
    planVigente,
    carreras,
    carrerasLoading,
    carrerasError,
    periodos,
    periodosLoading: loadingPeriodos,
    sinPlanVigente,
  };
};
