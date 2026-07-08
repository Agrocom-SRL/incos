/**
 * Orquestación ABM tipo de evaluación (página completa crear/editar).
 * Gemelo de `useIdiomaForm.js`; agrega `descripcion` (textarea) y
 * `esRecuperatorio` (switch). El "componente" (teórico/práctico) NO vive en
 * este catálogo — vive en la tabla `evaluaciones`, no se agrega aquí.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCasesFactory } from '@container';
import {
  mapTipoEvaluacionToFormValues,
  mapFormValuesToTipoEvaluacionPayload,
} from '@application-configuracion/recursos/mappers';
import {
  TIPOS_EVALUACION_LIST_PATH,
  tipoEvaluacionDetallePath,
} from '@application-configuracion/recursos/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/recursos/config/navigation';

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

const createTipoEvaluacionFormSections = () => ({
  datosTipoEvaluacion: {
    title: 'Datos del tipo de evaluación',
    description:
      'Catálogo de tipos de evaluación (parciales, prácticas, exámenes...) usado por el cuaderno de calificaciones. El estado activo se asigna al crear; la activación/desactivación se gestiona desde el listado.',
    fields: [
      {
        name: 'codigo',
        label: 'Código',
        type: 'input',
        required: true,
        span: 8,
        placeholder: 'Ej. PARCIAL_1, EXAMEN_FINAL',
        maxLength: 40,
      },
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'input',
        required: true,
        span: 16,
        placeholder: 'Ej. Primer parcial',
        maxLength: 100,
        rules: [MIN_TEXT],
      },
      {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 2000,
        placeholder: 'Detalle u observación del tipo de evaluación (opcional)',
      },
      {
        name: 'esRecuperatorio',
        label: 'Es recuperatorio',
        type: 'switch',
        span: 8,
      },
    ],
  },
});

export const useTipoEvaluacionForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const tipoEvaluacionId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const returnListPath = resolveReturnListPath(location, TIPOS_EVALUACION_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar tipo de evaluación' : 'Nuevo tipo de evaluación';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(tipoEvaluacionId) || tipoEvaluacionId < 1);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Recursos académicos', href: returnListPath },
      { title: 'Tipos de evaluación', href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath],
  );

  const loadTipoEvaluacion = useCallback(async () => {
    if (!isEditMode) {
      form.setFieldsValue(mapTipoEvaluacionToFormValues(null));
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
      const result = await useCasesFactory.obtenerTipoEvaluacionPorId().ejecutar(tipoEvaluacionId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el tipo de evaluación');
      }
      form.setFieldsValue(mapTipoEvaluacionToFormValues(result.data?.tipoEvaluacion ?? result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el tipo de evaluación');
    } finally {
      setLoading(false);
    }
  }, [form, isEditMode, isInvalidEditId, tipoEvaluacionId]);

  useEffect(() => {
    loadTipoEvaluacion();
  }, [loadTipoEvaluacion]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToTipoEvaluacionPayload(values);
      const useCase = isEditMode
        ? useCasesFactory.actualizarTipoEvaluacion()
        : useCasesFactory.crearTipoEvaluacion();
      const result = isEditMode
        ? await useCase.ejecutar(tipoEvaluacionId, payload)
        : await useCase.ejecutar(payload);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo guardar el tipo de evaluación');
      }
      notification.success({
        title: isEditMode ? 'Tipo de evaluación actualizado' : 'Tipo de evaluación creado',
      });
      const raw = result.data?.tipoEvaluacion ?? result.data;
      const savedId = raw?.id ?? tipoEvaluacionId;
      if (savedId) {
        navigate(tipoEvaluacionDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar el tipo de evaluación';
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
    tipoEvaluacionId,
    notification,
    navigate,
    menuSidebarKey,
    returnListPath,
  ]);

  const initialValues = useMemo(() => mapTipoEvaluacionToFormValues(null), []);
  const formSections = useMemo(() => createTipoEvaluacionFormSections(), []);

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
