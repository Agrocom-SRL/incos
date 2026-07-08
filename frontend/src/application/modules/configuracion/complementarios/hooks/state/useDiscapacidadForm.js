/**
 * Orquestación ABM tipo de discapacidad (página completa crear/editar).
 * Gemelo simplificado de `academico/hooks/state/useMateriaForm.js`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCasesFactory } from '@container';
import {
  mapDiscapacidadToFormValues,
  mapFormValuesToDiscapacidadPayload,
} from '@application-configuracion/complementarios/mappers';
import {
  DISCAPACIDAD_LIST_PATH,
  discapacidadDetallePath,
} from '@application-configuracion/complementarios/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/complementarios/config/navigation';

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

const createDiscapacidadFormSections = () => ({
  datosDiscapacidad: {
    title: 'Datos del tipo de discapacidad',
    description:
      'Catálogo de tipos de discapacidad del instituto. El estado activo se asigna al crear; la activación/desactivación se gestiona desde el listado.',
    fields: [
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. Discapacidad visual',
        maxLength: 255,
        rules: [MIN_TEXT],
      },
      {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        span: 24,
        rows: 4,
        placeholder: 'Descripción del tipo de discapacidad (opcional)',
      },
    ],
  },
});

export const useDiscapacidadForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const discapacidadId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const returnListPath = resolveReturnListPath(location, DISCAPACIDAD_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar tipo de discapacidad' : 'Nuevo tipo de discapacidad';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(discapacidadId) || discapacidadId < 1);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Complementarios', href: returnListPath },
      { title: 'Discapacidad', href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath],
  );

  const loadDiscapacidad = useCallback(async () => {
    if (!isEditMode) {
      form.setFieldsValue(mapDiscapacidadToFormValues(null));
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
      const result = await useCasesFactory.obtenerDiscapacidadPorId().ejecutar(discapacidadId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el tipo de discapacidad');
      }
      form.setFieldsValue(mapDiscapacidadToFormValues(result.data?.discapacidad ?? result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el tipo de discapacidad');
    } finally {
      setLoading(false);
    }
  }, [form, isEditMode, isInvalidEditId, discapacidadId]);

  useEffect(() => {
    loadDiscapacidad();
  }, [loadDiscapacidad]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToDiscapacidadPayload(values);
      const useCase = isEditMode
        ? useCasesFactory.actualizarDiscapacidad()
        : useCasesFactory.crearDiscapacidad();
      const result = isEditMode
        ? await useCase.ejecutar(discapacidadId, payload)
        : await useCase.ejecutar(payload);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo guardar el tipo de discapacidad');
      }
      notification.success({
        title: isEditMode ? 'Tipo de discapacidad actualizado' : 'Tipo de discapacidad creado',
      });
      const raw = result.data?.discapacidad ?? result.data;
      const savedId = raw?.id ?? discapacidadId;
      if (savedId) {
        navigate(discapacidadDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar el tipo de discapacidad';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [
    form,
    handleVolver,
    isEditMode,
    discapacidadId,
    notification,
    navigate,
    menuSidebarKey,
    returnListPath,
  ]);

  const initialValues = useMemo(() => mapDiscapacidadToFormValues(null), []);
  const formSections = useMemo(() => createDiscapacidadFormSections(), []);

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
    formSections,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
