/**
 * Orquestación ABM aula (página completa crear/editar).
 * Gemelo de `useIdiomaForm.js`; agrega `categoria` (select), `capacidad`
 * (number) y `observaciones` (textarea) — no tiene columna `descripcion`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCasesFactory } from '@container';
import {
  mapAulaToFormValues,
  mapFormValuesToAulaPayload,
} from '@application-configuracion/recursos/mappers';
import { AULAS_LIST_PATH, aulaDetallePath } from '@application-configuracion/recursos/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/recursos/config/navigation';
import { AULA_CATEGORIA_OPTIONS } from '@application-configuracion/recursos/config/aulaCategoriaOptions';

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

const createAulaFormSections = () => ({
  datosAula: {
    title: 'Datos del aula',
    description:
      'Catálogo maestro de espacios físicos (aulas, laboratorios, talleres y auditorios) usado al armar la oferta de cursos.',
    fields: [
      {
        name: 'codigo',
        label: 'Código',
        type: 'input',
        required: true,
        span: 8,
        placeholder: 'Ej. LAB-1, AULA-201',
        maxLength: 20,
      },
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'input',
        required: true,
        span: 16,
        placeholder: 'Ej. Laboratorio de Redes',
        maxLength: 100,
        rules: [MIN_TEXT],
      },
      {
        name: 'categoria',
        label: 'Categoría',
        type: 'select',
        required: true,
        span: 8,
        options: AULA_CATEGORIA_OPTIONS,
        placeholder: 'Seleccione una categoría',
      },
      {
        name: 'capacidad',
        label: 'Capacidad',
        type: 'number',
        span: 8,
        min: 0,
        placeholder: 'N.º de estudiantes',
        addonAfter: 'personas',
      },
      {
        name: 'observaciones',
        label: 'Observaciones',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 2000,
        placeholder: 'Equipamiento, restricciones u otras notas (opcional)',
      },
    ],
  },
});

export const useAulaForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const aulaId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const returnListPath = resolveReturnListPath(location, AULAS_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar aula' : 'Nueva aula';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(aulaId) || aulaId < 1);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Recursos académicos', href: returnListPath },
      { title: 'Aulas', href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath],
  );

  const loadAula = useCallback(async () => {
    if (!isEditMode) {
      form.setFieldsValue(mapAulaToFormValues(null));
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
      const result = await useCasesFactory.obtenerAulaPorId().ejecutar(aulaId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el aula');
      }
      form.setFieldsValue(mapAulaToFormValues(result.data?.aula ?? result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el aula');
    } finally {
      setLoading(false);
    }
  }, [form, isEditMode, isInvalidEditId, aulaId]);

  useEffect(() => {
    loadAula();
  }, [loadAula]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToAulaPayload(values);
      const useCase = isEditMode ? useCasesFactory.actualizarAula() : useCasesFactory.crearAula();
      const result = isEditMode
        ? await useCase.ejecutar(aulaId, payload)
        : await useCase.ejecutar(payload);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo guardar el aula');
      }
      notification.success({
        title: isEditMode ? 'Aula actualizada' : 'Aula creada',
      });
      const raw = result.data?.aula ?? result.data;
      const savedId = raw?.id ?? aulaId;
      if (savedId) {
        navigate(aulaDetallePath(savedId), {
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
        const msg = e?.message || 'No se pudo guardar el aula';
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
    aulaId,
    notification,
    navigate,
    menuSidebarKey,
    returnListPath,
  ]);

  const initialValues = useMemo(() => mapAulaToFormValues(null), []);
  const formSections = useMemo(() => createAulaFormSections(), []);

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
