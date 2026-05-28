/**
 * Edición de metadatos del plan (página completa).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import {
  mapFormValuesToPlanPayload,
  mapPlanToFormValues,
} from '@application-configuracion/academico/mappers/planFormMapper';
import {
  PLANES_LIST_PATH,
  planDetallePath,
} from '@application-configuracion/academico/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/academico/config/academicoNavigation';
import { usePlanEstudiosDetalleApi } from '../api/usePlanEstudiosDetalleApi';

export const usePlanForm = () => {
  const { planId: planIdParam } = useParams();
  const planId = Number(planIdParam);
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const api = usePlanEstudiosDetalleApi();
  const [form] = Form.useForm();

  const returnListPath = resolveReturnListPath(location, PLANES_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);
  const navState = useMemo(
    () => ({ returnListPath, menuSidebarKey }),
    [returnListPath, menuSidebarKey],
  );

  const isInvalidId = !Number.isFinite(planId) || planId < 1;
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [planMeta, setPlanMeta] = useState(null);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Académico', href: returnListPath },
      { title: planMeta?.nombre_plan || 'Editar plan', href: planDetallePath(planId) },
      { title: 'Editar metadatos' },
    ],
    [planMeta?.nombre_plan, planId, returnListPath],
  );

  const load = useCallback(async () => {
    if (isInvalidId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.fetchPlanById(planId);
      if (!res.success) throw new Error(res.error);
      setPlanMeta(res.data);
      form.setFieldsValue(mapPlanToFormValues(res.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el plan');
    } finally {
      setLoading(false);
    }
  }, [api, form, isInvalidId, planId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleVolver = useCallback(() => {
    navigate(planDetallePath(planId), { state: navState });
  }, [navigate, navState, planId]);

  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToPlanPayload(values);
      const res = await api.actualizarPlan(planId, payload);
      if (!res.success) throw new Error(res.error);
      message.success('Plan actualizado');
      navigate(planDetallePath(planId), { state: navState, replace: true });
    } catch (e) {
      if (e?.errorFields) {
        setError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo guardar el plan';
        setError(msg);
        message.error(msg);
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [api, form, message, navigate, navState, planId]);

  return {
    form,
    planId,
    planMeta,
    isInvalidId,
    loading,
    submitLoading,
    error,
    breadcrumbItems,
    handleVolver,
    handleSubmit,
    initialValues: mapPlanToFormValues(null),
  };
};
