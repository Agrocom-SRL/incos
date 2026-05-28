/**
 * Orquestación ABM materia (página completa crear/editar).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCasesFactory } from '@container';
import {
  mapMateriaToFormValues,
  mapFormValuesToMateriaPayload,
} from '@application-configuracion/academico/mappers';
import {
  MATERIAS_LIST_PATH,
  materiaDetallePath,
} from '@application-configuracion/academico/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/academico/config/academicoNavigation';

export const useMateriaForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const materiaId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const returnListPath = resolveReturnListPath(location, MATERIAS_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar materia' : 'Nueva materia';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(materiaId) || materiaId < 1);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Académico', href: returnListPath },
      { title: 'Materias', href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath],
  );

  const loadMateria = useCallback(async () => {
    if (!isEditMode) {
      form.setFieldsValue(mapMateriaToFormValues(null));
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
      const result = await useCasesFactory.obtenerMateriaPorId().ejecutar(materiaId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar la materia');
      }
      form.setFieldsValue(mapMateriaToFormValues(result.data?.materia ?? result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar la materia');
    } finally {
      setLoading(false);
    }
  }, [form, isEditMode, isInvalidEditId, materiaId]);

  useEffect(() => {
    loadMateria();
  }, [loadMateria]);

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
      const payload = mapFormValuesToMateriaPayload(values);
      const useCase = isEditMode
        ? useCasesFactory.actualizarMateria()
        : useCasesFactory.crearMateria();
      const result = isEditMode
        ? await useCase.ejecutar(materiaId, payload)
        : await useCase.ejecutar(payload);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo guardar la materia');
      }
      message.success(isEditMode ? 'Materia actualizada' : 'Materia creada');
      const raw = result.data?.materia ?? result.data;
      const savedId = raw?.id ?? materiaId;
      if (savedId) {
        navigate(materiaDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar la materia';
        setError(msg);
        message.error(msg);
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [form, handleVolver, isEditMode, materiaId, message, navigate, menuSidebarKey, returnListPath]);

  const initialValues = useMemo(() => mapMateriaToFormValues(null), []);

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
