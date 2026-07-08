/**
 * Orquestación ABM idioma (página completa crear/editar).
 * Gemelo de `useDiscapacidadForm.js`; usa `codigoIso` en vez de `descripcion`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCasesFactory } from '@container';
import {
  mapIdiomaToFormValues,
  mapFormValuesToIdiomaPayload,
} from '@application-configuracion/complementarios/mappers';
import {
  IDIOMAS_LIST_PATH,
  idiomaDetallePath,
} from '@application-configuracion/complementarios/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/complementarios/config/navigation';

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

const createIdiomaFormSections = () => ({
  datosIdioma: {
    title: 'Datos del idioma',
    description:
      'Catálogo de idiomas del instituto. El estado activo se asigna al crear; la activación/desactivación se gestiona desde el listado.',
    fields: [
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. Español, Inglés, Quechua',
        maxLength: 255,
        rules: [MIN_TEXT],
      },
      {
        name: 'codigoIso',
        label: 'Código ISO',
        type: 'input',
        span: 12,
        placeholder: 'Ej. ES, EN, QU',
        maxLength: 10,
        extra: 'Código ISO 639 del idioma (opcional).',
      },
    ],
  },
});

export const useIdiomaForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const idiomaId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const returnListPath = resolveReturnListPath(location, IDIOMAS_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar idioma' : 'Nuevo idioma';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(idiomaId) || idiomaId < 1);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Complementarios', href: returnListPath },
      { title: 'Idiomas', href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath],
  );

  const loadIdioma = useCallback(async () => {
    if (!isEditMode) {
      form.setFieldsValue(mapIdiomaToFormValues(null));
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
      const result = await useCasesFactory.obtenerIdiomaPorId().ejecutar(idiomaId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el idioma');
      }
      form.setFieldsValue(mapIdiomaToFormValues(result.data?.idioma ?? result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el idioma');
    } finally {
      setLoading(false);
    }
  }, [form, isEditMode, isInvalidEditId, idiomaId]);

  useEffect(() => {
    loadIdioma();
  }, [loadIdioma]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToIdiomaPayload(values);
      const useCase = isEditMode
        ? useCasesFactory.actualizarIdioma()
        : useCasesFactory.crearIdioma();
      const result = isEditMode
        ? await useCase.ejecutar(idiomaId, payload)
        : await useCase.ejecutar(payload);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo guardar el idioma');
      }
      notification.success({
        title: isEditMode ? 'Idioma actualizado' : 'Idioma creado',
      });
      const raw = result.data?.idioma ?? result.data;
      const savedId = raw?.id ?? idiomaId;
      if (savedId) {
        navigate(idiomaDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar el idioma';
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
    idiomaId,
    notification,
    navigate,
    menuSidebarKey,
    returnListPath,
  ]);

  const initialValues = useMemo(() => mapIdiomaToFormValues(null), []);
  const formSections = useMemo(() => createIdiomaFormSections(), []);

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
