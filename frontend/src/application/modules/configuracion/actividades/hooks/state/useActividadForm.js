/**
 * Orquestación ABM actividad (página completa crear/editar). Gemelo de
 * `academico/hooks/state/useMateriaForm.js`. Campo `icono` es un selector
 * visual (grilla de íconos AntD vía `ACTIVIDAD_ICON_MAP`); guarda el string
 * kebab-case elegido, mismo shape de dato que antes.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCasesFactory } from '@container';
import {
  mapActividadToFormValues,
  mapFormValuesToActividadPayload,
} from '@application-configuracion/actividades/mappers';
import {
  ACTIVIDADES_BASE,
  actividadDetallePath,
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/actividades/config/paths';
import { TIPOS_ACTIVIDAD_OPTIONS } from '@application-configuracion/actividades/config/actividadTipoConstants';

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

const createActividadFormSections = () => ({
  datosActividad: {
    title: 'Datos de la actividad',
    description:
      'Catálogo maestro de actividades reutilizable entre gestiones (cronograma académico). El estado activo se asigna al crear; la activación/desactivación se gestiona desde el listado.',
    fields: [
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. Presentación de notas del 1er bimestre',
        maxLength: 255,
        rules: [MIN_TEXT],
      },
      {
        name: 'tipo',
        label: 'Tipo',
        type: 'select',
        required: true,
        span: 12,
        placeholder: 'Seleccione…',
        options: TIPOS_ACTIVIDAD_OPTIONS,
        allowClear: true,
      },
      {
        name: 'icono',
        label: 'Icono',
        type: 'iconPicker',
        span: 12,
        helperText: 'Se guarda el nombre del ícono seleccionado; se usa como referencia visual en las actividades del cronograma.',
      },
      {
        name: 'esDestacada',
        label: '¿Es destacada?',
        type: 'switch',
        span: 12,
        checkedChildren: 'Sí',
        unCheckedChildren: 'No',
      },
      {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        span: 24,
        rows: 4,
        placeholder: 'Descripción de la actividad (opcional)',
      },
    ],
  },
});

export const useActividadForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const actividadId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const returnListPath = resolveReturnListPath(location, ACTIVIDADES_BASE);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar actividad' : 'Nueva actividad';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(actividadId) || actividadId < 1);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Actividades', href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath],
  );

  const loadActividad = useCallback(async () => {
    if (!isEditMode) {
      form.setFieldsValue(mapActividadToFormValues(null));
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
      const result = await useCasesFactory.obtenerActividadPorId().ejecutar(actividadId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar la actividad');
      }
      form.setFieldsValue(mapActividadToFormValues(result.data?.actividad ?? result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar la actividad');
    } finally {
      setLoading(false);
    }
  }, [form, isEditMode, isInvalidEditId, actividadId]);

  useEffect(() => {
    loadActividad();
  }, [loadActividad]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToActividadPayload(values);
      const useCase = isEditMode
        ? useCasesFactory.actualizarActividad()
        : useCasesFactory.crearActividad();
      const result = isEditMode
        ? await useCase.ejecutar(actividadId, payload)
        : await useCase.ejecutar(payload);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo guardar la actividad');
      }
      notification.success({
        title: isEditMode ? 'Actividad actualizada' : 'Actividad creada',
      });
      const raw = result.data?.actividad ?? result.data;
      const savedId = raw?.id ?? actividadId;
      if (savedId) {
        navigate(actividadDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar la actividad';
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
    actividadId,
    notification,
    navigate,
    menuSidebarKey,
    returnListPath,
  ]);

  const initialValues = useMemo(() => mapActividadToFormValues(null), []);
  const formSections = useMemo(() => createActividadFormSections(), []);

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
