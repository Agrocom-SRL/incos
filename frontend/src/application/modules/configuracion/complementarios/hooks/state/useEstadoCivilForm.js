/**
 * Orquestación ABM estado civil (página completa crear/editar).
 * Gemelo de `useIdiomaForm.js`; usa `abreviatura` en vez de `codigoIso`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCasesFactory } from '@container';
import {
  mapEstadoCivilToFormValues,
  mapFormValuesToEstadoCivilPayload,
} from '@application-configuracion/complementarios/mappers';
import {
  ESTADOS_CIVILES_LIST_PATH,
  estadoCivilDetallePath,
} from '@application-configuracion/complementarios/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/complementarios/config/navigation';

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

const createEstadoCivilFormSections = () => ({
  datosEstadoCivil: {
    title: 'Datos del estado civil',
    description:
      'Catálogo de estados civiles del instituto. El estado activo se asigna al crear; la activación/desactivación se gestiona desde el listado.',
    fields: [
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. Soltero(a), Casado(a), Viudo(a)',
        maxLength: 20,
        rules: [MIN_TEXT],
      },
      {
        name: 'abreviatura',
        label: 'Abreviatura',
        type: 'input',
        span: 12,
        placeholder: 'Ej. SOL, CAS, VIU',
        maxLength: 5,
        extra: 'Abreviatura corta del estado civil (opcional).',
      },
    ],
  },
});

export const useEstadoCivilForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const estadoCivilId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const returnListPath = resolveReturnListPath(location, ESTADOS_CIVILES_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar estado civil' : 'Nuevo estado civil';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(estadoCivilId) || estadoCivilId < 1);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Complementarios', href: returnListPath },
      { title: 'Estados civiles', href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath],
  );

  const loadEstadoCivil = useCallback(async () => {
    if (!isEditMode) {
      form.setFieldsValue(mapEstadoCivilToFormValues(null));
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
      const result = await useCasesFactory.obtenerEstadoCivilPorId().ejecutar(estadoCivilId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el estado civil');
      }
      form.setFieldsValue(mapEstadoCivilToFormValues(result.data?.estadoCivil ?? result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el estado civil');
    } finally {
      setLoading(false);
    }
  }, [form, isEditMode, isInvalidEditId, estadoCivilId]);

  useEffect(() => {
    loadEstadoCivil();
  }, [loadEstadoCivil]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToEstadoCivilPayload(values);
      const useCase = isEditMode
        ? useCasesFactory.actualizarEstadoCivil()
        : useCasesFactory.crearEstadoCivil();
      const result = isEditMode
        ? await useCase.ejecutar(estadoCivilId, payload)
        : await useCase.ejecutar(payload);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo guardar el estado civil');
      }
      notification.success({
        title: isEditMode ? 'Estado civil actualizado' : 'Estado civil creado',
      });
      const raw = result.data?.estadoCivil ?? result.data;
      const savedId = raw?.id ?? estadoCivilId;
      if (savedId) {
        navigate(estadoCivilDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar el estado civil';
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
    estadoCivilId,
    notification,
    navigate,
    menuSidebarKey,
    returnListPath,
  ]);

  const initialValues = useMemo(() => mapEstadoCivilToFormValues(null), []);
  const formSections = useMemo(() => createEstadoCivilFormSections(), []);

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
