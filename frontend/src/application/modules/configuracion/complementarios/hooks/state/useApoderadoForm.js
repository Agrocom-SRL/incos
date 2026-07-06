/**
 * Orquestación ABM apoderado / tipo de parentesco (página completa crear/editar).
 * Gemelo de `useDiscapacidadForm.js`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCasesFactory } from '@container';
import {
  mapApoderadoToFormValues,
  mapFormValuesToApoderadoPayload,
} from '@application-configuracion/complementarios/mappers';
import {
  APODERADOS_LIST_PATH,
  apoderadoDetallePath,
} from '@application-configuracion/complementarios/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/complementarios/config/navigation';

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

const createApoderadoFormSections = () => ({
  datosApoderado: {
    title: 'Datos del apoderado',
    description:
      'Catálogo de tipos de parentesco usado para registrar apoderados de estudiantes. El estado activo se asigna al crear; la activación/desactivación se gestiona desde el listado.',
    fields: [
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. Padre, Madre, Tutor legal',
        maxLength: 255,
        rules: [MIN_TEXT],
      },
      {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        span: 24,
        rows: 4,
        placeholder: 'Descripción del tipo de parentesco (opcional)',
      },
    ],
  },
});

export const useApoderadoForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const apoderadoId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const returnListPath = resolveReturnListPath(location, APODERADOS_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar apoderado' : 'Nuevo apoderado';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(apoderadoId) || apoderadoId < 1);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Complementarios', href: returnListPath },
      { title: 'Apoderados', href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath],
  );

  const loadApoderado = useCallback(async () => {
    if (!isEditMode) {
      form.setFieldsValue(mapApoderadoToFormValues(null));
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
      const result = await useCasesFactory.obtenerTipoParentescoPorId().ejecutar(apoderadoId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el apoderado');
      }
      form.setFieldsValue(mapApoderadoToFormValues(result.data?.tipoParentesco ?? result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el apoderado');
    } finally {
      setLoading(false);
    }
  }, [form, isEditMode, isInvalidEditId, apoderadoId]);

  useEffect(() => {
    loadApoderado();
  }, [loadApoderado]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToApoderadoPayload(values);
      const useCase = isEditMode
        ? useCasesFactory.actualizarTipoParentesco()
        : useCasesFactory.crearTipoParentesco();
      const result = isEditMode
        ? await useCase.ejecutar(apoderadoId, payload)
        : await useCase.ejecutar(payload);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo guardar el apoderado');
      }
      notification.success({
        title: isEditMode ? 'Apoderado actualizado' : 'Apoderado creado',
      });
      const raw = result.data?.tipoParentesco ?? result.data;
      const savedId = raw?.id ?? apoderadoId;
      if (savedId) {
        navigate(apoderadoDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar el apoderado';
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
    apoderadoId,
    notification,
    navigate,
    menuSidebarKey,
    returnListPath,
  ]);

  const initialValues = useMemo(() => mapApoderadoToFormValues(null), []);
  const formSections = useMemo(() => createApoderadoFormSections(), []);

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
