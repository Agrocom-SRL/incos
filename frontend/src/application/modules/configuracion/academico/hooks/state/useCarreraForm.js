/**
 * Orquestación ABM carrera (página completa crear/editar).
 * Patrón: PoliticaInstitucionalPage + useDocentesFormPage.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCasesFactory } from '@container';
import {
  mapCarreraToFormValues,
  mapFormValuesToCarreraPayload,
} from '@application-configuracion/academico/mappers';
import {
  CARRERAS_LIST_PATH,
  carreraDetallePath,
} from '@application-configuracion/academico/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/academico/config/academicoNavigation';

export const useCarreraForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const carreraId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const returnListPath = resolveReturnListPath(location, CARRERAS_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar carrera' : 'Nueva carrera';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(carreraId) || carreraId < 1);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Académico', href: returnListPath },
      { title: 'Carreras', href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath],
  );

  const loadCarrera = useCallback(async () => {
    if (!isEditMode) {
      form.setFieldsValue(mapCarreraToFormValues(null));
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
      const result = await useCasesFactory.obtenerCarreraPorId().ejecutar(carreraId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar la carrera');
      }
      form.setFieldsValue(mapCarreraToFormValues(result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar la carrera');
    } finally {
      setLoading(false);
    }
  }, [carreraId, form, isEditMode, isInvalidEditId]);

  useEffect(() => {
    loadCarrera();
  }, [loadCarrera]);

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
      const payload = mapFormValuesToCarreraPayload(values);
      const useCase = isEditMode
        ? useCasesFactory.actualizarCarrera()
        : useCasesFactory.crearCarrera();
      const result = isEditMode
        ? await useCase.ejecutar(carreraId, payload)
        : await useCase.ejecutar(payload);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo guardar la carrera');
      }
      message.success(isEditMode ? 'Carrera actualizada' : 'Carrera creada');
      const raw = result.data?.carrera ?? result.data;
      const savedId = raw?.id ?? carreraId;
      if (savedId) {
        navigate(carreraDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar la carrera';
        setError(msg);
        message.error(msg);
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [carreraId, form, handleVolver, isEditMode, message, navigate, menuSidebarKey, returnListPath]);

  const initialValues = useMemo(() => mapCarreraToFormValues(null), []);

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading,
    submitLoading,
    error,
    initialValues,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
