/**
 * Orquestación ABM plan de estudio (página completa crear/editar).
 * Patrón: useCarreraForm (workspace) + useParaleloForm (select de carrera dinámico).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCarrerasApi } from '@application-configuracion/academico/hooks/api/useCarrerasApi';
import { usePlanEstudiosDetalleApi } from '@application-configuracion/academico/hooks/api/usePlanEstudiosDetalleApi';
import {
  mapPlanToFormValues,
  mapFormValuesToPlanPayload,
} from '@application-configuracion/academico/mappers';
import {
  PLANES_LIST_PATH,
  planDetallePath,
} from '@application-configuracion/academico/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/academico/config/academicoNavigation';
import { createPlanFormSections } from '@application-configuracion/academico/config/planFormFields';

/** "1º Año", "2º Año"… — nombre por defecto del periodo autogenerado según `duracion_anios`. */
const buildPeriodoNombre = (numero) => `${numero}º Año`;

export const usePlanForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const planId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const { fetchPlanById, crearPlan, actualizarPlan, crearPeriodo } = usePlanEstudiosDetalleApi();
  const { carreras = [], loading: carrerasLoading, error: carrerasError } = useCarrerasApi();

  const returnListPath = resolveReturnListPath(location, PLANES_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar plan de estudio' : 'Nuevo plan de estudio';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(planId) || planId < 1);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Académico', href: returnListPath },
      { title: 'Planes de estudio', href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath],
  );

  const loadPlan = useCallback(async () => {
    if (!isEditMode) {
      form.setFieldsValue(mapPlanToFormValues(null));
      setLoading(false);
      return;
    }
    if (isInvalidEditId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPlanById(planId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el plan de estudio');
      }
      form.setFieldsValue(mapPlanToFormValues(result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el plan de estudio');
    } finally {
      setLoading(false);
    }
  }, [fetchPlanById, form, isEditMode, isInvalidEditId, planId]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

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
      const payload = mapFormValuesToPlanPayload(values);
      const result = isEditMode
        ? await actualizarPlan(planId, payload)
        : await crearPlan(payload);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo guardar el plan de estudio');
      }
      notification.success({
        title: isEditMode ? 'Plan de estudio actualizado' : 'Plan de estudio creado',
      });
      const savedId = result.data?.id ?? planId;

      // Alta: la duración (años) es la única fuente de la cantidad de periodos —
      // se generan automáticamente 1º Año…Nº Año. Edición nunca re-genera (el
      // plan editado ya tiene sus periodos, gestionados desde su matriz).
      if (!isEditMode && savedId && Number(payload.duracion_anios) > 0) {
        const totalPeriodos = Number(payload.duracion_anios);
        let periodosConError = 0;
        for (let numero = 1; numero <= totalPeriodos; numero += 1) {
          // Alta secuencial de periodos (orden 1..N) — resultado de cada uno no
          // depende de los otros, pero se evita disparar N requests en paralelo.
          const periodoResult = await crearPeriodo(savedId, {
            numero,
            nombre: buildPeriodoNombre(numero),
          });
          if (!periodoResult?.success) periodosConError += 1;
        }
        if (periodosConError > 0) {
          notification.error({
            title: 'Periodos no generados',
            description: `${periodosConError} de ${totalPeriodos} periodos no se pudieron crear. Agréguelos desde la ficha del plan.`,
          });
        }
      }

      if (savedId) {
        navigate(planDetallePath(savedId), {
          state: { returnListPath, menuSidebarKey },
          replace: !isEditMode,
        });
      } else {
        handleVolver();
      }
    } catch (e) {
      if (e?.errorFields) {
        setError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo guardar el plan de estudio';
        setError(msg);
        notification.error({
          title: 'Error al guardar',
          description: msg,
        });
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [
    actualizarPlan,
    crearPeriodo,
    crearPlan,
    form,
    handleVolver,
    isEditMode,
    menuSidebarKey,
    navigate,
    notification,
    planId,
    returnListPath,
  ]);

  const initialValues = useMemo(() => mapPlanToFormValues(null), []);
  const formSections = useMemo(() => createPlanFormSections(), []);

  // Sin campos `select` en el form: la carrera se elige con el picker visual
  // (`PlanCarreraPeriodosSection`), que recibe `carreras` directo, no vía `resolveOptions`.
  const resolveOptions = useCallback(() => [], []);

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading: loading || carrerasLoading,
    submitLoading,
    error: error || carrerasError,
    initialValues,
    formSections,
    resolveOptions,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
    carreras,
    carrerasLoading,
    carrerasError,
  };
};
